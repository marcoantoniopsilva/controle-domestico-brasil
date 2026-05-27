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
  report_type?: string;
  selected_categories?: string[];
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
  ciclo_id?: string | null;
}

// ContentSids dos templates Twilio (configuráveis via secrets)
// Fallback: template "completo" original
const TEMPLATE_COMPLETO_DEFAULT = 'HXe114dce7a30e14b0aa6e97f680549e78';
function getTemplateSid(reportType: string): string {
  switch (reportType) {
    case 'despesas':
      return Deno.env.get('TWILIO_TEMPLATE_DESPESAS_SID') || TEMPLATE_COMPLETO_DEFAULT;
    case 'receitas':
      return Deno.env.get('TWILIO_TEMPLATE_RECEITAS_SID') || TEMPLATE_COMPLETO_DEFAULT;
    case 'categorias':
      return Deno.env.get('TWILIO_TEMPLATE_CATEGORIAS_SID') || TEMPLATE_COMPLETO_DEFAULT;
    case 'completo':
    default:
      // O template "completo" antigo tinha rótulos hardcoded (Marco/Bruna/Aurora).
      // Agora usamos o template de variável única (categorias) e montamos o conteúdo
      // dinamicamente com as categorias reais do usuário.
      return Deno.env.get('TWILIO_TEMPLATE_CATEGORIAS_SID')
        || Deno.env.get('TWILIO_TEMPLATE_COMPLETO_SID')
        || TEMPLATE_COMPLETO_DEFAULT;
  }
}

declare const EdgeRuntime: { waitUntil(promise: Promise<unknown>): void };

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    let forceTest = url.searchParams.get('force') === 'true' || url.searchParams.get('sendNow') === 'true';
    const phoneFilter = url.searchParams.get('phone');
    
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
        .select('usuario_id, phone_number, report_frequency, report_hour, report_type, selected_categories')
        .eq('is_active', true)
        .neq('report_frequency', 'none');
      
      if (error) throw error;
      users = data || [];
      if (phoneFilter) {
        users = users.filter((u: WhatsAppUser) => u.phone_number === phoneFilter);
      }
      console.log(`[DailyReport] TESTE MANUAL: ${users.length} usuários encontrados`);
    } else {
      const { data, error } = await supabase
        .from('whatsapp_finance_users')
        .select('usuario_id, phone_number, report_frequency, report_hour, report_type, selected_categories')
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

    if (!twilioAccountSid || !twilioAuthToken || !twilioWhatsappNumber) {
      console.error('[DailyReport] Credenciais Twilio não configuradas');
      throw new Error('Credenciais Twilio não configuradas');
    }

    // Processar em background usando EdgeRuntime.waitUntil
    const backgroundProcess = processAllUsers(
      supabase, usersToNotify, twilioAccountSid, twilioAuthToken, twilioWhatsappNumber
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
  twilioWhatsappNumber: string
) {
  let successCount = 0;
  let errorCount = 0;
  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
  const authHeader = btoa(`${twilioAccountSid}:${twilioAuthToken}`);

  for (const user of usersToNotify) {
    try {
      const reportType = user.report_type || 'completo';
      const templateContentSid = getTemplateSid(reportType);
      console.log(`[DailyReport] Gerando relatório (${reportType}) para ${user.phone_number}...`);

      const variables = await buildTemplateVariables(supabase, user, reportType);
      console.log(`[DailyReport] Enviando template ${templateContentSid} para ${user.phone_number}...`);

      const formData = new URLSearchParams();
      formData.append('From', `whatsapp:${twilioWhatsappNumber}`);
      formData.append('To', `whatsapp:+${user.phone_number}`);
      formData.append('ContentSid', templateContentSid);
      formData.append('ContentVariables', JSON.stringify(variables));

      const response = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
      });

      if (response.ok) {
        console.log(`[DailyReport] Relatório enviado para ${user.phone_number}, status: ${response.status}`);
        successCount++;
      } else {
        const errorText = await response.text();
        console.error(`[DailyReport] FALHA para ${user.phone_number}, status: ${response.status}, response: ${errorText.substring(0, 300)}`);
        errorCount++;
      }

    } catch (error) {
      console.error(`[DailyReport] Erro ao processar usuário ${user.phone_number}:`, error);
      errorCount++;
    }
  }

  console.log(`[DailyReport] Background concluído: ${successCount} sucesso, ${errorCount} erros`);
}

async function buildTemplateVariables(
  supabase: any,
  user: WhatsAppUser,
  reportType: string
): Promise<Record<string, string>> {
  const reportData = await generateReportData(supabase, user.usuario_id);

  if (reportType === 'completo') {
    // Montar resumo dinâmico: saldo + top 6 categorias do usuário + dias restantes.
    // Twilio NÃO aceita \n em ContentVariables (erro 21656), então usamos bullet.
    const SEP = '  ▪️  ';
    const partes: string[] = [];
    partes.push(`Saldo: ${reportData.saldo}`);
    const top = reportData.topCategoriasResumo.slice(0, 6);
    if (top.length > 0) {
      partes.push(...top);
    }
    partes.push(`Faltam ${reportData.diasRestantes} dias para fechar o ciclo`);
    const linha = partes.join(SEP).substring(0, 1000);
    return { "1": linha };
  }

  const fmtBRL = (v: number) =>
    v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtBRLshort = (v: number) =>
    v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  if (reportType === 'despesas') {
    const pctUsado = reportData.totalOrcamentoDespesas > 0
      ? Math.round((reportData.totalDespesas / reportData.totalOrcamentoDespesas) * 100)
      : 0;
    return {
      "1": reportData.cicloNome,
      "2": fmtBRL(reportData.totalDespesas),
      "3": fmtBRLshort(reportData.totalOrcamentoDespesas),
      "4": `${pctUsado}`,
      "5": reportData.topDespesas[0] || "—",
      "6": reportData.topDespesas[1] || "—",
      "7": reportData.topDespesas[2] || "—",
      "8": reportData.diasRestantes,
    };
  }

  if (reportType === 'receitas') {
    return {
      "1": `R$${fmtBRL(reportData.totalReceitas)}`,
      "2": `R$${fmtBRL(reportData.totalDespesas)}`,
      "3": reportData.saldo,
      "4": reportData.diasRestantes,
    };
  }

  if (reportType === 'categorias') {
    const selected = (user.selected_categories || []).slice(0, 8);
    // IMPORTANTE: Twilio NÃO aceita quebras de linha (\n) em ContentVariables
    // (retorna erro 21656). Usamos separador visual com bullet para manter
    // legibilidade dentro de uma única variável.
    const linhas = selected.length > 0
      ? selected.map((nome) => `${nome}: ${reportData.formatCategoria(nome)}`).join('  ▪️  ')
      : 'Nenhuma categoria selecionada. Configure no app.';
    return {
      "1": linhas.substring(0, 1000),
    };
  }

  return { "1": reportData.saldo };
}

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

function formatDateLocal(date: Date): string {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const dia = String(date.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

interface ReportData {
  saldo: string;
  diasRestantes: string;
  totalReceitas: number;
  totalDespesas: number;
  topDespesas: string[];
  topCategoriasResumo: string[];
  formatCategoria: (nome: string) => string;
  totalOrcamentoDespesas: number;
  cicloNome: string;
}

async function generateReportData(supabase: any, usuarioId: string): Promise<ReportData> {
  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('cycle_start_day')
    .eq('usuario_id', usuarioId)
    .maybeSingle();
  const cycleStartDay = prefs?.cycle_start_day ?? 25;
  const ciclo = getCurrentCycle(cycleStartDay);

  const { data: transacoesCiclo } = await supabase
    .from('lancamentos')
    .select('*')
    .eq('usuario_id', usuarioId)
    .gte('data', formatDateLocal(ciclo.inicio))
    .lte('data', formatDateLocal(ciclo.fim));

  const dataLimiteAnterior = new Date(ciclo.inicio);
  dataLimiteAnterior.setMonth(dataLimiteAnterior.getMonth() - 12);
  
  const { data: transacoesParceladas } = await supabase
    .from('lancamentos')
    .select('*')
    .eq('usuario_id', usuarioId)
    .gt('parcelas', 1)
    .lt('data', formatDateLocal(ciclo.inicio))
    .gte('data', formatDateLocal(dataLimiteAnterior));

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
        parcelasDoCiclo.push({ categoria: t.categoria, tipo: t.tipo, valor: valorAbsoluto });
      }
    }
  });

  const { data: customBudgets } = await supabase
    .from('category_budgets')
    .select('categoria_nome, categoria_tipo, orcamento, ciclo_id')
    .eq('usuario_id', usuarioId)
    .eq('categoria_tipo', 'despesa');

  const cicloId = formatDateLocal(ciclo.inicio);
  const orcamentosMap: Record<string, number> = {};

  const resolveBudget = (nome: string, fallback: number) => {
    const cycleBudget = (customBudgets || []).find((cb: CategoryBudget) =>
      cb.categoria_nome === nome && cb.categoria_tipo === 'despesa' && cb.ciclo_id === cicloId
    );
    if (cycleBudget) return Number(cycleBudget.orcamento || 0);

    const globalBudget = (customBudgets || []).find((cb: CategoryBudget) =>
      cb.categoria_nome === nome && cb.categoria_tipo === 'despesa' && cb.ciclo_id === null
    );
    if (globalBudget) return Number(globalBudget.orcamento || 0);

    return fallback;
  };

  // Buscar baseline de orçamentos das categorias (despesa, ativas)
  const { data: categoriasDespesa } = await supabase
    .from('categorias')
    .select('nome, orcamento, ativa, tipo')
    .eq('usuario_id', usuarioId)
    .eq('tipo', 'despesa')
    .eq('ativa', true);

  let totalOrcamentoDespesas = 0;
  (categoriasDespesa || []).forEach((c: any) => {
    const valor = resolveBudget(c.nome, Number(c.orcamento || 0));
    orcamentosMap[c.nome] = valor;
    totalOrcamentoDespesas += valor;
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

  const fmtBRL = (v: number) =>
    v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtBRLshort = (v: number) =>
    v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const formatCategory = (nome: string) => {
    const gasto = gastosPorCategoria[nome] || 0;
    const orcamento = orcamentosMap[nome] || 0;
    const percentual = orcamento > 0 ? Math.round((gasto / orcamento) * 100) : 0;
    return `R$${fmtBRLshort(gasto)} de R$${fmtBRLshort(orcamento)} (${percentual}%)`;
  };

  // Calcular dias restantes até o fechamento do ciclo
  const hoje = new Date();
  const diffMs = ciclo.fim.getTime() - hoje.getTime();
  const diasRestantes = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  // Top despesas ordenadas
  const topDespesas = Object.entries(gastosPorCategoria)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([nome]) => `${nome}: ${formatCategory(nome)}`);

  // Resumo de categorias para relatório "completo" dinâmico:
  // prioriza categorias com gasto > 0 (ordenadas por gasto desc),
  // e completa com categorias de maior orçamento caso o usuário tenha pouca atividade.
  const comGasto = Object.entries(gastosPorCategoria)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([nome]) => nome);
  const semGasto = Object.entries(orcamentosMap)
    .filter(([nome, v]) => v > 0 && !(gastosPorCategoria[nome] > 0))
    .sort((a, b) => b[1] - a[1])
    .map(([nome]) => nome);
  const topCategoriasResumo = [...comGasto, ...semGasto]
    .slice(0, 6)
    .map((nome) => `${nome}: ${formatCategory(nome)}`);

  return {
    saldo: `R$${fmtBRL(saldo)}`,
    diasRestantes: `${diasRestantes}`,
    totalReceitas,
    totalDespesas,
    topDespesas,
    topCategoriasResumo,
    formatCategoria: formatCategory,
    totalOrcamentoDespesas,
    cicloNome: ciclo.nome,
  };
}
