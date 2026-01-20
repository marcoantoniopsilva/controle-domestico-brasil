-- Fix 1: Drop unused "Dados planilha" table (it has no user_id, is empty, and not used in application code)
DROP TABLE IF EXISTS public."Dados planilha";

-- Fix 2: Add DELETE policy for messages table so users can delete messages from their own conversations
CREATE POLICY "Users can delete messages from their conversations" 
ON public.messages 
FOR DELETE 
USING (EXISTS (
  SELECT 1 
  FROM conversations 
  WHERE conversations.id = messages.conversation_id 
  AND conversations.user_id = auth.uid()
));

-- Fix 3: Tighten subscribers table - restrict SELECT to only own data
DROP POLICY IF EXISTS "subscribers_select_policy" ON public.subscribers;
CREATE POLICY "subscribers_select_own_policy" 
ON public.subscribers 
FOR SELECT 
USING (auth.uid() = user_id);