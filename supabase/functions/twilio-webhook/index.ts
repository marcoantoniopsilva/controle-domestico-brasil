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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate Twilio signature before processing any payload.
    // Algorithm: Base64(HMAC-SHA1(AUTH_TOKEN, fullUrl + sorted(k+v)))
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const signature = req.headers.get('X-Twilio-Signature') || '';
    if (!twilioAuthToken) {
      console.error('[Twilio Webhook] TWILIO_AUTH_TOKEN missing');
      return new Response('Server misconfigured', { status: 500, headers: corsHeaders });
    }

    // Read raw body once, then re-parse it as form data.
    const rawBody = await req.text();
    const params = new URLSearchParams(rawBody);
    const formData = new Map<string, string>();
    for (const [k, v] of params.entries()) formData.set(k, v);

    // Build candidate URLs Twilio may have signed against. Behind Supabase's
    // proxy the request URL doesn't always match what was configured in the
    // Twilio console, so we try several variants and accept the first match.
    const xfProto = req.headers.get('x-forwarded-proto') || 'https';
    const xfHost = req.headers.get('x-forwarded-host');
    const host = req.headers.get('host');
    const reqUrl = new URL(req.url);
    const pathAndQuery = `${reqUrl.pathname}${reqUrl.search}`;
    const configuredUrl = (Deno.env.get('TWILIO_WEBHOOK_URL') || '').trim();
    const candidates = new Set<string>([
      req.url,
      `${xfProto}://${xfHost || host}${pathAndQuery}`,
      `https://${xfHost || host}${pathAndQuery}`,
      `https://${host}${pathAndQuery}`,
      `https://${reqUrl.hostname}${pathAndQuery}`,
    ]);
    if (configuredUrl) {
      // URL exata configurada no console do Twilio — é a que ele usa para assinar.
      candidates.add(configuredUrl);
      // Também testa com a querystring atual, caso o Twilio adicione params.
      if (reqUrl.search) candidates.add(configuredUrl + reqUrl.search);
    }

    const sortedKeys = [...formData.keys()].sort();
    const paramsConcat = sortedKeys.map((k) => k + (formData.get(k) ?? '')).join('');
    const keyData = new TextEncoder().encode(twilioAuthToken);
    const cryptoKey = await crypto.subtle.importKey(
      'raw', keyData, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']
    );
    const computeSig = async (url: string) => {
      const msgData = new TextEncoder().encode(url + paramsConcat);
      const sigBuf = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
      return btoa(String.fromCharCode(...new Uint8Array(sigBuf)));
    };
    let matched = false;
    const tried: Record<string, string> = {};
    for (const url of candidates) {
      const computed = await computeSig(url);
      tried[url] = computed;
      if (signature && computed === signature) { matched = true; break; }
    }
    if (!matched) {
      console.warn('[Twilio Webhook] Invalid signature; rejecting request', {
        signature,
        tried,
        reqUrl: req.url,
        xfProto,
        xfHost,
        host,
        keys: sortedKeys,
      });
      return new Response('Forbidden', { status: 403, headers: corsHeaders });
    }
    
    const from = formData.get('From') || '';
    const body = formData.get('Body') || '';
    const profileName = formData.get('ProfileName') || 'Usuário';
    const numMedia = parseInt(formData.get('NumMedia') || '0', 10);
    const mediaUrl0 = formData.get('MediaUrl0') || '';
    const mediaType0 = formData.get('MediaContentType0') || '';

    // Extrair número do formato whatsapp:+5531999999999
    const phone = from.replace('whatsapp:', '').replace(/\D/g, '');
    const messageText = body.trim();

    console.log(`[Twilio Webhook] Mensagem de ${profileName} (${phone}): "${messageText}" | media=${numMedia} (${mediaType0})`);

    if (!messageText && numMedia === 0) {
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
      responseText = `❌ Número não cadastrado.\n\nPara usar o assistente financeiro, cadastre seu número WhatsApp no aplicativo.\n\n📱 Acesse: https://plannerplenna.lovable.app`;
    } else if (!whatsappUser.is_active) {
      console.log(`[Twilio Webhook] Usuário inativo: ${phone}`);
      responseText = `⏸️ Suas notificações estão desativadas.\n\nPara reativar, acesse o app e ative as notificações na aba WhatsApp.`;
    } else if (numMedia > 0 && mediaType0.startsWith('image/')) {
      // Processar imagem enviada (extrato, NF, cartão de crédito)
      responseText = await processImageMessage(
        supabase,
        whatsappUser.usuario_id,
        profileName,
        mediaUrl0,
        mediaType0,
        messageText
      );
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

// Detecta "quem realizou" o gasto a partir da legenda da foto ou do nome do contato WhatsApp.
// Aceita "por João", "from Maria", etc. Caso contrário usa o primeiro nome do ProfileName.
function detectQuemGastou(profileName: string, caption: string): string {
  const cap = (caption || '').trim();
  const m = cap.match(/^(?:por|from)\s+([\p{L}][\p{L}\s.'-]{0,40})/iu);
  if (m && m[1]) {
    return m[1].trim().split(/\s+/)[0];
  }
  const first = (profileName || '').trim().split(/\s+/)[0];
  return first || 'WhatsApp';
}

// Processa imagem enviada por WhatsApp: extrai lançamentos com Gemini e salva no banco
async function processImageMessage(
  supabase: any,
  usuarioId: string,
  profileName: string,
  mediaUrl: string,
  mediaType: string,
  caption: string
): Promise<string> {
  try {
    const geminiApiKey = Deno.env.get('GOOGLE_GEMINI_API_KEY');
    if (!geminiApiKey) {
      return '❌ Recurso de leitura de imagem indisponível no momento (chave de IA não configurada).';
    }

    const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    if (!twilioSid || !twilioToken) {
      return '❌ Credenciais do WhatsApp ausentes para baixar a imagem.';
    }

    // Baixar a mídia da Twilio (requer Basic Auth)
    console.log(`[Twilio Webhook] Baixando mídia: ${mediaUrl}`);
    const basicAuth = btoa(`${twilioSid}:${twilioToken}`);
    const mediaResp = await fetch(mediaUrl, {
      headers: { Authorization: `Basic ${basicAuth}` },
      redirect: 'follow',
    });
    if (!mediaResp.ok) {
      console.error('[Twilio Webhook] Falha ao baixar mídia:', mediaResp.status);
      return '❌ Não consegui baixar a imagem enviada. Tente novamente.';
    }
    const buffer = new Uint8Array(await mediaResp.arrayBuffer());
    // Converter para base64
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < buffer.length; i += chunk) {
      binary += String.fromCharCode(...buffer.subarray(i, i + chunk));
    }
    const base64 = btoa(binary);

    // Buscar categorias do usuário (apenas despesas ativas) para guiar a categorização
    const { data: cats } = await supabase
      .from('categorias')
      .select('nome, tipo')
      .eq('usuario_id', usuarioId)
      .eq('tipo', 'despesa')
      .eq('ativa', true);
    const categoriasDisponiveis: string[] = (cats || []).map((c: any) => c.nome);
    if (categoriasDisponiveis.length === 0) categoriasDisponiveis.push('Outros');

    // Use Brazil timezone (America/Sao_Paulo) to avoid UTC offset shifting "today" to tomorrow
    const fmtBR = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
    const partsBR = fmtBR.formatToParts(new Date());
    const diaBR = partsBR.find(p => p.type === 'day')!.value;
    const mesBR = partsBR.find(p => p.type === 'month')!.value;
    const anoBR = partsBR.find(p => p.type === 'year')!.value;
    const dataHojeStr = `${diaBR}/${mesBR}/${anoBR}`;
    const anoRef = Number(anoBR);

    const prompt = `Você é um especialista em extrair lançamentos financeiros de imagens (extratos bancários, faturas de cartão, notas fiscais, prints de apps).

Analise a imagem e extraia TODOS os lançamentos de despesa visíveis.

Para cada lançamento retorne:
- data: DD/MM/AAAA. Se ausente/ilegível use ${dataHojeStr}. Se faltar só o ano, use ${anoRef}.
- descricao: nome do estabelecimento/descrição
- valor: número decimal positivo em reais (sem R$, sem separador de milhar; use ponto como decimal)
- parcelas: número total de parcelas (ex.: "2/5" -> 5). Se não houver, 1.
- parcelaAtual: parcela atual (ex.: "2/5" -> 2). Se não houver, 1.
- categoria: escolha EXATAMENTE uma desta lista (preserve acentuação e capitalização):
${categoriasDisponiveis.join(', ')}
Se nada se encaixar, use "Outros".

REGRAS:
- Ignore totais, subtotais e linhas que não são lançamentos individuais.
- Não invente valores. Se não houver lançamentos, retorne lista vazia.
- Valores sempre positivos.
${caption ? `\nObservação do usuário sobre a imagem: "${caption}"` : ''}

Retorne APENAS JSON válido, SEM markdown, no formato:
{"transacoes":[{"data":"DD/MM/AAAA","descricao":"...","valor":0.0,"parcelas":1,"parcelaAtual":1,"categoria":"..."}]}`;

    const geminiResp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: mediaType || 'image/jpeg', data: base64 } },
            ],
          }],
        }),
      }
    );

    if (!geminiResp.ok) {
      const t = await geminiResp.text();
      console.error('[Twilio Webhook] Gemini error:', geminiResp.status, t);
      return '❌ Não consegui ler a imagem agora. Tente novamente em alguns instantes.';
    }

    const geminiData = await geminiResp.json();
    const textResp: string = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonStr = textResp.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let transacoes: Array<{ data: string; descricao: string; valor: number; parcelas: number; parcelaAtual: number; categoria: string }> = [];
    try {
      const parsed = JSON.parse(jsonStr);
      transacoes = Array.isArray(parsed.transacoes) ? parsed.transacoes : [];
    } catch (e) {
      console.error('[Twilio Webhook] Falha ao parsear JSON do Gemini:', e, jsonStr.slice(0, 500));
      return '❌ Não consegui interpretar os lançamentos da imagem. Tente outra foto mais nítida.';
    }

    if (transacoes.length === 0) {
      return '🔍 Não encontrei lançamentos nesta imagem. Envie uma foto mais nítida do extrato/fatura.';
    }

    // Definir "quem gastou" de forma genérica:
    // 1) legenda iniciando com "por <nome>" / "from <nome>"
    // 2) primeiro nome do ProfileName do WhatsApp
    // 3) fallback "WhatsApp"
    const quemGastou = detectQuemGastou(profileName, caption);

    const rows = transacoes.map(t => {
      const partes = (t.data || '').split('/');
      const dia = parseInt(partes[0]) || hoje.getDate();
      const mes = parseInt(partes[1]) || (hoje.getMonth() + 1);
      const ano = parseInt(partes[2]) || anoRef;
      const dataISO = `${ano}-${String(mes).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;
      const valorAbs = Math.abs(Number(t.valor) || 0);
      return {
        usuario_id: usuarioId,
        data: dataISO,
        categoria: t.categoria || 'Outros',
        valor: -valorAbs, // despesas armazenadas como negativas
        parcelas: Math.max(1, Number(t.parcelas) || 1),
        quem_gastou: quemGastou,
        descricao: t.descricao || null,
        tipo: 'despesa',
        ganhos: 0,
      };
    }).filter(r => r.valor !== 0);

    if (rows.length === 0) {
      return '🔍 Encontrei lançamentos, mas todos com valor zero. Verifique a imagem.';
    }

    const { error: insertError } = await supabase.from('lancamentos').insert(rows);
    if (insertError) {
      console.error('[Twilio Webhook] Erro ao inserir lançamentos:', insertError);
      return '❌ Encontrei os lançamentos mas não consegui salvá-los. Tente novamente.';
    }

    const total = rows.reduce((s, r) => s + Math.abs(r.valor), 0);
    const linhas = rows.slice(0, 10).map(r => {
      const [a, m, d] = r.data.split('-');
      return `• ${d}/${m} — ${r.descricao || r.categoria} (${r.categoria}): R$ ${Math.abs(r.valor).toFixed(2)}`;
    }).join('\n');
    const extra = rows.length > 10 ? `\n… e mais ${rows.length - 10} lançamento(s).` : '';

    return `✅ *${rows.length} lançamento(s) importado(s)* (${quemGastou})\n\n${linhas}${extra}\n\n💸 *Total:* R$ ${total.toFixed(2)}\n\n_Conferir/editar no app._`;
  } catch (err) {
    console.error('[Twilio Webhook] Erro no processImageMessage:', err);
    return '❌ Erro ao processar a imagem. Tente novamente.';
  }
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

  // Categorias de despesa com gasto, ordenadas por valor.
  const todasCategorias = context.categorias
    .filter((c) => c.tipo === 'despesa' && c.gasto > 0)
    .sort((a, b) => b.gasto - a.gasto)
    .slice(0, 8);

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
