-- Remove the openai_api_key column from bot_config table
-- The OpenAI API key should be stored securely in Supabase secrets (OPENAI_API_KEY)
-- and accessed only through edge functions with service_role

ALTER TABLE public.bot_config DROP COLUMN IF EXISTS openai_api_key;