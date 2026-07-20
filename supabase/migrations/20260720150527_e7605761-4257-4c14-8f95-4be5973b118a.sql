ALTER TABLE public.contas_bancarias
  ADD COLUMN IF NOT EXISTS saldo_atual numeric,
  ADD COLUMN IF NOT EXISTS saldo_atual_ajustado_em timestamptz;