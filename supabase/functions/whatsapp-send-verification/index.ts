import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Cliente com token do usuário para verificar autenticação
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getUser(token);
    
    if (claimsError || !claimsData.user) {
      return new Response(
        JSON.stringify({ error: 'Token inválido' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.user.id;

    // Cliente com service role para operações no banco
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { phone_number } = await req.json();

    if (!phone_number) {
      return new Response(
        JSON.stringify({ error: 'Número de telefone é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validar formato do número
    const cleanPhone = phone_number.replace(/\D/g, '');
    if (!/^55\d{10,11}$/.test(cleanPhone)) {
      return new Response(
        JSON.stringify({ error: 'Número inválido. Use o formato: 5531999999999' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se o número já está vinculado a outro usuário
    const { data: existingUser } = await supabase
      .from('whatsapp_finance_users')
      .select('usuario_id')
      .eq('phone_number', cleanPhone)
      .neq('usuario_id', userId)
      .maybeSingle();

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: 'Este número já está vinculado a outra conta' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar rate limiting (máximo 3 tentativas por hora)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('whatsapp_verification_codes')
      .select('*', { count: 'exact', head: true })
      .eq('usuario_id', userId)
      .eq('phone_number', cleanPhone)
      .gte('created_at', oneHourAgo);

    if (count && count >= 3) {
      return new Response(
        JSON.stringify({ error: 'Muitas tentativas. Aguarde 1 hora.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Gerar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos

    // Salvar código no banco
    const { error: insertError } = await supabase
      .from('whatsapp_verification_codes')
      .insert({
        usuario_id: userId,
        phone_number: cleanPhone,
        code,
        expires_at: expiresAt.toISOString()
      });

    if (insertError) {
      console.error('[Verification] Erro ao salvar código:', insertError);
      throw insertError;
    }

    // Enviar código via WhatsApp (projeto Saúde)
    const healthWebhookUrl = Deno.env.get('HEALTH_WEBHOOK_URL');
    
    if (!healthWebhookUrl) {
      console.error('[Verification] HEALTH_WEBHOOK_URL não configurada');
      return new Response(
        JSON.stringify({ error: 'Serviço de envio não configurado' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const message = `🔐 *Código de Verificação*\n\nSeu código é: *${code}*\n\nEste código expira em 5 minutos.\n\n_Controle Financeiro_`;

    // Payload com múltiplos formatos para compatibilidade
    const webhookPayload = {
      // Formato original
      phone: cleanPhone,
      message,
      // Formato Twilio/WhatsApp API
      to: cleanPhone,
      body: message,
      // Formato alternativo
      recipient: cleanPhone,
      text: message
    };

    console.log('[Verification] Enviando para webhook:', {
      url: healthWebhookUrl.substring(0, 50) + '...',
      phone: cleanPhone,
      messageLength: message.length,
      payload: JSON.stringify(webhookPayload).substring(0, 200)
    });

    const webhookResponse = await fetch(healthWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookPayload)
    });

    const responseStatus = webhookResponse.status;
    const responseText = await webhookResponse.text();
    
    console.log('[Verification] Resposta do webhook:', {
      status: responseStatus,
      ok: webhookResponse.ok,
      body: responseText.substring(0, 500)
    });

    if (!webhookResponse.ok) {
      console.error('[Verification] Erro ao enviar WhatsApp:', {
        status: responseStatus,
        body: responseText
      });
      return new Response(
        JSON.stringify({ error: 'Falha ao enviar código. Tente novamente.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Verification] ✅ Código enviado com sucesso para ${cleanPhone}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Código enviado para seu WhatsApp',
        expires_in: 300 // 5 minutos em segundos
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Verification] Erro:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
