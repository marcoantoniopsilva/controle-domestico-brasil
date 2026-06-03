import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CategoriaTotal {
  nome: string;
  atual: number;
  anterior: number;
  orcamento: number;
}

interface RequestBody {
  cicloNome: string;
  totalReceitas: number;
  totalDespesas: number;
  totalReceitasAnterior: number;
  totalDespesasAnterior: number;
  categorias: CategoriaTotal[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get("GOOGLE_GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "GOOGLE_GEMINI_API_KEY não configurada" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = (await req.json()) as RequestBody;

    // Construir contexto compacto e claro
    const topCategorias = body.categorias
      .filter((c) => c.atual > 0 || c.anterior > 0)
      .sort((a, b) => b.atual - a.atual)
      .slice(0, 10);

    const contextoCategorias = topCategorias
      .map((c) => {
        const variacao = c.anterior > 0 ? Math.round(((c.atual - c.anterior) / c.anterior) * 100) : null;
        const orcadoInfo = c.orcamento > 0 ? `, orçamento R$ ${c.orcamento.toFixed(2)}` : "";
        const varInfo = variacao !== null ? `, variação ${variacao > 0 ? "+" : ""}${variacao}% vs ciclo anterior` : "";
        return `- ${c.nome}: R$ ${c.atual.toFixed(2)}${orcadoInfo}${varInfo}`;
      })
      .join("\n");

    const prompt = `Você é um consultor financeiro pessoal brasileiro. Analise os dados do ciclo "${body.cicloNome}" e gere EXATAMENTE 3 insights curtos, específicos e acionáveis em português brasileiro.

DADOS DO CICLO ATUAL:
- Receitas: R$ ${body.totalReceitas.toFixed(2)} (anterior: R$ ${body.totalReceitasAnterior.toFixed(2)})
- Despesas: R$ ${body.totalDespesas.toFixed(2)} (anterior: R$ ${body.totalDespesasAnterior.toFixed(2)})

TOP CATEGORIAS:
${contextoCategorias}

REGRAS para cada insight:
- Máximo 80 caracteres
- Comece com um emoji relevante
- Seja específico: cite categoria + valor ou percentual real
- Varie os tipos: 1 positivo (economia/bom desempenho), 1 alerta (gasto alto/estourou), 1 dica acionável
- Não invente dados; use somente os valores fornecidos
- Se não houver dado suficiente para um tipo, foque no que houver`;

    const geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + GEMINI_API_KEY;

    const resp = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              insights: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    emoji: { type: "string" },
                    texto: { type: "string" },
                    tipo: { type: "string", enum: ["positivo", "negativo", "dica"] },
                  },
                  required: ["emoji", "texto", "tipo"],
                },
              },
            },
            required: ["insights"],
          },
        },
      }),
    });

    if (!resp.ok) {
      const errTxt = await resp.text();
      console.error("Gemini error:", resp.status, errTxt);
      return new Response(
        JSON.stringify({ error: "Erro ao gerar insights", details: errTxt }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await resp.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return new Response(
        JSON.stringify({ error: "Resposta vazia do Gemini" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const parsed = JSON.parse(text);
    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("dashboard-insights error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});