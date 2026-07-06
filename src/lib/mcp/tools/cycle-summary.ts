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

function calcularCiclo(diaInicio: number, ref: Date) {
  const ano = ref.getFullYear();
  const mes = ref.getMonth();
  const dia = ref.getDate();
  let inicioMes = mes;
  let inicioAno = ano;
  if (dia < diaInicio) {
    inicioMes = mes - 1;
    if (inicioMes < 0) {
      inicioMes = 11;
      inicioAno -= 1;
    }
  }
  const inicio = new Date(inicioAno, inicioMes, diaInicio);
  const fim = new Date(inicioAno, inicioMes + 1, diaInicio - 1);
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return { inicio: fmt(inicio), fim: fmt(fim) };
}

export default defineTool({
  name: "cycle_summary",
  title: "Resumo do ciclo",
  description:
    "Retorna o resumo financeiro do ciclo atual (ou de uma data de referência): total de receitas, despesas, investimentos e saldo.",
  inputSchema: {
    data_referencia: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .describe("Data dentro do ciclo desejado. Padrão: hoje."),
  },
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: async ({ data_referencia }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Não autenticado" }], isError: true };
    }
    const client = sb(ctx);
    const { data: prefs } = await client
      .from("user_preferences")
      .select("cycle_start_day")
      .eq("usuario_id", ctx.getUserId())
      .maybeSingle();
    const diaInicio = prefs?.cycle_start_day ?? 25;
    const ref = data_referencia ? new Date(data_referencia + "T12:00:00") : new Date();
    const ciclo = calcularCiclo(diaInicio, ref);

    const { data, error } = await client
      .from("lancamentos")
      .select("valor,tipo,ganhos")
      .gte("data", ciclo.inicio)
      .lte("data", ciclo.fim);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    let receitas = 0;
    let despesas = 0;
    let investimentos = 0;
    let ganhos = 0;
    for (const t of data ?? []) {
      const v = Number(t.valor);
      if (t.tipo === "receita") receitas += v;
      else if (t.tipo === "despesa") despesas += Math.abs(v);
      else if (t.tipo === "investimento") investimentos += v;
      ganhos += Number(t.ganhos ?? 0);
    }
    const saldo = receitas - despesas - investimentos + ganhos;
    const resumo = {
      ciclo,
      total_receitas: receitas,
      total_despesas: despesas,
      total_investimentos: investimentos,
      total_ganhos: ganhos,
      saldo,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(resumo, null, 2) }],
      structuredContent: resumo,
    };
  },
});