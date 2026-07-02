
CREATE TABLE public.contas_bancarias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'corrente',
  banco TEXT,
  saldo_inicial NUMERIC NOT NULL DEFAULT 0,
  cor TEXT DEFAULT '#3B82F6',
  incluir_no_saldo BOOLEAN NOT NULL DEFAULT true,
  ativo BOOLEAN NOT NULL DEFAULT true,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.contas_bancarias TO authenticated;
GRANT ALL ON public.contas_bancarias TO service_role;

ALTER TABLE public.contas_bancarias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own contas" ON public.contas_bancarias
  FOR ALL USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);

CREATE TRIGGER trg_contas_bancarias_updated
  BEFORE UPDATE ON public.contas_bancarias
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.lancamentos ADD COLUMN IF NOT EXISTS conta_id UUID REFERENCES public.contas_bancarias(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_lancamentos_conta_id ON public.lancamentos(conta_id);

ALTER TABLE public.cartoes_credito ADD COLUMN IF NOT EXISTS conta_id UUID REFERENCES public.contas_bancarias(id) ON DELETE SET NULL;

ALTER TABLE public.user_preferences ADD COLUMN IF NOT EXISTS conta_padrao_id UUID REFERENCES public.contas_bancarias(id) ON DELETE SET NULL;
