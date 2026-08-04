import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WeeklyUser {
  usuario_id: string;
  phone_number: string;
  weekly_report_enabled: boolean;
  weekly_report_day: number;
  weekly_report_days: number[] | null;
  weekly_report_hour: number;
  weekly_week_start: number;
  weekly_scope_tipo: string;
  weekly_scope_nome: string | null;
  weekly_scope_categorias: string[];
  weekly_month_categorias: string[];
}

declare const EdgeRuntime: { waitUntil(promise: Promise<unknown>): void };

const SELECT_COLS =
  'usuario_id, phone_number, weekly_report_enabled, weekly_report_day, weekly_report_days, weekly_report_hour, weekly_week_start, weekly_scope_tipo, weekly_scope_nome, weekly_scope_categorias, weekly_month_categorias';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization') || '';
    const cronHeader = req.headers.get('x-cron-secret') || '';
    const cronSecret = Deno.env.get('CRON_SECRET');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const isServiceRole = !!serviceKey && authHeader === `Bearer ${serviceKey}`;
    const isCronSecret = !!cronSecret && cronHeader === cronSecret;
    const isAnonCron = !!anonKey && authHeader === `Bearer ${anonKey}`;
    const isPrivileged = isServiceRole || isCronSecret;
    if (!isPrivileged && !isAnonCron) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    let forceTest = url.searchParams.get('force') === 'true' || url.searchParams.get('sendNow') === 'true';
    const phoneFilter = url.searchParams.get('phone');
    if (!forceTest && req.method === 'POST') {
      try {
        const body = await req.json();
        if (body?.force === true || body?.sendNow === true) forceTest = true;
      } catch { /* ignore */ }
    }
    if (forceTest && !isPrivileged) {
      return new Response(JSON.stringify({ error: 'Forbidden: force send requires privileged auth' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const nowBr = brasiliaNow();
    const brasiliaHour = nowBr.getHours();
    const dayOfWeek = nowBr.getDay();

    let query = supabase
      .from('whatsapp_finance_users')
      .select(SELECT_COLS)
      .eq('is_active', true)
      .eq('weekly_report_enabled', true);

    if (!forceTest) {
      query = query.eq('weekly_report_hour', brasiliaHour);
    }

    const { data, error } = await query;
    if (error) throw error;

    let users = (data || []) as WeeklyUser[];
    if (!forceTest) {
      users = users.filter((u) => {
        const dias = (u.weekly_report_days && u.weekly_report_days.length > 0)
          ? u.weekly_report_days
          : [u.weekly_report_day];
        return dias.includes(dayOfWeek);
      });
    }
    if (phoneFilter) users = users.filter((u) => u.phone_number === phoneFilter);

    console.log(`[WeeklyReport] ${users.length} usuários (hora BR ${brasiliaHour}h, dia ${dayOfWeek})`);

    if (users.length === 0) {
      return new Response(JSON.stringify({ message: 'Nenhum relatório semanal para enviar', count: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const sid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const token = Deno.env.get('TWILIO_AUTH_TOKEN');
    const from = Deno.env.get('TWILIO_WHATSAPP_NUMBER');
    if (!sid || !token || !from) throw new Error('Credenciais Twilio não configuradas');

    EdgeRuntime.waitUntil(processAll(supabase, users, sid, token, from));

    return new Response(JSON.stringify({ message: 'Relatórios semanais iniciados', users: users.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('[WeeklyReport] Erro:', e);
    return new Response(JSON.stringify({ error: 'Erro ao processar relatórios semanais' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processAll(
  supabase: any, users: WeeklyUser[], sid: string, token: string, from: string,
) {
  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
  const basic = btoa(`${sid}:${token}`);
  const templateSid = Deno.env.get('TWILIO_TEMPLATE_SEMANAL_SID');

  for (const user of users) {
    try {
      const variables = await buildWeeklyVariables(supabase, user);
      const formData = new URLSearchParams();
      formData.append('From', `whatsapp:${from}`);
      formData.append('To', `whatsapp:+${user.phone_number}`);
      if (templateSid) {
        formData.append('ContentSid', templateSid);
        formData.append('ContentVariables', JSON.stringify(variables));
      } else {
        // Fallback (só funciona dentro da janela de 24h): texto livre formatado.
        formData.append('Body', renderPlainText(variables));
      }

      const res = await fetch(twilioUrl, {
        method: 'POST',
        headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });
      if (!res.ok) {
        const body = await res.text();
        console.error(`[WeeklyReport] FALHA ${user.phone_number} [${res.status}]: ${body.substring(0, 300)}`);
      } else {
        console.log(`[WeeklyReport] Enviado para ${user.phone_number}`);
      }
    } catch (e) {
      console.error(`[WeeklyReport] Erro usuário ${user.phone_number}:`, e);
    }
  }
}

// ---------- Datas ----------
function brasiliaNow(): Date {
  const now = new Date();
  return new Date(now.getTime() - 3 * 60 * 60 * 1000);
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function fmtDateISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function fmtDateBR(d: Date) {
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// Última semana COMPLETA anterior a hoje, respeitando o dia inicial (0=domingo).
function lastCompleteWeek(weekStart: number) {
  const hoje = startOfDay(brasiliaNow());
  const diff = (hoje.getDay() - weekStart + 7) % 7;
  const inicioSemanaAtual = addDays(hoje, -diff);
  const inicio = addDays(inicioSemanaAtual, -7);
  const fim = addDays(inicio, 6);
  return { inicio, fim };
}

function getCurrentCycle(cycleStartDay = 25) {
  const hoje = brasiliaNow();
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
  return { inicio, fim, nome: `${meses[inicio.getMonth()]}/${meses[fim.getMonth()]} ${fim.getFullYear()}` };
}

const fmtBRL = (v: number) =>
  v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtBRL0 = (v: number) =>
  v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

function emojiForCategoria(nome: string): string {
  const n = nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const map: Array<[RegExp, string]> = [
    [/supermerc|mercado/, '🛒'],
    [/restaurant|aplicativ|ifood|alimenta/, '🍽️'],
    [/uber|taxi|transport/, '🚕'],
    [/recarga|combust|gasolin|carro/, '⛽'],
    [/farmac|remedi|saude|medic/, '💊'],
    [/filho|bebe|crianc/, '👶'],
    [/presente|roupa/, '🎁'],
    [/lazer|cinema|diversao/, '🎮'],
    [/compra/, '🛍️'],
    [/casa|moradia|condomin|aluguel/, '🏠'],
    [/internet|telefon|celular/, '📶'],
    [/academia|gym|esporte/, '🏋️'],
    [/gato|cachorro|pet/, '🐾'],
    [/conta|agua|luz|energia/, '💡'],
    [/viagem|hotel/, '✈️'],
    [/imposto|taxa|multa/, '🧾'],
    [/invest/, '📈'],
    [/outros/, '📦'],
  ];
  for (const [re, emoji] of map) if (re.test(n)) return emoji;
  return '•';
}

// ---------- Dados ----------
async function buildWeeklyVariables(supabase: any, user: WeeklyUser): Promise<Record<string, string>> {
  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('cycle_start_day')
    .eq('usuario_id', user.usuario_id)
    .maybeSingle();
  const cycleStartDay = prefs?.cycle_start_day ?? 25;

  const semana = lastCompleteWeek(user.weekly_week_start ?? 0);
  const anterior = { inicio: addDays(semana.inicio, -7), fim: addDays(semana.fim, -7) };
  const ciclo = getCurrentCycle(cycleStartDay);

  const escopo = (user.weekly_scope_categorias || []).filter(Boolean);
  const escopoNome = user.weekly_scope_nome || (escopo.length === 1 ? escopo[0] : 'Categorias selecionadas');

  // Lançamentos das duas semanas + do ciclo
  const menorData = anterior.inicio < ciclo.inicio ? anterior.inicio : ciclo.inicio;
  const maiorData = semana.fim > ciclo.fim ? semana.fim : ciclo.fim;

  const { data: lancamentos } = await supabase
    .from('lancamentos')
    .select('data, categoria, valor, tipo, descricao')
    .eq('usuario_id', user.usuario_id)
    .gte('data', fmtDateISO(menorData))
    .lte('data', fmtDateISO(maiorData));

  const rows = (lancamentos || []) as Array<{ data: string; categoria: string; valor: number; tipo: string; descricao: string | null }>;

  const parseLocal = (s: string) => {
    const [a, m, d] = s.split('-').map(Number);
    return new Date(a, m - 1, d);
  };

  const dentro = (d: Date, ini: Date, fim: Date) => d >= ini && d <= fim;

  let totalSemana = 0;
  let totalSemanaAnterior = 0;
  const porCategoriaSemana: Record<string, number> = {};
  const topLancamentos: Array<{ desc: string; valor: number }> = [];

  let receitasCiclo = 0;
  let despesasCiclo = 0;
  const gastosCicloPorCategoria: Record<string, number> = {};

  for (const t of rows) {
    const d = parseLocal(t.data);
    const valor = Math.abs(Number(t.valor));

    if (t.tipo === 'despesa' && escopo.includes(t.categoria)) {
      if (dentro(d, semana.inicio, semana.fim)) {
        totalSemana += valor;
        porCategoriaSemana[t.categoria] = (porCategoriaSemana[t.categoria] || 0) + valor;
        topLancamentos.push({ desc: t.descricao?.trim() || t.categoria, valor });
      } else if (dentro(d, anterior.inicio, anterior.fim)) {
        totalSemanaAnterior += valor;
      }
    }

    if (dentro(d, ciclo.inicio, ciclo.fim)) {
      if (t.tipo === 'receita') receitasCiclo += valor;
      else if (t.tipo === 'despesa') {
        despesasCiclo += valor;
        gastosCicloPorCategoria[t.categoria] = (gastosCicloPorCategoria[t.categoria] || 0) + valor;
      }
    }
  }

  // Orçamentos das categorias do mês
  const monthCats = (user.weekly_month_categorias || []).filter(Boolean).slice(0, 5);
  const orcamentos: Record<string, number> = {};
  if (monthCats.length > 0) {
    const [{ data: cats }, { data: budgets }] = await Promise.all([
      supabase.from('categorias').select('nome, orcamento').eq('usuario_id', user.usuario_id).eq('tipo', 'despesa'),
      supabase.from('category_budgets').select('categoria_nome, orcamento, ciclo_id').eq('usuario_id', user.usuario_id).eq('categoria_tipo', 'despesa'),
    ]);
    const cicloId = fmtDateISO(ciclo.inicio);
    for (const nome of monthCats) {
      const doCiclo = (budgets || []).find((b: any) => b.categoria_nome === nome && b.ciclo_id === cicloId);
      const global = (budgets || []).find((b: any) => b.categoria_nome === nome && b.ciclo_id === null);
      const base = (cats || []).find((c: any) => c.nome === nome);
      orcamentos[nome] = Number(doCiclo?.orcamento ?? global?.orcamento ?? base?.orcamento ?? 0);
    }
  }

  // Variações
  const media = totalSemana / 7;
  let comparativo: string;
  if (totalSemanaAnterior <= 0) {
    comparativo = totalSemana > 0 ? 'sem base de comparação na semana anterior' : 'sem gastos nas duas semanas';
  } else {
    const diff = totalSemana - totalSemanaAnterior;
    const pct = Math.round(Math.abs(diff / totalSemanaAnterior) * 100);
    const seta = diff > 0 ? '🔺' : diff < 0 ? '🔻' : '➖';
    const palavra = diff > 0 ? 'acima' : diff < 0 ? 'abaixo' : 'igual';
    comparativo = `${seta} ${pct}% ${palavra} (semana anterior: R$ ${fmtBRL(totalSemanaAnterior)})`;
  }

  // Linhas de detalhe da semana (categorias do escopo com gasto)
  const detalheSemana = Object.entries(porCategoriaSemana)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([nome, v]) => `${emojiForCategoria(nome)} ${nome}: R$ ${fmtBRL(v)}`);

  const maiorGasto = topLancamentos.sort((a, b) => b.valor - a.valor)[0];

  // Linhas das categorias do mês (até 5)
  const linhasMes: string[] = [];
  for (let i = 0; i < 5; i++) {
    const nome = monthCats[i];
    if (!nome) { linhasMes.push('—'); continue; }
    const gasto = gastosCicloPorCategoria[nome] || 0;
    const orc = orcamentos[nome] || 0;
    if (orc > 0) {
      const pct = Math.round((gasto / orc) * 100);
      const bola = pct >= 100 ? '🔴' : pct >= 80 ? '🟡' : '🟢';
      const restante = orc - gasto;
      linhasMes.push(
        `${emojiForCategoria(nome)} ${nome}: R$ ${fmtBRL0(gasto)} de R$ ${fmtBRL0(orc)} ${bola} ${pct}% • ${restante >= 0 ? 'restam' : 'estourou'} R$ ${fmtBRL0(Math.abs(restante))}`,
      );
    } else {
      linhasMes.push(`${emojiForCategoria(nome)} ${nome}: R$ ${fmtBRL0(gasto)} (sem orçamento)`);
    }
  }

  const saldoCiclo = receitasCiclo - despesasCiclo;
  const hoje = startOfDay(brasiliaNow());
  const diasRestantes = Math.max(0, Math.ceil((ciclo.fim.getTime() - hoje.getTime()) / 86400000));

  return {
    "1": `${fmtDateBR(semana.inicio)} a ${fmtDateBR(semana.fim)}`,
    "2": escopoNome,
    "3": `R$ ${fmtBRL(totalSemana)}`,
    "4": `R$ ${fmtBRL(media)}`,
    "5": comparativo,
    "6": detalheSemana[0] || '—',
    "7": detalheSemana[1] || '—',
    "8": detalheSemana[2] || '—',
    "9": maiorGasto ? `${maiorGasto.desc} — R$ ${fmtBRL(maiorGasto.valor)}` : '—',
    "10": linhasMes[0],
    "11": linhasMes[1],
    "12": linhasMes[2],
    "13": linhasMes[3],
    "14": linhasMes[4],
    "15": `R$ ${fmtBRL(saldoCiclo)}`,
    "16": `${ciclo.nome} • faltam ${diasRestantes} dias`,
  };
}

// Espelha o corpo do template Twilio (usado apenas no fallback de texto livre)
function renderPlainText(v: Record<string, string>): string {
  return [
    `📅 *Resumo semanal do período ${v["1"]}*`,
    ``,
    `🎯 *Categoria: ${v["2"]}*`,
    `Total na semana: *${v["3"]}*`,
    `Média por dia: *${v["4"]}*`,
    `Comparativo: ${v["5"]}`,
    ``,
    `🔎 *Onde foi o dinheiro*`,
    `1) ${v["6"]}`,
    `2) ${v["7"]}`,
    `3) ${v["8"]}`,
    ``,
    `💥 *Maior gasto:* ${v["9"]}`,
    ``,
    `━━━━━━━━━━━━━━`,
    ``,
    `📊 *Saldo do mês por categoria*`,
    ``,
    `1) ${v["10"]}`,
    `2) ${v["11"]}`,
    `3) ${v["12"]}`,
    `4) ${v["13"]}`,
    `5) ${v["14"]}`,
    ``,
    `━━━━━━━━━━━━━━`,
    ``,
    `💰 *Saldo do ciclo: ${v["15"]}*`,
    `🗓️ *Período: ${v["16"]}*`,
    ``,
    `Enviado pelo Planner Plenna.`,
  ].join('\n');
}