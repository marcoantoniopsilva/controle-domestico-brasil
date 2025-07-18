-- Criar tabela para orçamentos personalizados de categorias
CREATE TABLE public.category_budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL,
  categoria_nome TEXT NOT NULL,
  categoria_tipo TEXT NOT NULL CHECK (categoria_tipo IN ('despesa', 'receita', 'investimento')),
  orcamento NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(usuario_id, categoria_nome, categoria_tipo)
);

-- Habilitar RLS
ALTER TABLE public.category_budgets ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para controle de acesso
CREATE POLICY "Usuários podem ver seus próprios orçamentos de categoria" 
ON public.category_budgets 
FOR SELECT 
USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem criar seus próprios orçamentos de categoria" 
ON public.category_budgets 
FOR INSERT 
WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem atualizar seus próprios orçamentos de categoria" 
ON public.category_budgets 
FOR UPDATE 
USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem excluir seus próprios orçamentos de categoria" 
ON public.category_budgets 
FOR DELETE 
USING (auth.uid() = usuario_id);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_category_budgets_updated_at
BEFORE UPDATE ON public.category_budgets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();