import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

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
  name: "list_categories",
  title: "Listar categorias",
  description: "Lista as categorias ativas do usuário com seus orçamentos.",
  inputSchema: {
    tipo: z.enum(["despesa", "receita", "investimento"]).optional(),
  },
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: async ({ tipo }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Não autenticado" }], isError: true };
    }
    let q = sb(ctx)
      .from("categorias")
      .select("id,nome,tipo,orcamento,ordem,ativa")
      .eq("ativa", true)
      .order("ordem");
    if (tipo) q = q.eq("tipo", tipo);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { categorias: data ?? [] },
    };
  },
});