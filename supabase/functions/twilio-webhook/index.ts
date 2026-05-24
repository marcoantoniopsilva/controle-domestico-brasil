import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

interface FinancialContext {
  cicloInicio: string;
  cicloFim: string;
  totalReceitas: number;
  totalDespesas: number;
  totalInvestimentos: number;
  saldo: number;
  categorias: Array<{
    nome: string;
    tipo: string;
    orcamento: number;
    gasto: number;
    percentual: number;
  }>;
}

// Categorias prioritárias que devem sempre aparecer nos relatórios
const categoriasPrioritarias = [
  "Aplicativos e restaurantes",
  "Supermercado", 
  "Casa",
  "Compras da Bruna",
  "Compras do Marco",
  "Estacionamento",
  "Farmácia",
  "Presentes/roupas Aurora"
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Twilio envia webhooks como application/x-www-form-urlencoded
    const formData = await req.formData();
    
    const from = formData.get('From')?.toString() || '';
    const body = formData.get('Body')?.toString() || '';
    const profileName = formData.get('ProfileName')?.toString() || 'Usuário';
    
    // Extrair número do formato whatsapp:+5531999999999
    const phone = from.replace('whatsapp:', '').replace(/\D/g, '');
    const messageText = body.trim();

    console.log(`[Twilio Webhook] Mensagem de ${profileName} (${phone}): ${messageText}`);

    if (!messageText) {
      console.log('[Twilio Webhook] Mensagem sem texto, ignorando');
      return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
        headers: { ...corsHeaders, 'Content-Type': 'text/xml' }
      });
    }

    // Inicializar Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar usuário pelo número de telefone
    const { data: whatsappUser, error: userError } = await supabase
      .from('whatsapp_finance_users')
      .select('usuario_id, is_active')
      .eq('phone_number', phone)
      .single();

    let responseText: string;

    if (userError || !whatsappUser) {
      console.log(`[Twilio Webhook] Usuário não encontrado para telefone: ${phone}`);
      responseText = `❌ Número não cadastrado.\n\nPara usar o assistente financeiro, cadastre seu número WhatsApp no aplicativo.\n\n📱 Acesse: https://controle-domestico-brasil.lovable.app`;
    } else if (!whatsappUser.is_active) {
      console.log(`[Twilio Webhook] Usuário inativo: ${phone}`);
      responseText = `⏸️ Suas notificações estão desativadas.\n\nPara reativar, acesse o app e ative as notificações na aba WhatsApp.`;
    } else {
      // Buscar contexto financeiro e processar mensagem
      const context = await getFinancialContext(supabase, whatsappUser.usuario_id);
      responseText = await processWithGemini(messageText, profileName, context);
    }

    // Retornar resposta via TwiML
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(responseText)}</Message>
</Response>`;

    return new Response(twiml, {
      headers: { ...corsHeaders, 'Content-Type': 'text/xml' }
    });

  } catch (error) {
    console.error('[Twilio Webhook] Erro:', error);
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'text/xml' } }
    );
  }
});

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Calcula o ciclo financeiro atual (dia 25 a dia 24 do próximo mês)
function getCurrentCycle(): { inicio: Date; fim: Date; nome: string } {
  const hoje = new Date();
  let inicio: Date;
  let fim: Date;

  if (hoje.getDate() >= 25) {
    // Se estamos no dia 25 ou depois, o ciclo começou neste mês
    inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 25);
    fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 24);
  } else {
    // Se estamos antes do dia 25, o ciclo começou no mês anterior
    inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 25);
    fim = new Date(hoje.getFullYear(), hoje.getMonth(), 24);
  }

  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const nome = `${meses[inicio.getMonth()]}/${meses[fim.getMonth()]} ${fim.getFullYear()}`;

  return { inicio, fim, nome };
}

async function getFinancialContext(supabase: any, usuarioId: string): Promise<FinancialContext> {
  const ciclo = getCurrentCycle();
  
  // Buscar transações do ciclo atual
  const { data: transacoesCiclo, error: transError } = await supabase
    .from('lancamentos')
    .select('*')
    .eq('usuario_id', usuarioId)
    .gte('data', ciclo.inicio.toISOString().split('T')[0])
    .lte('data', ciclo.fim.toISOString().split('T')[0]);

  if (transError) {
    console.error('[Twilio Webhook] Erro ao buscar transações do ciclo:', transError);
  }

  // Buscar transações parceladas de ciclos anteriores (até 12 meses atrás)
  const dataLimiteAnterior = new Date(ciclo.inicio);
  dataLimiteAnterior.setMonth(dataLimiteAnterior.getMonth() - 12);
  
  const { data: transacoesParceladas, error: parcelasError } = await supabase
    .from('lancamentos')
    .select('*')
    .eq('usuario_id', usuarioId)
    .gt('parcelas', 1)
    .lt('data', ciclo.inicio.toISOString().split('T')[0])
    .gte('data', dataLimiteAnterior.toISOString().split('T')[0]);

  if (parcelasError) {
    console.error('[Twilio Webhook] Erro ao buscar transações parceladas:', parcelasError);
  }

  // Calcular parcelas que devem aparecer no ciclo atual
  const parcelasDoCiclo: Array<{ categoria: string; tipo: string; valor: number }> = [];
  
  (transacoesParceladas || []).forEach((t: Transacao) => {
    const dataTransacao = new Date(t.data);
    const valorAbsoluto = Math.abs(Number(t.valor));
    
    // Para cada parcela (começando da 2ª, pois a 1ª já foi contada no ciclo original)
    for (let i = 2; i <= t.parcelas; i++) {
      const dataParcela = new Date(dataTransacao);
      dataParcela.setMonth(dataTransacao.getMonth() + (i - 1));
      
      // Ajustar o dia se necessário para evitar problemas com meses diferentes
      const ultimoDiaDoMes = new Date(dataParcela.getFullYear(), dataParcela.getMonth() + 1, 0).getDate();
      if (dataParcela.getDate() > ultimoDiaDoMes) {
        dataParcela.setDate(ultimoDiaDoMes);
      }
      
      // Verificar se esta parcela está dentro do ciclo atual
      if (dataParcela >= ciclo.inicio && dataParcela <= ciclo.fim) {
        console.log(`[Twilio Webhook] Parcela ${i}/${t.parcelas} de ${t.categoria} incluída no ciclo: R$ ${valorAbsoluto.toFixed(2)}`);
        parcelasDoCiclo.push({
          categoria: t.categoria,
          tipo: t.tipo,
          valor: valorAbsoluto
        });
      }
    }
  });

  console.log(`[Twilio Webhook] Total de parcelas de ciclos anteriores: ${parcelasDoCiclo.length}`);

  // Buscar orçamentos personalizados do usuário
  const { data: customBudgets, error: budgetError } = await supabase
    .from('category_budgets')
    .select('categoria_nome, categoria_tipo, orcamento')
    .eq('usuario_id', usuarioId);

  if (budgetError) {
    console.error('[Twilio Webhook] Erro ao buscar orçamentos:', budgetError);
  }

  // Criar mapa de orçamentos do usuário
  const orcamentosMap: Record<string, number> = {};
  (customBudgets || []).forEach((cb: CategoryBudget) => {
    const key = `${cb.categoria_nome}|${cb.categoria_tipo}`;
    orcamentosMap[key] = Number(cb.orcamento);
  });

  // Calcular totais - IMPORTANTE: usar Math.abs() para todos os valores
  let totalReceitas = 0;
  let totalDespesas = 0;
  let totalInvestimentos = 0;
  const gastosPorCategoria: Record<string, { gasto: number; tipo: string }> = {};

  // Processar transações do ciclo atual
  (transacoesCiclo || []).forEach((t: Transacao) => {
    const valorAbsoluto = Math.abs(Number(t.valor));
    
    if (t.tipo === 'receita') {
      totalReceitas += valorAbsoluto;
    } else if (t.tipo === 'despesa') {
      totalDespesas += valorAbsoluto;
    } else if (t.tipo === 'investimento') {
      totalInvestimentos += valorAbsoluto;
    }

    const key = `${t.categoria}|${t.tipo}`;
    if (!gastosPorCategoria[key]) {
      gastosPorCategoria[key] = { gasto: 0, tipo: t.tipo };
    }
    gastosPorCategoria[key].gasto += valorAbsoluto;
  });

  // Adicionar parcelas de ciclos anteriores aos totais
  parcelasDoCiclo.forEach(parcela => {
    if (parcela.tipo === 'receita') {
      totalReceitas += parcela.valor;
    } else if (parcela.tipo === 'despesa') {
      totalDespesas += parcela.valor;
    } else if (parcela.tipo === 'investimento') {
      totalInvestimentos += parcela.valor;
    }

    const key = `${parcela.categoria}|${parcela.tipo}`;
    if (!gastosPorCategoria[key]) {
      gastosPorCategoria[key] = { gasto: 0, tipo: parcela.tipo };
    }
    gastosPorCategoria[key].gasto += parcela.valor;
  });

  // Montar lista de categorias baseado nos gastos reais e orçamentos do banco
  const categoriasSet = new Set<string>();
  
  Object.keys(gastosPorCategoria).forEach(key => categoriasSet.add(key));
  Object.keys(orcamentosMap).forEach(key => categoriasSet.add(key));

  const categorias = Array.from(categoriasSet).map(key => {
    const [nome, tipo] = key.split('|');
    const gasto = gastosPorCategoria[key]?.gasto || 0;
    const orcamento = orcamentosMap[key] || 0;
    const percentual = orcamento > 0 ? Math.round((gasto / orcamento) * 100) : 0;

    return {
      nome,
      tipo,
      orcamento,
      gasto,
      percentual
    };
  });

  return {
    cicloInicio: ciclo.inicio.toLocaleDateString('pt-BR'),
    cicloFim: ciclo.fim.toLocaleDateString('pt-BR'),
    totalReceitas,
    totalDespesas,
    totalInvestimentos,
    saldo: totalReceitas - totalDespesas,
    categorias
  };
}

async function processWithGemini(message: string, userName: string, context: FinancialContext): Promise<string> {
  const geminiApiKey = Deno.env.get('GOOGLE_GEMINI_API_KEY');
  
  if (!geminiApiKey) {
    console.error('[Twilio Webhook] GOOGLE_GEMINI_API_KEY não configurada');
    return getDefaultResponse(message, userName, context);
  }

  // Montar contexto das categorias - priorizar categorias específicas
  const categoriasPrioritariasComGasto = context.categorias
    .filter(c => c.tipo === 'despesa' && categoriasPrioritarias.some(p => 
      c.nome.toLowerCase().includes(p.toLowerCase()) || p.toLowerCase().includes(c.nome.toLowerCase())
    ));
  
  const outrasCategoriasComGasto = context.categorias
    .filter(c => c.tipo === 'despesa' && c.gasto > 0 && !categoriasPrioritarias.some(p => 
      c.nome.toLowerCase().includes(p.toLowerCase()) || p.toLowerCase().includes(c.nome.toLowerCase())
    ))
    .sort((a, b) => b.gasto - a.gasto);

  const todasCategorias = [...categoriasPrioritariasComGasto, ...outrasCategoriasComGasto];
  
  const categoriasTexto = todasCategorias
    .map(c => {
      const status = c.percentual > 100 ? '🔴' : c.percentual > 80 ? '🟡' : '🟢';
      return `${status} ${c.nome}: R$ ${c.gasto.toFixed(2)} / R$ ${c.orcamento.toFixed(2)} (${c.percentual}%)`;
    })
    .join('\n');

  const systemPrompt = `Você é um assistente financeiro pessoal chamado "Plenna".
Responda de forma amigável e concisa em português brasileiro.
Use emojis apropriados para tornar a conversa mais agradável.
Formate para WhatsApp (use *negrito* para destacar valores e títulos).
Seja direto e objetivo nas respostas.

CONTEXTO FINANCEIRO ATUAL DO USUÁRIO ${userName}:
- Ciclo atual: ${context.cicloInicio} a ${context.cicloFim}
- Total de Receitas: R$ ${context.totalReceitas.toFixed(2)}
- Total de Despesas: R$ ${context.totalDespesas.toFixed(2)}
- Total de Investimentos: R$ ${context.totalInvestimentos.toFixed(2)}
- Saldo (Receitas - Despesas): R$ ${context.saldo.toFixed(2)}

STATUS DAS CATEGORIAS DE DESPESA:
${categoriasTexto || 'Nenhum gasto registrado ainda neste ciclo.'}

INSTRUÇÕES:
- Quando perguntarem sobre gastos, metas ou orçamento, use os dados acima
- Para registrar gastos, informe que devem acessar o app (ainda não suportamos registro via WhatsApp)
- Dê dicas de economia quando apropriado
- Se a pergunta não for sobre finanças, responda educadamente que você é especializado em finanças`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nMensagem do usuário: ${message}` }]
            }
          ],
          generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.7
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Twilio Webhook] Erro Gemini:', response.status, errorText);
      return getDefaultResponse(message, userName, context);
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponse) {
      console.error('[Twilio Webhook] Resposta Gemini vazia');
      return getDefaultResponse(message, userName, context);
    }

    return aiResponse;

  } catch (error) {
    console.error('[Twilio Webhook] Erro ao chamar Gemini:', error);
    return getDefaultResponse(message, userName, context);
  }
}

function getDefaultResponse(message: string, userName: string, context: FinancialContext): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('ajuda') || lowerMessage === 'help') {
    return `💰 *Assistente Financeiro*\n\n` +
      `Olá ${userName}! Posso te ajudar com:\n\n` +
      `📊 *Ver resumo:* "como estão minhas finanças?"\n` +
      `📋 *Ver metas:* "como estão minhas metas?"\n` +
      `💳 *Ver saldo:* "qual meu saldo?"\n` +
      `📈 *Ver gastos:* "quanto gastei com supermercado?"\n\n` +
      `_Digite sua pergunta que eu respondo!_`;
  }

  if (lowerMessage.includes('resumo') || lowerMessage.includes('finanças') || lowerMessage.includes('financas')) {
    return `📊 *Resumo Financeiro*\n` +
      `Ciclo: ${context.cicloInicio} a ${context.cicloFim}\n\n` +
      `💰 Receitas: R$ ${context.totalReceitas.toFixed(2)}\n` +
      `💸 Despesas: R$ ${context.totalDespesas.toFixed(2)}\n` +
      `📈 Investimentos: R$ ${context.totalInvestimentos.toFixed(2)}\n` +
      `💵 Saldo: R$ ${context.saldo.toFixed(2)}\n\n` +
      `_Digite "metas" para ver o status das categorias._`;
  }

  if (lowerMessage.includes('meta') || lowerMessage.includes('categoria') || lowerMessage.includes('orçamento')) {
    const categoriasTexto = context.categorias
      .filter(c => c.tipo === 'despesa' && (c.gasto > 0 || c.orcamento > 0))
      .sort((a, b) => b.percentual - a.percentual)
      .slice(0, 8)
      .map(c => {
        const status = c.percentual > 100 ? '🔴' : c.percentual > 80 ? '🟡' : '🟢';
        return `${status} *${c.nome}*: R$ ${c.gasto.toFixed(0)} / R$ ${c.orcamento.toFixed(0)} (${c.percentual}%)`;
      })
      .join('\n');

    return `📋 *Status das Metas*\n` +
      `Ciclo: ${context.cicloInicio} a ${context.cicloFim}\n\n` +
      `${categoriasTexto || 'Nenhum gasto registrado ainda.'}\n\n` +
      `_🟢 Dentro do orçamento | 🟡 Atenção | 🔴 Estourado_`;
  }

  if (lowerMessage.includes('saldo')) {
    const emoji = context.saldo >= 0 ? '✅' : '⚠️';
    return `${emoji} *Seu saldo atual*\n\n` +
      `R$ ${context.saldo.toFixed(2)}\n\n` +
      `_(Receitas - Despesas do ciclo atual)_`;
  }

  return `💰 Olá ${userName}!\n\n` +
    `Sou seu assistente financeiro. Posso te ajudar com informações sobre seus gastos e metas.\n\n` +
    `Digite *ajuda* para ver os comandos disponíveis.`;
}
