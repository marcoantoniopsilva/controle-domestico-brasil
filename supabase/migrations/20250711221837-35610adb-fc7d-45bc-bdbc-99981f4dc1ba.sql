
-- Adicionar novo tipo "investimento" e campo para ganhos
ALTER TABLE lancamentos 
ADD COLUMN ganhos NUMERIC DEFAULT 0;

-- Atualizar a constraint de tipo para incluir investimentos
-- Primeiro, vamos remover a constraint existente se houver
-- ALTER TABLE lancamentos DROP CONSTRAINT IF EXISTS lancamentos_tipo_check;

-- Adicionar nova constraint incluindo investimentos
-- ALTER TABLE lancamentos ADD CONSTRAINT lancamentos_tipo_check CHECK (tipo IN ('despesa', 'receita', 'investimento'));

-- Comentário: O campo ganhos será usado para armazenar os ganhos/perdas dos investimentos
-- Para despesas e receitas, este campo permanecerá 0 por padrão
