
-- 1) Remove client-side INSERT capability on admin_audit_logs.
-- Audit log entries should only be written by edge functions using the service role.
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname='public' AND tablename='admin_audit_logs' AND cmd='INSERT'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.admin_audit_logs', pol.policyname);
  END LOOP;
END$$;

REVOKE INSERT ON public.admin_audit_logs FROM authenticated, anon;

-- 2) Protect waha_config.api_token from client read/write.
-- Service role retains full access; authenticated users can no longer read or modify the token column.
REVOKE SELECT (api_token), UPDATE (api_token), INSERT (api_token) ON public.waha_config FROM authenticated, anon;
