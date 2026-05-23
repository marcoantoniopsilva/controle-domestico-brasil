import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = userData.user.id;
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Apaga dados do usuário (tabelas que não têm cascade em auth.users)
    const tables: Array<{ table: string; column: string }> = [
      { table: "lancamentos", column: "usuario_id" },
      { table: "categorias", column: "usuario_id" },
      { table: "categoria_grupos", column: "usuario_id" },
      { table: "category_budgets", column: "usuario_id" },
      { table: "simulacoes_orcamento", column: "usuario_id" },
      { table: "user_preferences", column: "usuario_id" },
      { table: "whatsapp_finance_users", column: "usuario_id" },
      { table: "whatsapp_verification_codes", column: "usuario_id" },
      { table: "user_roles", column: "user_id" },
      { table: "user_profiles", column: "user_id" },
      { table: "user_addresses", column: "user_id" },
      { table: "user_criteria_preferences", column: "user_id" },
      { table: "conversations", column: "user_id" },
      { table: "properties", column: "user_id" },
      { table: "auto_search_results", column: "user_id" },
      { table: "bot_config", column: "user_id" },
      { table: "keywords", column: "user_id" },
      { table: "waha_config", column: "user_id" },
      { table: "subscribers", column: "user_id" },
    ];

    for (const { table, column } of tables) {
      const { error } = await admin.from(table).delete().eq(column, userId);
      if (error) console.error(`Erro ao deletar ${table}:`, error.message);
    }

    // Apaga objetos do storage do usuário (prefixo userId/)
    try {
      const { data: files } = await admin.storage.from("financas4.0").list(userId, { limit: 1000 });
      if (files && files.length > 0) {
        const paths = files.map((f) => `${userId}/${f.name}`);
        await admin.storage.from("financas4.0").remove(paths);
      }
    } catch (e) {
      console.error("Erro ao limpar storage:", e);
    }

    // Finalmente, apaga o usuário do auth
    const { error: delErr } = await admin.auth.admin.deleteUser(userId);
    if (delErr) {
      return new Response(JSON.stringify({ error: delErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("delete-account error:", e);
    return new Response(JSON.stringify({ error: e?.message ?? "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});