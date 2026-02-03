import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

interface WhatsAppPayload {
  phone: string;
  message: string;
  userId: string;
  mediaUrl?: string;
  mediaType?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate API Key
    const apiKey = req.headers.get('X-API-Key');
    const expectedKey = Deno.env.get('ROUTER_API_KEY');
    
    if (expectedKey && apiKey !== expectedKey) {
      console.error('Unauthorized request - invalid API key');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse payload from router
    const payload: WhatsAppPayload = await req.json();
    const { phone, message, userId, mediaUrl, mediaType } = payload;

    console.log(`Received message from ${phone} (userId: ${userId}): ${message}`);
    
    if (mediaUrl) {
      console.log(`Media attached: ${mediaType} - ${mediaUrl}`);
    }

    // TODO: Implement financial message processing logic here
    // For now, return a simple acknowledgment
    const response = `💰 Recebi sua mensagem: "${message}". Em breve implementaremos comandos financeiros!`;

    return new Response(
      JSON.stringify({ response }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing WhatsApp message:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
