import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExtractedTransaction {
  data: string;
  descricao: string;
  valor: number;
  parcelas: number;
  parcelaAtual: number;
  categoria: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check - validate the request has a valid user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Authenticated user: ${user.id}`);

    const { imageBase64, categorias, anoReferencia } = await req.json();
    const anoRef = typeof anoReferencia === 'number' ? anoReferencia : new Date().getFullYear();
    
    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'Imagem não fornecida' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get('GOOGLE_GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      console.error('GOOGLE_GEMINI_API_KEY não configurada');
      return new Response(
        JSON.stringify({ error: 'API Key do Gemini não configurada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processando imagem com Gemini Vision...');
    console.log('Categorias disponíveis:', categorias);

    const prompt = `Você é um especialista em extrair dados de extratos de cartão de crédito e faturas.
    
Analise a imagem fornecida e extraia TODOS os lançamentos financeiros visíveis.

Para cada lançamento, extraia:
1. DATA: No formato DD/MM/AAAA ou DD/MM (se o ano não estiver visível, use ${anoRef})
2. DESCRIÇÃO: Nome do estabelecimento ou descrição do gasto
3. VALOR: Valor em reais (número decimal, sem R$)
4. PARCELAS: Se houver indicação de parcelamento (ex: "2/5" significa parcela 2 de 5), extraia o número total. Se não houver, coloque 1.
5. PARCELA ATUAL: Se houver parcelamento, qual é a parcela atual. Se não houver, coloque 1.
6. CATEGORIA: Tente categorizar baseado na descrição. Use uma destas categorias:
${categorias.join(', ')}

Se não conseguir identificar a categoria com certeza, use "Outros".

IMPORTANTE:
- Extraia TODOS os lançamentos visíveis na imagem
- Ignore linhas de total, subtotal ou informações que não sejam lançamentos
- Valores devem ser números positivos
- Datas incompletas devem ser completadas com o ano provável

Retorne APENAS um JSON válido no seguinte formato (sem markdown, sem texto adicional):
{
  "transacoes": [
    {
      "data": "DD/MM/AAAA",
      "descricao": "Nome do estabelecimento",
      "valor": 123.45,
      "parcelas": 1,
      "parcelaAtual": 1,
      "categoria": "Categoria identificada"
    }
  ]
}`;

    // Chamar API do Gemini
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: 'image/jpeg',
                    data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 8192,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro na API do Gemini:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: `Erro na API do Gemini: ${response.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Resposta do Gemini recebida');

    // Extrair o texto da resposta
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textResponse) {
      console.error('Resposta vazia do Gemini');
      return new Response(
        JSON.stringify({ error: 'Não foi possível extrair dados da imagem', transacoes: [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Texto extraído do Gemini');

    // Tentar parsear o JSON da resposta
    let transacoes: ExtractedTransaction[] = [];
    try {
      // Remover possíveis marcações de código markdown
      const jsonStr = textResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      const parsed = JSON.parse(jsonStr);
      transacoes = parsed.transacoes || [];
      
      console.log(`Extraídas ${transacoes.length} transações para usuário ${user.id}`);
    } catch (parseError) {
      console.error('Erro ao parsear JSON:', parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Erro ao processar resposta da IA', 
          transacoes: [],
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ transacoes }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na função extract-transactions:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
