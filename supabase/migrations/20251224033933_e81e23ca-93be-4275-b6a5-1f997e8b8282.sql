-- Fix RLS policies to only allow 'authenticated' role, not 'anon'
-- This prevents anonymous users from accessing data

-- Drop and recreate policies for auto_search_results
DROP POLICY IF EXISTS "Users can delete their own auto search results" ON public.auto_search_results;
DROP POLICY IF EXISTS "Users can update their own auto search results" ON public.auto_search_results;
DROP POLICY IF EXISTS "Users can view their own auto search results" ON public.auto_search_results;

CREATE POLICY "Users can delete their own auto search results" ON public.auto_search_results
FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own auto search results" ON public.auto_search_results
FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own auto search results" ON public.auto_search_results
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Drop and recreate policies for bot_config
DROP POLICY IF EXISTS "Users can delete their own bot config" ON public.bot_config;
DROP POLICY IF EXISTS "Users can update their own bot config" ON public.bot_config;
DROP POLICY IF EXISTS "Users can view their own bot config" ON public.bot_config;

CREATE POLICY "Users can delete their own bot config" ON public.bot_config
FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own bot config" ON public.bot_config
FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own bot config" ON public.bot_config
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Drop and recreate policies for category_budgets
DROP POLICY IF EXISTS "Restrict delete to authenticated users" ON public.category_budgets;
DROP POLICY IF EXISTS "Restrict update to authenticated users" ON public.category_budgets;
DROP POLICY IF EXISTS "Restrict view to authenticated users" ON public.category_budgets;

CREATE POLICY "Restrict delete to authenticated users" ON public.category_budgets
FOR DELETE TO authenticated USING (auth.uid() = usuario_id);

CREATE POLICY "Restrict update to authenticated users" ON public.category_budgets
FOR UPDATE TO authenticated USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Restrict view to authenticated users" ON public.category_budgets
FOR SELECT TO authenticated USING (auth.uid() = usuario_id);

-- Drop and recreate policies for conversations
DROP POLICY IF EXISTS "Users can delete their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;

CREATE POLICY "Users can delete their own conversations" ON public.conversations
FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" ON public.conversations
FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own conversations" ON public.conversations
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Drop and recreate policies for keywords
DROP POLICY IF EXISTS "Users can delete their own keywords" ON public.keywords;
DROP POLICY IF EXISTS "Users can update their own keywords" ON public.keywords;
DROP POLICY IF EXISTS "Users can view their own keywords" ON public.keywords;

CREATE POLICY "Users can delete their own keywords" ON public.keywords
FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own keywords" ON public.keywords
FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own keywords" ON public.keywords
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Drop and recreate policies for lancamentos
DROP POLICY IF EXISTS "Restrict delete to authenticated users" ON public.lancamentos;
DROP POLICY IF EXISTS "Restrict update to authenticated users" ON public.lancamentos;
DROP POLICY IF EXISTS "Restrict view to authenticated users" ON public.lancamentos;

CREATE POLICY "Restrict delete to authenticated users" ON public.lancamentos
FOR DELETE TO authenticated USING (auth.uid() = usuario_id);

CREATE POLICY "Restrict update to authenticated users" ON public.lancamentos
FOR UPDATE TO authenticated USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Restrict view to authenticated users" ON public.lancamentos
FOR SELECT TO authenticated USING (auth.uid() = usuario_id);

-- Drop and recreate policies for messages
DROP POLICY IF EXISTS "Users can view messages from their conversations" ON public.messages;

CREATE POLICY "Users can view messages from their conversations" ON public.messages
FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE conversations.id = messages.conversation_id 
    AND conversations.user_id = auth.uid()
  )
);

-- Drop and recreate policies for properties
DROP POLICY IF EXISTS "Restrict delete to authenticated users" ON public.properties;
DROP POLICY IF EXISTS "Restrict update to authenticated users" ON public.properties;
DROP POLICY IF EXISTS "Restrict view to authenticated users" ON public.properties;

CREATE POLICY "Restrict delete to authenticated users" ON public.properties
FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Restrict update to authenticated users" ON public.properties
FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Restrict view to authenticated users" ON public.properties
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Drop and recreate policies for simulacoes_orcamento
DROP POLICY IF EXISTS "Usuários podem atualizar suas simulações" ON public.simulacoes_orcamento;
DROP POLICY IF EXISTS "Usuários podem deletar suas simulações" ON public.simulacoes_orcamento;
DROP POLICY IF EXISTS "Usuários podem ver suas simulações" ON public.simulacoes_orcamento;

CREATE POLICY "Usuários podem atualizar suas simulações" ON public.simulacoes_orcamento
FOR UPDATE TO authenticated USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem deletar suas simulações" ON public.simulacoes_orcamento
FOR DELETE TO authenticated USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem ver suas simulações" ON public.simulacoes_orcamento
FOR SELECT TO authenticated USING (auth.uid() = usuario_id);

-- Drop and recreate policies for subscribers
DROP POLICY IF EXISTS "subscribers_delete_policy" ON public.subscribers;
DROP POLICY IF EXISTS "subscribers_select_policy" ON public.subscribers;
DROP POLICY IF EXISTS "subscribers_update_policy" ON public.subscribers;

CREATE POLICY "subscribers_delete_policy" ON public.subscribers
FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "subscribers_select_policy" ON public.subscribers
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "subscribers_update_policy" ON public.subscribers
FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Drop and recreate policies for user_addresses
DROP POLICY IF EXISTS "Restrict delete to authenticated users" ON public.user_addresses;
DROP POLICY IF EXISTS "Restrict update to authenticated users" ON public.user_addresses;
DROP POLICY IF EXISTS "Restrict view to authenticated users" ON public.user_addresses;

CREATE POLICY "Restrict delete to authenticated users" ON public.user_addresses
FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Restrict update to authenticated users" ON public.user_addresses
FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Restrict view to authenticated users" ON public.user_addresses
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Drop and recreate policies for user_criteria_preferences
DROP POLICY IF EXISTS "Restrict delete to authenticated users" ON public.user_criteria_preferences;
DROP POLICY IF EXISTS "Restrict update to authenticated users" ON public.user_criteria_preferences;
DROP POLICY IF EXISTS "Restrict view to authenticated users" ON public.user_criteria_preferences;

CREATE POLICY "Restrict delete to authenticated users" ON public.user_criteria_preferences
FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Restrict update to authenticated users" ON public.user_criteria_preferences
FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Restrict view to authenticated users" ON public.user_criteria_preferences
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Drop and recreate policies for user_profiles
DROP POLICY IF EXISTS "Restrict delete to authenticated users" ON public.user_profiles;
DROP POLICY IF EXISTS "Restrict update to authenticated users" ON public.user_profiles;
DROP POLICY IF EXISTS "Restrict view to authenticated users" ON public.user_profiles;

CREATE POLICY "Restrict delete to authenticated users" ON public.user_profiles
FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Restrict update to authenticated users" ON public.user_profiles
FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Restrict view to authenticated users" ON public.user_profiles
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Drop and recreate policies for user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Drop and recreate policies for waha_config
DROP POLICY IF EXISTS "Users can delete their own Evolution config" ON public.waha_config;
DROP POLICY IF EXISTS "Users can update their own Evolution config" ON public.waha_config;
DROP POLICY IF EXISTS "Users can view their own Evolution config" ON public.waha_config;

CREATE POLICY "Users can delete their own Evolution config" ON public.waha_config
FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own Evolution config" ON public.waha_config
FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own Evolution config" ON public.waha_config
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Drop and recreate policies for Dados planilha
DROP POLICY IF EXISTS "Restrict to authenticated users only" ON public."Dados planilha";

CREATE POLICY "Restrict to authenticated users only" ON public."Dados planilha"
FOR ALL TO authenticated USING (true) WITH CHECK (true);