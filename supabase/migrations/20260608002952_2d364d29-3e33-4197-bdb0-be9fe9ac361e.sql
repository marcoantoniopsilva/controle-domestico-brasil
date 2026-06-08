
-- 1. Cartões de crédito
CREATE TABLE public.cartoes_credito (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL,
  nome text NOT NULL,
  bandeira text,
  banco text,
  cor text NOT NULL DEFAULT '#6366f1',
  dia_fechamento integer NOT NULL CHECK (dia_fechamento BETWEEN 1 AND 31),
  dia_vencimento integer NOT NULL CHECK (dia_vencimento BETWEEN 1 AND 31),
  meta_mensal numeric,
  ativo boolean NOT NULL DEFAULT true,
  ordem integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cartoes_credito TO authenticated;
GRANT ALL ON public.cartoes_credito TO service_role;

ALTER TABLE public.cartoes_credito ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cards" ON public.cartoes_credito
  FOR SELECT TO authenticated USING (auth.uid() = usuario_id);
CREATE POLICY "Users can insert own cards" ON public.cartoes_credito
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Users can update own cards" ON public.cartoes_credito
  FOR UPDATE TO authenticated USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Users can delete own cards" ON public.cartoes_credito
  FOR DELETE TO authenticated USING (auth.uid() = usuario_id);

CREATE TRIGGER update_cartoes_credito_updated_at
  BEFORE UPDATE ON public.cartoes_credito
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_cartoes_credito_usuario ON public.cartoes_credito(usuario_id);

-- 2. cartao_id em lancamentos
ALTER TABLE public.lancamentos
  ADD COLUMN cartao_id uuid NULL REFERENCES public.cartoes_credito(id) ON DELETE SET NULL;
CREATE INDEX idx_lancamentos_cartao ON public.lancamentos(cartao_id);

-- 3. Preferências
ALTER TABLE public.user_preferences
  ADD COLUMN meta_cartao_credito_total numeric NULL,
  ADD COLUMN ultimo_cartao_id uuid NULL;
