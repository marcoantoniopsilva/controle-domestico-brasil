import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function parseISO(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function calcularProxima(atual: Date, freq: string, diaMes?: number | null, diaSemana?: number | null): Date {
  const d = new Date(atual);
  if (freq === "semanal") { d.setDate(d.getDate() + 7); return d; }
  if (freq === "anual") { d.setFullYear(d.getFullYear() + 1); return d; }
  const alvo = diaMes || d.getDate();
  const prox = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  const ultimo = new Date(prox.getFullYear(), prox.getMonth() + 1, 0).getDate();
  prox.setDate(Math.min(alvo, ultimo));
  return prox;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const cronSecret = Deno.env.get("CRON_SECRET");

    const authHeader = req.headers.get("authorization") || "";
    const cronHeader = req.headers.get("x-cron-secret") || "";
    const token = authHeader.replace("Bearer ", "");

    // Modo cron: chamado pelo pg_cron com CRON_SECRET header ou como request agendado
    const isCron = cronSecret && cronHeader === cronSecret;

    const admin = createClient(supabaseUrl, serviceKey);

    let usuarioId: string | null = null;
    if (!isCron) {
      // Chamado por usuário autenticado — processar só as recorrências dele
      const userClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
      });
      const { data: { user }, error: authErr } = await userClient.auth.getUser();
      if (authErr || !user) {
        return new Response(JSON.stringify({ error: "Não autenticado" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      usuarioId = user.id;
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const hojeStr = toISO(hoje);

    let q = admin
      .from("lancamentos_recorrentes")
      .select("*")
      .eq("ativo", true)
      .lte("proxima_execucao", hojeStr);
    if (usuarioId) q = q.eq("usuario_id", usuarioId);

    const { data: recorrentes, error } = await q;
    if (error) throw error;

    let criados = 0;
    for (const r of recorrentes || []) {
      // Materializa todas as ocorrências vencidas até hoje (caso o cron tenha falhado por dias)
      let prox = parseISO(r.proxima_execucao);
      const fim = r.data_fim ? parseISO(r.data_fim) : null;

      while (prox <= hoje) {
        if (fim && prox > fim) break;
        const dataStr = toISO(prox);

        // Idempotência: evitar duplicar no mesmo dia
        const { data: existente } = await admin
          .from("lancamentos")
          .select("id")
          .eq("recorrente_id", r.id)
          .eq("data", dataStr)
          .maybeSingle();

        if (!existente) {
          const { error: insErr } = await admin.from("lancamentos").insert({
            usuario_id: r.usuario_id,
            data: dataStr,
            categoria: r.categoria,
            valor: r.valor,
            parcelas: r.parcelas || 1,
            quem_gastou: r.quem_gastou,
            descricao: r.descricao,
            tipo: r.tipo,
            ganhos: 0,
            cartao_id: r.cartao_id,
            conta_id: r.conta_id,
            recorrente_id: r.id,
          });
          if (insErr) {
            console.error("Erro ao inserir lançamento:", insErr);
            break;
          }
          criados++;
        }

        const nova = calcularProxima(prox, r.frequencia, r.dia_mes, r.dia_semana);
        // atualiza no banco a cada iteração para persistir progresso
        await admin
          .from("lancamentos_recorrentes")
          .update({ proxima_execucao: toISO(nova), ultima_execucao: dataStr })
          .eq("id", r.id);
        prox = nova;

        if (fim && prox > fim) {
          await admin.from("lancamentos_recorrentes").update({ ativo: false }).eq("id", r.id);
          break;
        }
      }
    }

    return new Response(JSON.stringify({ criados, processadas: recorrentes?.length || 0 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[processar-recorrentes] erro:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});