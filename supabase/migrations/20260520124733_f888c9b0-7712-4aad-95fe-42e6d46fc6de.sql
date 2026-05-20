
-- ============================================================
-- Migration: user preferences, custom categories & cycle config
-- ============================================================

-- 1. user_preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL UNIQUE,
  cycle_start_day int NOT NULL DEFAULT 25 CHECK (cycle_start_day BETWEEN 1 AND 28),
  onboarding_completed boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own preferences" ON public.user_preferences
  FOR SELECT TO authenticated USING (auth.uid() = usuario_id);
CREATE POLICY "Users insert own preferences" ON public.user_preferences
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Users update own preferences" ON public.user_preferences
  FOR UPDATE TO authenticated USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Users delete own preferences" ON public.user_preferences
  FOR DELETE TO authenticated USING (auth.uid() = usuario_id);

CREATE TRIGGER trg_user_preferences_updated
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. categoria_grupos
CREATE TABLE IF NOT EXISTS public.categoria_grupos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL,
  nome text NOT NULL,
  icone text NOT NULL DEFAULT 'Folder',
  ordem int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (usuario_id, nome)
);
ALTER TABLE public.categoria_grupos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own groups" ON public.categoria_grupos
  FOR SELECT TO authenticated USING (auth.uid() = usuario_id);
CREATE POLICY "Users insert own groups" ON public.categoria_grupos
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Users update own groups" ON public.categoria_grupos
  FOR UPDATE TO authenticated USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Users delete own groups" ON public.categoria_grupos
  FOR DELETE TO authenticated USING (auth.uid() = usuario_id);

CREATE TRIGGER trg_categoria_grupos_updated
  BEFORE UPDATE ON public.categoria_grupos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. categorias
CREATE TABLE IF NOT EXISTS public.categorias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL,
  nome text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('despesa','receita','investimento')),
  orcamento numeric NOT NULL DEFAULT 0,
  grupo_id uuid REFERENCES public.categoria_grupos(id) ON DELETE SET NULL,
  ordem int NOT NULL DEFAULT 0,
  ativa boolean NOT NULL DEFAULT true,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (usuario_id, nome, tipo)
);
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own categorias" ON public.categorias
  FOR SELECT TO authenticated USING (auth.uid() = usuario_id);
CREATE POLICY "Users insert own categorias" ON public.categorias
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Users update own categorias" ON public.categorias
  FOR UPDATE TO authenticated USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Users delete own categorias" ON public.categorias
  FOR DELETE TO authenticated USING (auth.uid() = usuario_id);

CREATE INDEX IF NOT EXISTS idx_categorias_usuario_tipo ON public.categorias (usuario_id, tipo);
CREATE INDEX IF NOT EXISTS idx_lancamentos_usuario_categoria ON public.lancamentos (usuario_id, categoria);

CREATE TRIGGER trg_categorias_updated
  BEFORE UPDATE ON public.categorias
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Default seeds (groups + categorias) for a given user
CREATE OR REPLACE FUNCTION public.seed_default_categorias(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  g_aliment uuid; g_desloc uuid; g_saude uuid; g_filhos uuid; g_pessoais uuid; g_essenc uuid; g_extra uuid; g_receitas uuid; g_invest uuid;
BEGIN
  -- Groups
  INSERT INTO categoria_grupos (usuario_id, nome, icone, ordem) VALUES
    (_user_id, 'Alimentação', 'Utensils', 1) ON CONFLICT DO NOTHING RETURNING id INTO g_aliment;
  INSERT INTO categoria_grupos (usuario_id, nome, icone, ordem) VALUES
    (_user_id, 'Deslocamento', 'Car', 2) ON CONFLICT DO NOTHING RETURNING id INTO g_desloc;
  INSERT INTO categoria_grupos (usuario_id, nome, icone, ordem) VALUES
    (_user_id, 'Saúde', 'Heart', 3) ON CONFLICT DO NOTHING RETURNING id INTO g_saude;
  INSERT INTO categoria_grupos (usuario_id, nome, icone, ordem) VALUES
    (_user_id, 'Filhos', 'Baby', 4) ON CONFLICT DO NOTHING RETURNING id INTO g_filhos;
  INSERT INTO categoria_grupos (usuario_id, nome, icone, ordem) VALUES
    (_user_id, 'Pessoais', 'User', 5) ON CONFLICT DO NOTHING RETURNING id INTO g_pessoais;
  INSERT INTO categoria_grupos (usuario_id, nome, icone, ordem) VALUES
    (_user_id, 'Essenciais', 'Home', 6) ON CONFLICT DO NOTHING RETURNING id INTO g_essenc;
  INSERT INTO categoria_grupos (usuario_id, nome, icone, ordem) VALUES
    (_user_id, 'Extraordinários', 'AlertTriangle', 7) ON CONFLICT DO NOTHING RETURNING id INTO g_extra;
  INSERT INTO categoria_grupos (usuario_id, nome, icone, ordem) VALUES
    (_user_id, 'Receitas', 'TrendingUp', 8) ON CONFLICT DO NOTHING RETURNING id INTO g_receitas;
  INSERT INTO categoria_grupos (usuario_id, nome, icone, ordem) VALUES
    (_user_id, 'Investimentos', 'PiggyBank', 9) ON CONFLICT DO NOTHING RETURNING id INTO g_invest;

  -- Refetch ids (RETURNING may be null on conflict)
  SELECT id INTO g_aliment FROM categoria_grupos WHERE usuario_id=_user_id AND nome='Alimentação';
  SELECT id INTO g_desloc FROM categoria_grupos WHERE usuario_id=_user_id AND nome='Deslocamento';
  SELECT id INTO g_saude FROM categoria_grupos WHERE usuario_id=_user_id AND nome='Saúde';
  SELECT id INTO g_filhos FROM categoria_grupos WHERE usuario_id=_user_id AND nome='Filhos';
  SELECT id INTO g_pessoais FROM categoria_grupos WHERE usuario_id=_user_id AND nome='Pessoais';
  SELECT id INTO g_essenc FROM categoria_grupos WHERE usuario_id=_user_id AND nome='Essenciais';
  SELECT id INTO g_extra FROM categoria_grupos WHERE usuario_id=_user_id AND nome='Extraordinários';
  SELECT id INTO g_receitas FROM categoria_grupos WHERE usuario_id=_user_id AND nome='Receitas';
  SELECT id INTO g_invest FROM categoria_grupos WHERE usuario_id=_user_id AND nome='Investimentos';

  -- Despesas
  INSERT INTO categorias (usuario_id, nome, tipo, orcamento, grupo_id, ordem, is_default) VALUES
    (_user_id, 'Aplicativos e restaurantes', 'despesa', 800, g_aliment, 1, true),
    (_user_id, 'Supermercado', 'despesa', 2300, g_aliment, 2, true),
    (_user_id, 'Seguro e manutenção', 'despesa', 500, g_desloc, 1, true),
    (_user_id, 'Uber', 'despesa', 120, g_desloc, 2, true),
    (_user_id, 'Recarga carro', 'despesa', 200, g_desloc, 3, true),
    (_user_id, 'Estacionamento', 'despesa', 100, g_desloc, 4, true),
    (_user_id, 'Farmácia', 'despesa', 250, g_saude, 1, true),
    (_user_id, 'Saúde', 'despesa', 800, g_saude, 2, true),
    (_user_id, 'Atividades do(a)(s) filho(a)(s)', 'despesa', 421, g_filhos, 1, true),
    (_user_id, 'Gastos com bebê', 'despesa', 200, g_filhos, 2, true),
    (_user_id, 'Presentes/roupas bebê', 'despesa', 300, g_filhos, 3, true),
    (_user_id, 'Lazer', 'despesa', 180, g_pessoais, 1, true),
    (_user_id, 'Compras à vista 1', 'despesa', 600, g_pessoais, 2, true),
    (_user_id, 'Compras à vista 2', 'despesa', 600, g_pessoais, 3, true),
    (_user_id, 'Compras parceladas 1', 'despesa', 600, g_pessoais, 4, true),
    (_user_id, 'Compras parceladas 2', 'despesa', 600, g_pessoais, 5, true),
    (_user_id, 'Casa', 'despesa', 1000, g_essenc, 1, true),
    (_user_id, 'Serviços de internet', 'despesa', 150, g_essenc, 2, true),
    (_user_id, 'Academia', 'despesa', 160, g_essenc, 3, true),
    (_user_id, 'Gato/Cachorro', 'despesa', 50, g_essenc, 4, true),
    (_user_id, 'Condomínio e aluguel', 'despesa', 6500, g_essenc, 5, true),
    (_user_id, 'Contas e convênios', 'despesa', 550, g_essenc, 6, true),
    (_user_id, 'Despesas fixas no dinheiro', 'despesa', 5200, g_essenc, 7, true),
    (_user_id, 'Doações', 'despesa', 50, g_essenc, 8, true),
    (_user_id, 'Gastos extraordinários', 'despesa', 0, g_extra, 1, true),
    (_user_id, 'Viagens', 'despesa', 300, g_extra, 2, true),
    (_user_id, 'Impostos, taxas e multas', 'despesa', 0, g_extra, 3, true),
    (_user_id, 'Outros', 'despesa', 350, g_extra, 4, true)
  ON CONFLICT (usuario_id, nome, tipo) DO NOTHING;

  -- Receitas
  INSERT INTO categorias (usuario_id, nome, tipo, orcamento, grupo_id, ordem, is_default) VALUES
    (_user_id, 'Salário', 'receita', 0, g_receitas, 1, true),
    (_user_id, '13º salário', 'receita', 0, g_receitas, 2, true),
    (_user_id, '⅓ de férias', 'receita', 0, g_receitas, 3, true),
    (_user_id, 'Gratificações/horas extras', 'receita', 0, g_receitas, 4, true),
    (_user_id, 'Restituições', 'receita', 0, g_receitas, 5, true),
    (_user_id, 'Transferências', 'receita', 0, g_receitas, 6, true),
    (_user_id, 'Outras receitas', 'receita', 0, g_receitas, 7, true)
  ON CONFLICT (usuario_id, nome, tipo) DO NOTHING;

  -- Investimentos
  INSERT INTO categorias (usuario_id, nome, tipo, orcamento, grupo_id, ordem, is_default) VALUES
    (_user_id, 'Renda Fixa', 'investimento', 0, g_invest, 1, true),
    (_user_id, 'Ações', 'investimento', 0, g_invest, 2, true),
    (_user_id, 'Fundos de Investimento', 'investimento', 0, g_invest, 3, true),
    (_user_id, 'Tesouro Direto', 'investimento', 0, g_invest, 4, true),
    (_user_id, 'CDB', 'investimento', 0, g_invest, 5, true),
    (_user_id, 'LCI/LCA', 'investimento', 0, g_invest, 6, true),
    (_user_id, 'Criptomoedas', 'investimento', 0, g_invest, 7, true),
    (_user_id, 'Previdência Privada', 'investimento', 0, g_invest, 8, true),
    (_user_id, 'Outros Investimentos', 'investimento', 0, g_invest, 9, true)
  ON CONFLICT (usuario_id, nome, tipo) DO NOTHING;
END;
$$;

-- 5. Trigger to seed on auth user creation
CREATE OR REPLACE FUNCTION public.handle_new_user_setup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_preferences (usuario_id, onboarding_completed)
  VALUES (NEW.id, false)
  ON CONFLICT (usuario_id) DO NOTHING;
  PERFORM public.seed_default_categorias(NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_setup ON auth.users;
CREATE TRIGGER on_auth_user_created_setup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_setup();

-- 6. Rename map applied to existing data
DO $$
DECLARE
  r RECORD;
  rename_map jsonb := jsonb_build_object(
    'Compras do Marco', 'Compras à vista 1',
    'Compras da Bruna', 'Compras à vista 2',
    'Compras parceladas Marco', 'Compras parceladas 1',
    'Compras parceladas Bruna', 'Compras parceladas 2',
    'Fórmula e leite Aurora', 'Gastos com bebê',
    'Atividades Aurora', 'Atividades do(a)(s) filho(a)(s)',
    'Presentes/roupas Aurora', 'Presentes/roupas bebê',
    'Gato', 'Gato/Cachorro'
  );
  rename_map_rec jsonb := jsonb_build_object(
    'Pagamento mamãe', 'Transferências',
    'Remuneração Bruna', 'Restituições'
  );
  k text;
BEGIN
  FOR k IN SELECT jsonb_object_keys(rename_map) LOOP
    UPDATE lancamentos SET categoria = rename_map->>k WHERE categoria = k AND tipo = 'despesa';
    UPDATE category_budgets SET categoria_nome = rename_map->>k
      WHERE categoria_nome = k AND categoria_tipo = 'despesa'
      AND NOT EXISTS (
        SELECT 1 FROM category_budgets cb2
        WHERE cb2.usuario_id = category_budgets.usuario_id
          AND cb2.categoria_nome = rename_map->>k
          AND cb2.categoria_tipo = 'despesa'
          AND COALESCE(cb2.ciclo_id,'') = COALESCE(category_budgets.ciclo_id,'')
      );
  END LOOP;
  FOR k IN SELECT jsonb_object_keys(rename_map_rec) LOOP
    UPDATE lancamentos SET categoria = rename_map_rec->>k WHERE categoria = k AND tipo = 'receita';
    UPDATE category_budgets SET categoria_nome = rename_map_rec->>k
      WHERE categoria_nome = k AND categoria_tipo = 'receita'
      AND NOT EXISTS (
        SELECT 1 FROM category_budgets cb2
        WHERE cb2.usuario_id = category_budgets.usuario_id
          AND cb2.categoria_nome = rename_map_rec->>k
          AND cb2.categoria_tipo = 'receita'
          AND COALESCE(cb2.ciclo_id,'') = COALESCE(category_budgets.ciclo_id,'')
      );
  END LOOP;
END $$;

-- 7. Backfill for existing users: seed defaults + add any extra categories
DO $$
DECLARE
  u uuid;
  l RECORD;
BEGIN
  FOR u IN SELECT DISTINCT usuario_id FROM lancamentos
           UNION SELECT DISTINCT usuario_id FROM category_budgets LOOP
    PERFORM public.seed_default_categorias(u);
    INSERT INTO public.user_preferences (usuario_id, onboarding_completed)
    VALUES (u, true)
    ON CONFLICT (usuario_id) DO NOTHING;
  END LOOP;

  -- Insert any category that exists in lancamentos but not yet in categorias
  FOR l IN SELECT DISTINCT usuario_id, categoria, tipo FROM lancamentos LOOP
    INSERT INTO categorias (usuario_id, nome, tipo, orcamento, ordem, is_default)
    VALUES (l.usuario_id, l.categoria, l.tipo, 0, 99, false)
    ON CONFLICT (usuario_id, nome, tipo) DO NOTHING;
  END LOOP;

  -- Apply any custom orçamento from category_budgets (global ones, ciclo_id IS NULL)
  UPDATE categorias c
  SET orcamento = cb.orcamento
  FROM category_budgets cb
  WHERE cb.usuario_id = c.usuario_id
    AND cb.categoria_nome = c.nome
    AND cb.categoria_tipo = c.tipo
    AND cb.ciclo_id IS NULL;
END $$;
