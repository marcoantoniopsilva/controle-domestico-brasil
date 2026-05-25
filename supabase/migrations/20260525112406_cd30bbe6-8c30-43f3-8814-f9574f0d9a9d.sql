
-- admin_audit_logs: block client deletes/updates entirely
CREATE POLICY "No deletes on audit logs"
ON public.admin_audit_logs AS RESTRICTIVE
FOR DELETE TO public USING (false);

CREATE POLICY "No updates on audit logs"
ON public.admin_audit_logs AS RESTRICTIVE
FOR UPDATE TO public USING (false) WITH CHECK (false);

-- auto_search_results: restrict INSERT to authenticated
DROP POLICY "Users can insert their own auto search results" ON public.auto_search_results;
CREATE POLICY "Users can insert their own auto search results"
ON public.auto_search_results
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- conversations: restrict INSERT to authenticated
DROP POLICY "Users can insert their own conversations" ON public.conversations;
CREATE POLICY "Users can insert their own conversations"
ON public.conversations
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- simulacoes_orcamento: restrict INSERT to authenticated
DROP POLICY "Usuários podem inserir suas simulações" ON public.simulacoes_orcamento;
CREATE POLICY "Usuários podem inserir suas simulações"
ON public.simulacoes_orcamento
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = usuario_id);

-- whatsapp_verification_codes: restrict all to authenticated
DROP POLICY "Users can insert their own verification codes" ON public.whatsapp_verification_codes;
DROP POLICY "Users can update their own verification codes" ON public.whatsapp_verification_codes;
DROP POLICY "Users can delete their own verification codes" ON public.whatsapp_verification_codes;
DROP POLICY "Users can view their own verification codes" ON public.whatsapp_verification_codes;

CREATE POLICY "Users can insert their own verification codes"
ON public.whatsapp_verification_codes
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update their own verification codes"
ON public.whatsapp_verification_codes
FOR UPDATE TO authenticated
USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can delete their own verification codes"
ON public.whatsapp_verification_codes
FOR DELETE TO authenticated
USING (auth.uid() = usuario_id);

CREATE POLICY "Users can view their own verification codes"
ON public.whatsapp_verification_codes
FOR SELECT TO authenticated
USING (auth.uid() = usuario_id);

-- subscribers: restrict SELECT to authenticated
DROP POLICY "subscribers_select_own_policy" ON public.subscribers;
CREATE POLICY "subscribers_select_own_policy"
ON public.subscribers
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- subscribers: prevent users from modifying billing-critical fields via UPDATE
DROP POLICY "subscribers_update_policy" ON public.subscribers;
CREATE POLICY "subscribers_update_policy"
ON public.subscribers
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND email   = (SELECT s.email   FROM public.subscribers s WHERE s.id = subscribers.id)
  AND COALESCE(stripe_customer_id, '') = COALESCE((SELECT s.stripe_customer_id FROM public.subscribers s WHERE s.id = subscribers.id), '')
);
