
UPDATE public.lancamentos
SET categoria = 'Outros'
WHERE usuario_id = '84618d95-3564-4a0e-b8f0-4370d65f3cdb'
  AND categoria = 'Essence'
  AND tipo = 'despesa';

DELETE FROM public.category_budgets
WHERE usuario_id = '84618d95-3564-4a0e-b8f0-4370d65f3cdb'
  AND categoria_nome = 'Essence'
  AND categoria_tipo = 'despesa';

DELETE FROM public.categorias
WHERE id = '75e133e8-b3f4-4a43-acd9-3f0e51efc620';
