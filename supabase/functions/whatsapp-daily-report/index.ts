import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WhatsAppUser {
  usuario_id: string;
  phone_number: string;
  report_frequency: string;
  report_hour: number;
}

interface Transacao {
  id: number;
  data: string;
  categoria: string;
  valor: number;
  tipo: string;
  descricao: string | null;
  quem_gastou: string;
}

interface CategoryBudget {
  categoria_nome: string;
  categoria_tipo: string;
  orcamento: number;
}

// Categorias padrão com orçamentos default
const categoriasDefault = [
  { nome: "Supermercado", tipo: "despesa", orcamento: 2300 },
  { nome: "Pets", tipo: "despesa", orcamento: 450 },
  { nome: "Casa", tipo: "despesa", orcamento: 900 },
  { nome: "Transporte", tipo: "despesa", orcamento: 600 },
  { nome: "Lazer", tipo: "despesa", orcamento: 200 },
  { nome: "Saúde", tipo: "despesa", orcamento: 300 },
  { nome: "Presentes", tipo: "despesa", orcamento: 200 },
  { nome: "Delivery", tipo: "despesa", orcamento: 400 },
  { nome: "Cartão de Crédito Marco", tipo: "despesa", orcamento: 600 },
  { nome: "Cartão de Crédito Bruna", tipo: "despesa", orcamento: 500 },
  { nome: "Educação", tipo: "despesa", orcamento: 250 },
  { nome: "Doações", tipo: "despesa", orcamento: 200 },
  { nome: "Outros", tipo: "despesa", orcamento: 200 },
  { nome: "Salário Marco", tipo: "receita", orcamento: 10500 },
  { nome: "Salário Bruna", tipo: "receita", orcamento: 5200 },
  { nome: "Renda Extra", tipo: "receita", orcamento: 500 },
  { nome: "Investimentos", tipo: "investimento", orcamento: 5000 },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[DailyReport] Iniciando envio de relatórios...');

    // Inicializar Supabase client com service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Obter hora atual (UTC-3 para Brasília)
    const now = new Date();
    const brasiliaHour = (now.getUTCHours() - 3 + 24) % 24;
    const dayOfWeek = now.getDay(); // 0 = Domingo

    console.log(`[DailyReport] Hora de Brasília: ${brasiliaHour}h, Dia da semana: ${dayOfWeek}`);

    // Buscar usuários que devem receber relatório agora
    const { data: users, error: usersError } = await supabase
      .from('whatsapp_finance_users')
      .select('usuario_id, phone_number, report_frequency, report_hour')
      .eq('is_active', true)
      .eq('report_hour', brasiliaHour)
      .neq('report_frequency', 'none');

    if (usersError) {
      console.error('[DailyReport] Erro ao buscar usuários:', usersError);
      throw usersError;
    }

    if (!users || users.length === 0) {
      console.log('[DailyReport] Nenhum usuário para enviar relatório agora');
      return new Response(
        JSON.stringify({ message: 'Nenhum relatório para enviar', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Filtrar por frequência
    const usersToNotify = users.filter((user: WhatsAppUser) => {
      if (user.report_frequency === 'daily') return true;
      if (user.report_frequency === 'weekly' && dayOfWeek === 1) return true; // Segunda-feira
      return false;
    });

    console.log(`[DailyReport] ${usersToNotify.length} usuários para notificar`);

    const healthWebhookUrl = Deno.env.get('HEALTH_WEBHOOK_URL');
    if (!healthWebhookUrl) {
      console.error('[DailyReport] HEALTH_WEBHOOK_URL não configurada');
      throw new Error('HEALTH_WEBHOOK_URL não configurada');
    }

    let successCount = 0;
    let errorCount = 0;

    // Processar cada usuário
    for (const user of usersToNotify) {
      try {
        const report = await generateReport(supabase, user.usuario_id);
        
        // Enviar para o webhook do projeto Saúde
        const webhookResponse = await fetch(healthWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': Deno.env.get('FINANCE_API_KEY') || ''
          },
          body: JSON.stringify({
            phone: user.phone_number,
            message: report,
            source: 'finance-daily-report'
          })
        });

        if (webhookResponse.ok) {
          console.log(`[DailyReport] Relatório enviado para ${user.phone_number}`);
          successCount++;
        } else {
          const errorText = await webhookResponse.text();
          console.error(`[DailyReport] Erro ao enviar para ${user.phone_number}:`, errorText);
          errorCount++;
        }

      } catch (error) {
        console.error(`[DailyReport] Erro ao processar usuário ${user.phone_number}:`, error);
        errorCount++;
      }
    }

    console.log(`[DailyReport] Concluído: ${successCount} sucesso, ${errorCount} erros`);

    return new Response(
      JSON.stringify({ 
        message: 'Relatórios processados',
        success: successCount,
        errors: errorCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[DailyReport] Erro:', error);
    return new Response(
      JSON.stringify({ error: 'Erro ao processar relatórios' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Calcula o ciclo financeiro atual (dia 7 a dia 6 do próximo mês)
function getCurrentCycle(): { inicio: Date; fim: Date; nome: string } {
  const hoje = new Date();
  let inicio: Date;
  let fim: Date;

  if (hoje.getDate() >= 7) {
    inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 7);
    fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 6);
  } else {
    inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 7);
    fim = new Date(hoje.getFullYear(), hoje.getMonth(), 6);
  }

  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const nome = `${meses[inicio.getMonth()]}/${meses[fim.getMonth()]} ${fim.getFullYear()}`;

  return { inicio, fim, nome };
}

async function generateReport(supabase: any, usuarioId: string): Promise<string> {
  const ciclo = getCurrentCycle();

  // Buscar transações do ciclo atual
  const { data: transacoes } = await supabase
    .from('lancamentos')
    .select('*')
    .eq('usuario_id', usuarioId)
    .gte('data', ciclo.inicio.toISOString().split('T')[0])
    .lte('data', ciclo.fim.toISOString().split('T')[0]);

  // Buscar orçamentos personalizados
  const { data: customBudgets } = await supabase
    .from('category_budgets')
    .select('categoria_nome, categoria_tipo, orcamento')
    .eq('usuario_id', usuarioId);

  // Calcular totais
  let totalReceitas = 0;
  let totalDespesas = 0;
  const gastosPorCategoria: Record<string, number> = {};

  (transacoes || []).forEach((t: Transacao) => {
    const valor = Math.abs(t.valor);
    
    if (t.tipo === 'receita') {
      totalReceitas += valor;
    } else if (t.tipo === 'despesa') {
      totalDespesas += valor;
    }

    if (t.tipo === 'despesa') {
      gastosPorCategoria[t.categoria] = (gastosPorCategoria[t.categoria] || 0) + valor;
    }
  });

  const saldo = totalReceitas - totalDespesas;

  // Montar status das categorias de despesa
  const categoriasDespesa = categoriasDefault
    .filter(c => c.tipo === 'despesa')
    .map(cat => {
      const customBudget = (customBudgets || []).find(
        (cb: CategoryBudget) => cb.categoria_nome === cat.nome && cb.categoria_tipo === cat.tipo
      );
      
      const orcamento = customBudget ? Number(customBudget.orcamento) : cat.orcamento;
      const gasto = gastosPorCategoria[cat.nome] || 0;
      const percentual = orcamento > 0 ? Math.round((gasto / orcamento) * 100) : 0;

      return { nome: cat.nome, orcamento, gasto, percentual };
    })
    .filter(c => c.gasto > 0 || c.orcamento > 0)
    .sort((a, b) => b.percentual - a.percentual);

  // Formatar mensagem
  const categoriasTexto = categoriasDespesa
    .slice(0, 10)
    .map(c => {
      const status = c.percentual > 100 ? '🔴' : c.percentual > 80 ? '🟡' : '🟢';
      return `${status} *${c.nome}*: R$ ${c.gasto.toFixed(0)} / R$ ${c.orcamento.toFixed(0)} (${c.percentual}%)`;
    })
    .join('\n');

  const saldoEmoji = saldo >= 0 ? '✅' : '⚠️';
  const dataRelatorio = new Date().toLocaleDateString('pt-BR');

  return `📊 *Relatório Financeiro*\n` +
    `📅 ${dataRelatorio}\n` +
    `Ciclo: ${ciclo.nome}\n\n` +
    `💰 *Resumo Geral*\n` +
    `Receitas: R$ ${totalReceitas.toFixed(2)}\n` +
    `Despesas: R$ ${totalDespesas.toFixed(2)}\n` +
    `${saldoEmoji} Saldo: R$ ${saldo.toFixed(2)}\n\n` +
    `📋 *Status das Categorias*\n\n` +
    `${categoriasTexto}\n\n` +
    `_🟢 OK | 🟡 Atenção | 🔴 Estourado_\n\n` +
    `Digite *ajuda* para ver comandos.`;
}
