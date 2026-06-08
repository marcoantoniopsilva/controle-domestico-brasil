-- Restrict anon access on bot_config INSERT
DROP POLICY IF EXISTS "Users can insert their own bot config" ON public.bot_config;
CREATE POLICY "Users can insert their own bot config" ON public.bot_config
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Restrict anon access on keywords INSERT
DROP POLICY IF EXISTS "Users can insert their own keywords" ON public.keywords;
CREATE POLICY "Users can insert their own keywords" ON public.keywords
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Restrict anon access on whatsapp_finance_users write policies
DROP POLICY IF EXISTS "Users can insert their own whatsapp finance user" ON public.whatsapp_finance_users;
DROP POLICY IF EXISTS "Users can update their own whatsapp finance user" ON public.whatsapp_finance_users;
DROP POLICY IF EXISTS "Users can delete their own whatsapp finance user" ON public.whatsapp_finance_users;

CREATE POLICY "Users can insert their own whatsapp finance user" ON public.whatsapp_finance_users
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Users can update their own whatsapp finance user" ON public.whatsapp_finance_users
  FOR UPDATE TO authenticated USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Users can delete their own whatsapp finance user" ON public.whatsapp_finance_users
  FOR DELETE TO authenticated USING (auth.uid() = usuario_id);

-- Block client inserts into admin_audit_logs (only service_role/edge functions should write)
CREATE POLICY "Block client inserts on audit logs" ON public.admin_audit_logs
  AS RESTRICTIVE FOR INSERT TO anon, authenticated WITH CHECK (false);