-- Inserir novo número de WhatsApp usando auth.uid() do usuário existente
-- Como a tabela tem RLS, precisamos fazer via função que usa service_role
-- Primeiro, vamos criar uma política temporária para permitir insert via service_role

-- Criar política para permitir service_role fazer insert
CREATE POLICY "Service role can insert" ON public.whatsapp_finance_users
FOR INSERT TO service_role
WITH CHECK (true);

-- Criar política para permitir service_role fazer select
CREATE POLICY "Service role can select" ON public.whatsapp_finance_users
FOR SELECT TO service_role
USING (true);