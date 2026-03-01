
-- Migrar lançamentos: Seguro, Carro e Uber → Seguro e manutenção
UPDATE public.lancamentos SET categoria = 'Seguro e manutenção' WHERE categoria = 'Seguro, Carro e Uber';

-- Migrar lançamentos: Fraldas Aurora → Recarga carro
UPDATE public.lancamentos SET categoria = 'Recarga carro' WHERE categoria = 'Fraldas Aurora';

-- Migrar orçamentos customizados: Seguro, Carro e Uber → Seguro e manutenção
UPDATE public.category_budgets SET categoria_nome = 'Seguro e manutenção' WHERE categoria_nome = 'Seguro, Carro e Uber';

-- Migrar orçamentos customizados: Fraldas Aurora → Recarga carro
UPDATE public.category_budgets SET categoria_nome = 'Recarga carro' WHERE categoria_nome = 'Fraldas Aurora';
