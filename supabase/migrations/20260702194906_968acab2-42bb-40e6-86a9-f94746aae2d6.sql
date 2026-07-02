
CREATE TABLE public.metas_financeiras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL,
  nome text NOT NULL,
  tipo text NOT NULL DEFAULT 'outro',
  valor_alvo numeric NOT NULL CHECK (valor_alvo > 0),
  valor_inicial numeric NOT NULL DEFAULT 0,
  prazo date,
  cor text NOT NULL DEFAULT '#3b82f6',
  icone text NOT NULL DEFAULT 'Target',
  concluida boolean NOT NULL DEFAULT false,
  ordem int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.metas_financeiras TO authenticated;
GRANT ALL ON public.metas_financeiras TO service_role;

ALTER TABLE public.metas_financeiras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users select own metas" ON public.metas_financeiras
  FOR SELECT TO authenticated USING (auth.uid() = usuario_id);
CREATE POLICY "Users insert own metas" ON public.metas_financeiras
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Users update own metas" ON public.metas_financeiras
  FOR UPDATE TO authenticated USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Users delete own metas" ON public.metas_financeiras
  FOR DELETE TO authenticated USING (auth.uid() = usuario_id);

CREATE TRIGGER trg_metas_financeiras_updated_at
  BEFORE UPDATE ON public.metas_financeiras
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_metas_financeiras_usuario ON public.metas_financeiras(usuario_id);

CREATE TABLE public.metas_aportes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meta_id uuid NOT NULL REFERENCES public.metas_financeiras(id) ON DELETE CASCADE,
  usuario_id uuid NOT NULL,
  valor numeric NOT NULL CHECK (valor > 0),
  data date NOT NULL DEFAULT current_date,
  observacao text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.metas_aportes TO authenticated;
GRANT ALL ON public.metas_aportes TO service_role;

ALTER TABLE public.metas_aportes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users select own aportes" ON public.metas_aportes
  FOR SELECT TO authenticated USING (auth.uid() = usuario_id);
CREATE POLICY "Users insert own aportes" ON public.metas_aportes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Users update own aportes" ON public.metas_aportes
  FOR UPDATE TO authenticated USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Users delete own aportes" ON public.metas_aportes
  FOR DELETE TO authenticated USING (auth.uid() = usuario_id);

CREATE INDEX idx_metas_aportes_meta ON public.metas_aportes(meta_id);
CREATE INDEX idx_metas_aportes_usuario ON public.metas_aportes(usuario_id);
