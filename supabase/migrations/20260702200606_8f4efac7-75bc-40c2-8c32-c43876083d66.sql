
CREATE TABLE public.lancamentos_recorrentes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL,
  descricao text NOT NULL,
  categoria text NOT NULL,
  valor numeric NOT NULL,
  tipo text NOT NULL DEFAULT 'despesa',
  frequencia text NOT NULL DEFAULT 'mensal', -- mensal|semanal|anual
  dia_mes int,   -- 1-31 (mensal/anual)
  mes_ano int,   -- 1-12 (anual)
  dia_semana int, -- 0-6 (semanal)
  data_inicio date NOT NULL DEFAULT current_date,
  data_fim date,
  cartao_id uuid REFERENCES public.cartoes_credito(id) ON DELETE SET NULL,
  conta_id uuid REFERENCES public.contas_bancarias(id) ON DELETE SET NULL,
  quem_gastou text,
  parcelas int NOT NULL DEFAULT 1,
  ativo boolean NOT NULL DEFAULT true,
  proxima_execucao date NOT NULL DEFAULT current_date,
  ultima_execucao date,
  observacao text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.lancamentos_recorrentes TO authenticated;
GRANT ALL ON public.lancamentos_recorrentes TO service_role;

ALTER TABLE public.lancamentos_recorrentes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own recurrences"
  ON public.lancamentos_recorrentes
  FOR ALL
  TO authenticated
  USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);

CREATE TRIGGER update_lancamentos_recorrentes_updated_at
  BEFORE UPDATE ON public.lancamentos_recorrentes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Coluna opcional em lancamentos para rastrear origem
ALTER TABLE public.lancamentos
  ADD COLUMN IF NOT EXISTS recorrente_id uuid REFERENCES public.lancamentos_recorrentes(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_lancamentos_recorrentes_prox
  ON public.lancamentos_recorrentes(usuario_id, proxima_execucao) WHERE ativo = true;
