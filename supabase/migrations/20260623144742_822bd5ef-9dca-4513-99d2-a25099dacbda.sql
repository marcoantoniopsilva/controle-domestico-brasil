ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS cartao_padrao_id uuid NULL
  REFERENCES public.cartoes_credito(id) ON DELETE SET NULL;