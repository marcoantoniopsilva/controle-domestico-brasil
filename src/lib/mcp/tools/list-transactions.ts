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
  name: "list_transactions",
  title: "Listar lançamentos",
  description:
    "Lista os lançamentos financeiros (despesas, receitas, investimentos) do usuário autenticado. Aceita filtros opcionais por intervalo de datas, tipo e categoria.",
  inputSchema: {
    data_inicio: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .describe("Data inicial no formato YYYY-MM-DD."),
    data_fim: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .describe("Data final no formato YYYY-MM-DD."),
    tipo: z.enum(["despesa", "receita", "investimento"]).optional(),
    categoria: z.string().optional().describe("Filtrar por nome exato de categoria."),
    limit: z.number().int().min(1).max(500).optional().describe("Máximo de registros (padrão 100)."),
  },
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: async ({ data_inicio, data_fim, tipo, categoria, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Não autenticado" }], isError: true };
    }
    let q = sb(ctx)
      .from("lancamentos")
      .select("id,data,categoria,valor,parcelas,quem_gastou,descricao,tipo,ganhos,cartao_id,conta_id")
      .order("data", { ascending: false })
      .limit(limit ?? 100);
    if (data_inicio) q = q.gte("data", data_inicio);
    if (data_fim) q = q.lte("data", data_fim);
    if (tipo) q = q.eq("tipo", tipo);
    if (categoria) q = q.eq("categoria", categoria);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { transacoes: data ?? [] },
    };
  },
});