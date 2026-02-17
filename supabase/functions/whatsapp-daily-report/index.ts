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
  parcelas: number;
}

interface CategoryBudget {
  categoria_nome: string;
  categoria_tipo: string;
  orcamento: number;
}

// Categorias que devem aparecer no relatório WhatsApp
const categoriasRelatorio = [
  "Aplicativos e restaurantes",
  "Casa",
  "Compras da Bruna",
  "Compras do Marco",
];

declare const EdgeRuntime: { waitUntil(promise: Promise<unknown>): void };

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    let forceTest = url.searchParams.get('force') === 'true' || url.searchParams.get('sendNow') === 'true';
    
    if (!forceTest && req.method === 'POST') {
      try {
        const body = await req.json();
        if (body?.force === true || body?.sendNow === true) {
          forceTest = true;
        }
      } catch { /* body não é JSON, ignorar */ }
    }

    console.log('[DailyReport] Iniciando envio de relatórios...', forceTest ? '(TESTE MANUAL)' : '');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();
    const brasiliaHour = (now.getUTCHours() - 3 + 24) % 24;
    const dayOfWeek = now.getDay();

    console.log(`[DailyReport] Hora de Brasília: ${brasiliaHour}h, Dia da semana: ${dayOfWeek}`);

    let users: WhatsAppUser[] = [];

    if (forceTest) {
      const { data, error } = await supabase
        .from('whatsapp_finance_users')
        .select('usuario_id, phone_number, report_frequency, report_hour')
        .eq('is_active', true)
        .neq('report_frequency', 'none');
      
      if (error) throw error;
      users = data || [];
      console.log(`[DailyReport] TESTE MANUAL: ${users.length} usuários encontrados`);
    } else {
      const { data, error } = await supabase
        .from('whatsapp_finance_users')
        .select('usuario_id, phone_number, report_frequency, report_hour')
        .eq('is_active', true)
        .eq('report_hour', brasiliaHour)
        .neq('report_frequency', 'none');

      if (error) throw error;
      users = data || [];
    }

    if (!users || users.length === 0) {
      console.log('[DailyReport] Nenhum usuário para enviar relatório agora');
      return new Response(
        JSON.stringify({ message: 'Nenhum relatório para enviar', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const usersToNotify = forceTest ? users : users.filter((user: WhatsAppUser) => {
      if (user.report_frequency === 'daily') return true;
      if (user.report_frequency === 'weekly' && dayOfWeek === 1) return true;
      return false;
    });

    console.log(`[DailyReport] ${usersToNotify.length} usuários para notificar`);

    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioWhatsappNumber = Deno.env.get('TWILIO_WHATSAPP_NUMBER');
    const templateContentSid = 'HXc1eae1d4aa2b65949a272d3e1d266170';

    if (!twilioAccountSid || !twilioAuthToken || !twilioWhatsappNumber) {
      console.error('[DailyReport] Credenciais Twilio não configuradas');
      throw new Error('Credenciais Twilio não configuradas');
    }

    // Processar em background usando EdgeRuntime.waitUntil
    const backgroundProcess = processAllUsers(
      supabase, usersToNotify, twilioAccountSid, twilioAuthToken, twilioWhatsappNumber, templateContentSid
    );

    EdgeRuntime.waitUntil(backgroundProcess);

    // Retornar imediatamente
    return new Response(
      JSON.stringify({ 
        message: 'Relatórios iniciados em background',
        users: usersToNotify.length
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

async function processAllUsers(
  supabase: any,
  usersToNotify: WhatsAppUser[],
  twilioAccountSid: string,
  twilioAuthToken: string,
  twilioWhatsappNumber: string,
  templateContentSid: string
) {
  let successCount = 0;
  let errorCount = 0;
  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
  const authHeader = btoa(`${twilioAccountSid}:${twilioAuthToken}`);

  for (const user of usersToNotify) {
    try {
      // 1. Enviar template (abre janela de 72h)
      const templateFormData = new URLSearchParams();
      templateFormData.append('From', `whatsapp:${twilioWhatsappNumber}`);
      templateFormData.append('To', `whatsapp:+${user.phone_number}`);
      templateFormData.append('ContentSid', templateContentSid);

      const templateResponse = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: templateFormData.toString()
      });

      if (!templateResponse.ok) {
        const errorText = await templateResponse.text();
        console.error(`[DailyReport] Erro ao enviar template para ${user.phone_number}:`, errorText);
        errorCount++;
        continue;
      }

      const templateBody = await templateResponse.text();
      console.log(`[DailyReport] Template enviado para ${user.phone_number}, status: ${templateResponse.status}`);

      // Delay de 3s para garantir que a janela foi aberta
      await new Promise(resolve => setTimeout(resolve, 3000));

      // 2. Gerar e enviar relatório
      console.log(`[DailyReport] Gerando relatório para ${user.phone_number}...`);
      const report = await generateReport(supabase, user.usuario_id);
      console.log(`[DailyReport] Relatório gerado, enviando para ${user.phone_number}...`);
      
      const reportFormData = new URLSearchParams();
      reportFormData.append('From', `whatsapp:${twilioWhatsappNumber}`);
      reportFormData.append('To', `whatsapp:+${user.phone_number}`);
      reportFormData.append('Body', report);

      const reportResponse = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: reportFormData.toString()
      });

      const reportBody = await reportResponse.text();
      if (reportResponse.ok) {
        console.log(`[DailyReport] Relatório enviado para ${user.phone_number}, status: ${reportResponse.status}`);
        successCount++;
      } else {
        console.error(`[DailyReport] FALHA ao enviar relatório para ${user.phone_number}, status: ${reportResponse.status}, response: ${reportBody.substring(0, 300)}`);
        errorCount++;
      }

    } catch (error) {
      console.error(`[DailyReport] Erro ao processar usuário ${user.phone_number}:`, error);
      errorCount++;
    }
  }

  console.log(`[DailyReport] Background concluído: ${successCount} sucesso, ${errorCount} erros`);
}

// Calcula o ciclo financeiro atual (dia 25 a dia 24 do próximo mês)
function getCurrentCycle(): { inicio: Date; fim: Date; nome: string } {
  const hoje = new Date();
  let inicio: Date;
  let fim: Date;

  if (hoje.getDate() >= 25) {
    inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 25);
    fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 24);
  } else {
    inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 25);
    fim = new Date(hoje.getFullYear(), hoje.getMonth(), 24);
  }

  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const nome = `${meses[inicio.getMonth()]}/${meses[fim.getMonth()]} ${fim.getFullYear()}`;

  return { inicio, fim, nome };
}

async function generateReport(supabase: any, usuarioId: string): Promise<string> {
  const ciclo = getCurrentCycle();

  const { data: transacoesCiclo } = await supabase
    .from('lancamentos')
    .select('*')
    .eq('usuario_id', usuarioId)
    .gte('data', ciclo.inicio.toISOString().split('T')[0])
    .lte('data', ciclo.fim.toISOString().split('T')[0]);

  const dataLimiteAnterior = new Date(ciclo.inicio);
  dataLimiteAnterior.setMonth(dataLimiteAnterior.getMonth() - 12);
  
  const { data: transacoesParceladas } = await supabase
    .from('lancamentos')
    .select('*')
    .eq('usuario_id', usuarioId)
    .gt('parcelas', 1)
    .lt('data', ciclo.inicio.toISOString().split('T')[0])
    .gte('data', dataLimiteAnterior.toISOString().split('T')[0]);

  const parcelasDoCiclo: Array<{ categoria: string; tipo: string; valor: number }> = [];
  
  (transacoesParceladas || []).forEach((t: Transacao) => {
    const dataTransacao = new Date(t.data);
    const valorAbsoluto = Math.abs(Number(t.valor));
    
    for (let i = 2; i <= t.parcelas; i++) {
      const dataParcela = new Date(dataTransacao);
      dataParcela.setMonth(dataTransacao.getMonth() + (i - 1));
      
      const ultimoDiaDoMes = new Date(dataParcela.getFullYear(), dataParcela.getMonth() + 1, 0).getDate();
      if (dataParcela.getDate() > ultimoDiaDoMes) {
        dataParcela.setDate(ultimoDiaDoMes);
      }
      
      if (dataParcela >= ciclo.inicio && dataParcela <= ciclo.fim) {
        parcelasDoCiclo.push({
          categoria: t.categoria,
          tipo: t.tipo,
          valor: valorAbsoluto
        });
      }
    }
  });

  const { data: customBudgets } = await supabase
    .from('category_budgets')
    .select('categoria_nome, categoria_tipo, orcamento')
    .eq('usuario_id', usuarioId);

  const orcamentosMap: Record<string, number> = {};
  (customBudgets || []).forEach((cb: CategoryBudget) => {
    orcamentosMap[cb.categoria_nome] = Number(cb.orcamento);
  });

  let totalReceitas = 0;
  let totalDespesas = 0;
  const gastosPorCategoria: Record<string, number> = {};

  (transacoesCiclo || []).forEach((t: Transacao) => {
    const valor = Math.abs(Number(t.valor));
    
    if (t.tipo === 'receita') {
      totalReceitas += valor;
    } else if (t.tipo === 'despesa') {
      totalDespesas += valor;
      gastosPorCategoria[t.categoria] = (gastosPorCategoria[t.categoria] || 0) + valor;
    }
  });

  parcelasDoCiclo.forEach(parcela => {
    if (parcela.tipo === 'receita') {
      totalReceitas += parcela.valor;
    } else if (parcela.tipo === 'despesa') {
      totalDespesas += parcela.valor;
      gastosPorCategoria[parcela.categoria] = (gastosPorCategoria[parcela.categoria] || 0) + parcela.valor;
    }
  });

  const saldo = totalReceitas - totalDespesas;

  // Filtrar apenas categorias selecionadas
  const categoriasTexto = categoriasRelatorio.map(nome => {
    const gasto = gastosPorCategoria[nome] || 0;
    const orcamento = orcamentosMap[nome] || 0;
    const percentual = orcamento > 0 ? Math.round((gasto / orcamento) * 100) : 0;
    return `${nome}: R$${gasto.toFixed(0)} de R$${orcamento.toFixed(0)} (${percentual}%)`;
  }).join('\n');

  return `Resumo do Ciclo\nSaldo: R$${saldo.toFixed(2)}\n\n${categoriasTexto}`;
}
