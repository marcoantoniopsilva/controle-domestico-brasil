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
  name: "create_transaction",
  title: "Criar lançamento",
  description:
    "Cria um novo lançamento financeiro para o usuário autenticado. Despesas devem ter valor negativo; receitas e investimentos positivos.",
  inputSchema: {
    data: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .describe("Data do lançamento no formato YYYY-MM-DD."),
    categoria: z.string().min(1).describe("Nome da categoria (deve existir em list_categories)."),
    valor: z.number().describe("Valor em reais. Despesas devem ser negativas."),
    tipo: z.enum(["despesa", "receita", "investimento"]),
    descricao: z.string().optional(),
    parcelas: z.number().int().min(1).max(60).optional().describe("Número de parcelas (padrão 1)."),
    quem_gastou: z.string().optional(),
    cartao_id: z.string().uuid().optional(),
    conta_id: z.string().uuid().optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Não autenticado" }], isError: true };
    }
    const { data, error } = await sb(ctx)
      .from("lancamentos")
      .insert({
        usuario_id: ctx.getUserId(),
        data: input.data,
        categoria: input.categoria,
        valor: input.valor,
        tipo: input.tipo,
        descricao: input.descricao ?? null,
        parcelas: input.parcelas ?? 1,
        quem_gastou: input.quem_gastou ?? null,
        cartao_id: input.cartao_id ?? null,
        conta_id: input.conta_id ?? null,
        ganhos: 0,
      })
      .select()
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Lançamento criado: ${data.id}` }],
      structuredContent: { lancamento: data },
    };
  },
});