import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";

function sb(ctx: ToolContext) {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );
}

export default defineTool({
  name: "list_goals",
  title: "Listar metas & reservas",
  description: "Lista as metas financeiras (reservas, viagens, compras) do usuário com o total aportado em cada uma.",
  inputSchema: {},
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Não autenticado" }], isError: true };
    }
    const client = sb(ctx);
    const { data: metas, error } = await client
      .from("metas_financeiras")
      .select("*")
      .order("ordem");
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const ids = (metas ?? []).map((m: any) => m.id);
    const aportesPor: Record<string, number> = {};
    if (ids.length > 0) {
      const { data: aportes } = await client
        .from("metas_aportes")
        .select("meta_id,valor")
        .in("meta_id", ids);
      for (const a of aportes ?? []) {
        aportesPor[a.meta_id] = (aportesPor[a.meta_id] ?? 0) + Number(a.valor);
      }
    }
    const enriched = (metas ?? []).map((m: any) => ({
      ...m,
      total_aportado: Number(m.valor_inicial ?? 0) + (aportesPor[m.id] ?? 0),
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(enriched) }],
      structuredContent: { metas: enriched },
    };
  },
});