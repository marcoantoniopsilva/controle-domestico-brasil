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
    
    // Cliente com token do usuário
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

    const { phone_number, code } = await req.json();

    if (!phone_number || !code) {
      return new Response(
        JSON.stringify({ error: 'Número e código são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cleanPhone = phone_number.replace(/\D/g, '');
    const cleanCode = code.replace(/\D/g, '');

    // Buscar código válido
    const now = new Date().toISOString();
    const { data: verification, error: verifyError } = await supabase
      .from('whatsapp_verification_codes')
      .select('*')
      .eq('usuario_id', userId)
      .eq('phone_number', cleanPhone)
      .eq('code', cleanCode)
      .gt('expires_at', now)
      .is('verified_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (verifyError) {
      console.error('[VerifyCode] Erro ao buscar código:', verifyError);
      throw verifyError;
    }

    if (!verification) {
      return new Response(
        JSON.stringify({ error: 'Código inválido ou expirado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Marcar código como verificado
    await supabase
      .from('whatsapp_verification_codes')
      .update({ verified_at: now })
      .eq('id', verification.id);

    // Verificar se já existe configuração para este usuário
    const { data: existingConfig } = await supabase
      .from('whatsapp_finance_users')
      .select('id')
      .eq('usuario_id', userId)
      .maybeSingle();

    if (existingConfig) {
      // Atualizar existente
      const { error: updateError } = await supabase
        .from('whatsapp_finance_users')
        .update({
          phone_number: cleanPhone,
          is_verified: true,
          updated_at: now
        })
        .eq('id', existingConfig.id);

      if (updateError) throw updateError;
    } else {
      // Criar novo
      const { error: insertError } = await supabase
        .from('whatsapp_finance_users')
        .insert({
          usuario_id: userId,
          phone_number: cleanPhone,
          is_verified: true
        });

      if (insertError) throw insertError;
    }

    // Limpar códigos antigos deste usuário/telefone
    await supabase
      .from('whatsapp_verification_codes')
      .delete()
      .eq('usuario_id', userId)
      .eq('phone_number', cleanPhone)
      .neq('id', verification.id);

    console.log(`[VerifyCode] Número ${cleanPhone} verificado para usuário ${userId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Número verificado com sucesso!' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[VerifyCode] Erro:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
