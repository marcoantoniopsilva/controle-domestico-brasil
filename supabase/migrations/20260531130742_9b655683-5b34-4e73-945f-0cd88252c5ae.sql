-- Reatribuir lançamentos órfãos (categoria que não existe mais) para "Outros"
UPDATE public.lancamentos l
SET categoria = 'Outros'
WHERE l.tipo = 'despesa'
  AND NOT EXISTS (
    SELECT 1 FROM public.categorias c
    WHERE c.usuario_id = l.usuario_id
      AND c.nome = l.categoria
      AND c.tipo = l.tipo
  )
  AND EXISTS (
    SELECT 1 FROM public.categorias c2
    WHERE c2.usuario_id = l.usuario_id
      AND c2.nome = 'Outros'
      AND c2.tipo = 'despesa'
  );