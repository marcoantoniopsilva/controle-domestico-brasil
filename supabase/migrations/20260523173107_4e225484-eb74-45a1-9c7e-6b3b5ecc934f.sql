
-- 1. Remove unused properties table from realtime publication
ALTER PUBLICATION supabase_realtime DROP TABLE public.properties;

-- 2. Add UPDATE policy on messages, scoped to conversation owner
CREATE POLICY "Users can update messages in their conversations"
ON public.messages
FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = messages.conversation_id AND c.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = messages.conversation_id AND c.user_id = auth.uid()));

-- 3. Restrictive policies on user_roles preventing self-assignment
CREATE POLICY "Block client inserts on user_roles"
ON public.user_roles
AS RESTRICTIVE
FOR INSERT
TO authenticated, anon
WITH CHECK (false);

CREATE POLICY "Block client updates on user_roles"
ON public.user_roles
AS RESTRICTIVE
FOR UPDATE
TO authenticated, anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Block client deletes on user_roles"
ON public.user_roles
AS RESTRICTIVE
FOR DELETE
TO authenticated, anon
USING (false);

-- 4. Tighten financas4 storage policies to exclude anonymous JWT users
DROP POLICY IF EXISTS "financas4 users can view own files" ON storage.objects;
DROP POLICY IF EXISTS "financas4 users can upload own files" ON storage.objects;
DROP POLICY IF EXISTS "financas4 users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "financas4 users can delete own files" ON storage.objects;

CREATE POLICY "financas4 users can view own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'financas4.0'
  AND (auth.uid())::text = (storage.foldername(name))[1]
  AND coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
);

CREATE POLICY "financas4 users can upload own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'financas4.0'
  AND (auth.uid())::text = (storage.foldername(name))[1]
  AND coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
);

CREATE POLICY "financas4 users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'financas4.0'
  AND (auth.uid())::text = (storage.foldername(name))[1]
  AND coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
)
WITH CHECK (
  bucket_id = 'financas4.0'
  AND (auth.uid())::text = (storage.foldername(name))[1]
  AND coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
);

CREATE POLICY "financas4 users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'financas4.0'
  AND (auth.uid())::text = (storage.foldername(name))[1]
  AND coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
);

-- 5. Revoke EXECUTE from anon/authenticated on internal trigger functions
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_user_profiles_updated_at() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_user_criteria_preferences_updated_at() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_setup() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.seed_default_categorias(uuid) FROM anon, authenticated, public;
