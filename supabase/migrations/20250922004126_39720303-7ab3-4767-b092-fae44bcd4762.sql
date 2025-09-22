-- Atualizar o orçamento da categoria "Presentes/roupas Aurora" para R$ 300
UPDATE category_budgets 
SET orcamento = 300
WHERE categoria_nome = 'Presentes/roupas Aurora' AND categoria_tipo = 'despesa';