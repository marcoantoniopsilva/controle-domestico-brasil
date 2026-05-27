
ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS responsaveis text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS responsavel_padrao text;

-- Backfill: para cada usuário, lista de quem_gastou distintos a partir de lancamentos.
WITH agg AS (
  SELECT usuario_id, ARRAY_AGG(DISTINCT quem_gastou) FILTER (WHERE quem_gastou IS NOT NULL AND quem_gastou <> '') AS nomes
  FROM public.lancamentos
  GROUP BY usuario_id
),
latest AS (
  SELECT DISTINCT ON (usuario_id) usuario_id, quem_gastou
  FROM public.lancamentos
  WHERE quem_gastou IS NOT NULL AND quem_gastou <> ''
  ORDER BY usuario_id, data DESC, id DESC
)
UPDATE public.user_preferences up
SET
  responsaveis = CASE
    WHEN COALESCE(array_length(up.responsaveis,1),0) > 0 THEN up.responsaveis
    WHEN a.nomes IS NOT NULL AND array_length(a.nomes,1) > 0 THEN a.nomes
    ELSE ARRAY['Você']::text[]
  END,
  responsavel_padrao = COALESCE(up.responsavel_padrao, l.quem_gastou, (a.nomes)[1], 'Você')
FROM (SELECT usuario_id FROM public.user_preferences) ids
LEFT JOIN agg a ON a.usuario_id = ids.usuario_id
LEFT JOIN latest l ON l.usuario_id = ids.usuario_id
WHERE up.usuario_id = ids.usuario_id;

-- Atualizar seed para novos usuários: criar user_preferences já com responsaveis default
CREATE OR REPLACE FUNCTION public.handle_new_user_setup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _nome text;
BEGIN
  _nome := COALESCE(NULLIF(split_part(NEW.email, '@', 1), ''), 'Você');
  INSERT INTO public.user_preferences (usuario_id, onboarding_completed, responsaveis, responsavel_padrao)
  VALUES (NEW.id, false, ARRAY[_nome]::text[], _nome)
  ON CONFLICT (usuario_id) DO NOTHING;
  PERFORM public.seed_default_categorias(NEW.id);
  RETURN NEW;
END;
$function$;
