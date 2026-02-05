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

    // Verificar rate limiting (máximo 10 tentativas por hora - aumentado para testes)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('whatsapp_verification_codes')
      .select('*', { count: 'exact', head: true })
      .eq('usuario_id', userId)
      .eq('phone_number', cleanPhone)
      .gte('created_at', oneHourAgo);

    if (count && count >= 10) {
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

    // Enviar código via WhatsApp usando Twilio
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioWhatsAppNumber = Deno.env.get('TWILIO_WHATSAPP_NUMBER');
    
    if (!twilioAccountSid || !twilioAuthToken || !twilioWhatsAppNumber) {
      console.error('[Verification] Twilio não configurado:', {
        hasAccountSid: !!twilioAccountSid,
        hasAuthToken: !!twilioAuthToken,
        hasWhatsAppNumber: !!twilioWhatsAppNumber
      });
      return new Response(
        JSON.stringify({ error: 'Serviço de envio não configurado' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const message = `🔐 *Código de Verificação*\n\nSeu código é: *${code}*\n\nEste código expira em 5 minutos.\n\n_Controle Financeiro_`;

    // Formatar números para Twilio
    const fromNumber = `whatsapp:+${twilioWhatsAppNumber.replace(/\D/g, '')}`;
    const toNumber = `whatsapp:+${cleanPhone}`;

    console.log('[Verification] Enviando via Twilio:', {
      from: fromNumber,
      to: toNumber
    });

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
    
    const formData = new URLSearchParams();
    formData.append('From', fromNumber);
    formData.append('To', toNumber);
    formData.append('Body', message);

    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${twilioAccountSid}:${twilioAuthToken}`),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });

    const responseData = await twilioResponse.json().catch(() => ({}));
    
    console.log('[Verification] Resposta Twilio:', {
      status: twilioResponse.status,
      ok: twilioResponse.ok,
      data: JSON.stringify(responseData).substring(0, 500)
    });

    if (!twilioResponse.ok) {
      console.error('[Verification] Erro Twilio:', {
        status: twilioResponse.status,
        error: responseData
      });
      return new Response(
        JSON.stringify({ error: 'Falha ao enviar código. Tente novamente.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Verification] ✅ Código enviado com sucesso para ${cleanPhone} via Twilio`);

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
