import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

interface WhatsAppRequest {
  phone: string;
  message: string;
  userId: string;
  userName: string;
  mediaUrl?: string;
  mediaType?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validar API Key
    const apiKey = req.headers.get('x-api-key');
    const expectedKey = Deno.env.get('FINANCE_API_KEY');

    if (!apiKey || apiKey !== expectedKey) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload: WhatsAppRequest = await req.json();
    const { phone, message, userId, userName } = payload;

    console.log(`[Finance] Mensagem de ${userName} (${phone}): ${message}`);

    // TODO: Adicionar sua lógica de processamento aqui
    // Por exemplo: registrar gastos, consultar saldo, etc.

    const response = processFinanceMessage(message, userName);

    return new Response(
      JSON.stringify({ response }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Finance] Erro:', error);
    return new Response(
      JSON.stringify({ response: '❌ Ocorreu um erro ao processar sua mensagem.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function processFinanceMessage(message: string, userName: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('ajuda') || lowerMessage === 'help') {
    return `💰 *Comandos Financeiros*\n\n` +
      `📝 *Registrar gasto:* "gastei 50 reais com almoço"\n` +
      `📊 *Ver resumo:* "quanto gastei esse mês"\n` +
      `💳 *Ver saldo:* "qual meu saldo"\n` +
      `🔄 *Voltar para Saúde:* /saude`;
  }

  // Placeholder - substitua pela sua lógica real
  return `💰 Olá ${userName}!\n\n` +
    `Recebi sua mensagem: "${message}"\n\n` +
    `_Este é o módulo financeiro. Implemente sua lógica aqui!_\n\n` +
    `Digite *ajuda* para ver os comandos disponíveis.`;
}
