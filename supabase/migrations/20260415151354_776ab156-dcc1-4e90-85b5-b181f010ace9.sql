
-- Add ciclo_id column (if not added by failed migration)
ALTER TABLE public.category_budgets ADD COLUMN IF NOT EXISTS ciclo_id text DEFAULT NULL;

-- Drop old unique constraint
ALTER TABLE public.category_budgets DROP CONSTRAINT IF EXISTS category_budgets_usuario_id_categoria_nome_categoria_tipo_key;

-- Create new unique index using COALESCE to handle NULLs
CREATE UNIQUE INDEX IF NOT EXISTS idx_category_budgets_unique_with_ciclo 
ON public.category_budgets (usuario_id, categoria_nome, categoria_tipo, COALESCE(ciclo_id, '__global__'));
