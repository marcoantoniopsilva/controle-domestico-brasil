UPDATE public.lancamentos
SET categoria = 'Outros'
WHERE usuario_id = '84618d95-3564-4a0e-b8f0-4370d65f3cdb'
  AND categoria IN ('Carro e Uber', 'Compras parceladas');

DELETE FROM public.categorias
WHERE usuario_id = '84618d95-3564-4a0e-b8f0-4370d65f3cdb'
  AND nome IN ('Carro e Uber', 'Compras parceladas');