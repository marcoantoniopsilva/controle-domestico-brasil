-- Atualizar o nome da categoria nas transações existentes
UPDATE lancamentos 
SET categoria = 'Presentes/roupas Aurora' 
WHERE categoria = 'Aniversário da Aurora';

-- Atualizar também nos orçamentos customizados se existirem
UPDATE category_budgets 
SET categoria_nome = 'Presentes/roupas Aurora' 
WHERE categoria_nome = 'Aniversário da Aurora';