import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

interface WhatsAppRequest {
  phone: string;
  message: string;
  userId: string;
  userName: string;
  mediaUrl?: string;
  mediaType?: string;
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validar API Key
    const apiKey = req.headers.get('x-api-key');
    const expectedKey = Deno.env.get('FINANCE_API_KEY');

    if (!apiKey || apiKey !== expectedKey) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload: WhatsAppRequest = await req.json();
    const { phone, message, userName } = payload;

    console.log(`[Finance] Mensagem de ${userName} (${phone}): ${message}`);

    // Inicializar Supabase client com service role para bypass de RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar usuário pelo número de telefone
    const { data: whatsappUser, error: userError } = await supabase
      .from('whatsapp_finance_users')
      .select('usuario_id')
      .eq('phone_number', phone)
      .single();

    if (userError || !whatsappUser) {
      console.log(`[Finance] Usuário não encontrado para telefone: ${phone}`);
      return new Response(
        JSON.stringify({ 
          response: `❌ Número não cadastrado.\n\nPara usar o assistente financeiro, cadastre seu número WhatsApp no aplicativo.\n\n📱 Acesse: https://plannerplenna.lovable.app` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const usuarioId = whatsappUser.usuario_id;

    // Buscar contexto financeiro
    const context = await getFinancialContext(supabase, usuarioId);

    // Processar mensagem com Gemini AI
    const response = await processWithGemini(message, userName, context);

    return new Response(
      JSON.stringify({ response }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Finance] Erro:', error);
    return new Response(
      JSON.stringify({ response: '❌ Ocorreu um erro ao processar sua mensagem. Tente novamente.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Calcula o ciclo financeiro atual com base no dia configurado pelo usuário
function getCurrentCycle(cycleStartDay = 25): { inicio: Date; fim: Date; nome: string } {
  const hoje = new Date();
  const startDay = Math.max(1, Math.min(28, cycleStartDay || 25));
  let inicio: Date;
  let fim: Date;

  if (hoje.getDate() >= startDay) {
    inicio = new Date(hoje.getFullYear(), hoje.getMonth(), startDay);
    fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, startDay - 1);
  } else {
    inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, startDay);
    fim = new Date(hoje.getFullYear(), hoje.getMonth(), startDay - 1);
  }

  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const nome = `${meses[inicio.getMonth()]}/${meses[fim.getMonth()]} ${fim.getFullYear()}`;

  return { inicio, fim, nome };
}

async function getFinancialContext(supabase: any, usuarioId: string): Promise<FinancialContext> {
  // Buscar preferência do dia de ciclo do usuário
  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('cycle_start_day')
    .eq('usuario_id', usuarioId)
    .maybeSingle();
  const cycleStartDay = prefs?.cycle_start_day ?? 25;
  const ciclo = getCurrentCycle(cycleStartDay);
  
  // Buscar transações do ciclo atual
  const { data: transacoes, error: transError } = await supabase
    .from('lancamentos')
    .select('*')
    .eq('usuario_id', usuarioId)
    .gte('data', ciclo.inicio.toISOString().split('T')[0])
    .lte('data', ciclo.fim.toISOString().split('T')[0]);

  if (transError) {
    console.error('[Finance] Erro ao buscar transações:', transError);
  }

  // Buscar orçamentos personalizados
  const { data: customBudgets, error: budgetError } = await supabase
    .from('category_budgets')
    .select('categoria_nome, categoria_tipo, orcamento')
    .eq('usuario_id', usuarioId);

  if (budgetError) {
    console.error('[Finance] Erro ao buscar orçamentos:', budgetError);
  }

  // Buscar categorias reais do usuário (ativas)
  const { data: categoriasUsuario, error: catError } = await supabase
    .from('categorias')
    .select('nome, tipo, orcamento')
    .eq('usuario_id', usuarioId)
    .eq('ativa', true);

  if (catError) {
    console.error('[Finance] Erro ao buscar categorias:', catError);
  }

  // Calcular totais
  let totalReceitas = 0;
  let totalDespesas = 0;
  let totalInvestimentos = 0;
  const gastosPorCategoria: Record<string, number> = {};

  (transacoes || []).forEach((t: Transacao) => {
    const valor = Math.abs(t.valor);
    
    if (t.tipo === 'receita') {
      totalReceitas += valor;
    } else if (t.tipo === 'despesa') {
      totalDespesas += valor;
    } else if (t.tipo === 'investimento') {
      totalInvestimentos += valor;
    }

    // Agrupar gastos por categoria
    const key = `${t.categoria}|${t.tipo}`;
    gastosPorCategoria[key] = (gastosPorCategoria[key] || 0) + valor;
  });

  // Montar lista de categorias com orçamentos e gastos
  const categorias = (categoriasUsuario || []).map((cat: any) => {
    // Verificar se há orçamento personalizado
    const customBudget = (customBudgets || []).find(
      (cb: CategoryBudget) => cb.categoria_nome === cat.nome && cb.categoria_tipo === cat.tipo
    );
    
    const orcamento = customBudget ? Number(customBudget.orcamento) : Number(cat.orcamento || 0);
    const key = `${cat.nome}|${cat.tipo}`;
    const gasto = gastosPorCategoria[key] || 0;
    const percentual = orcamento > 0 ? Math.round((gasto / orcamento) * 100) : 0;

    return {
      nome: cat.nome,
      tipo: cat.tipo,
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
    console.error('[Finance] GOOGLE_GEMINI_API_KEY não configurada');
    return getDefaultResponse(message, userName, context);
  }

  // Montar contexto das categorias
  const categoriasTexto = context.categorias
    .filter(c => c.tipo === 'despesa' && c.gasto > 0)
    .sort((a, b) => b.gasto - a.gasto)
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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
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
            maxOutputTokens: 1500,
            temperature: 0.7,
            thinkingConfig: { thinkingBudget: 0 }
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Finance] Erro Gemini:', response.status, errorText);
      return getDefaultResponse(message, userName, context);
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponse) {
      console.error('[Finance] Resposta Gemini vazia');
      return getDefaultResponse(message, userName, context);
    }

    return aiResponse;

  } catch (error) {
    console.error('[Finance] Erro ao chamar Gemini:', error);
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
