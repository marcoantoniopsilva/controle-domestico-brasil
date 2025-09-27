-- Atualizar orçamentos das categorias conforme solicitado
UPDATE category_budgets 
SET orcamento = 800
WHERE categoria_nome = 'Aplicativos e restaurantes' AND categoria_tipo = 'despesa';

UPDATE category_budgets 
SET orcamento = 800
WHERE categoria_nome = 'Saúde' AND categoria_tipo = 'despesa';

UPDATE category_budgets 
SET orcamento = 2300
WHERE categoria_nome = 'Supermercado' AND categoria_tipo = 'despesa';

-- Renomear categoria "Uber / transporte" para "Seguro, Carro e Uber" e atualizar orçamento
UPDATE category_budgets 
SET categoria_nome = 'Seguro, Carro e Uber', orcamento = 500
WHERE categoria_nome = 'Uber / transporte' AND categoria_tipo = 'despesa';

-- Atualizar transações existentes com o novo nome da categoria
UPDATE lancamentos 
SET categoria = 'Seguro, Carro e Uber'
WHERE categoria = 'Uber / transporte';