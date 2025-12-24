-- Tabela para armazenar simulações de orçamento anual
CREATE TABLE public.simulacoes_orcamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL,
  ano INTEGER NOT NULL DEFAULT 2026,
  mes INTEGER NOT NULL CHECK (mes >= 1 AND mes <= 12),
  categoria_nome TEXT NOT NULL,
  categoria_tipo TEXT NOT NULL CHECK (categoria_tipo IN ('despesa', 'receita', 'investimento')),
  valor_previsto NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(usuario_id, ano, mes, categoria_nome, categoria_tipo)
);

-- Enable Row Level Security
ALTER TABLE public.simulacoes_orcamento ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Usuários podem ver suas simulações"
  ON public.simulacoes_orcamento
  FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem inserir suas simulações"
  ON public.simulacoes_orcamento
  FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem atualizar suas simulações"
  ON public.simulacoes_orcamento
  FOR UPDATE
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem deletar suas simulações"
  ON public.simulacoes_orcamento
  FOR DELETE
  USING (auth.uid() = usuario_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_simulacoes_orcamento_updated_at
  BEFORE UPDATE ON public.simulacoes_orcamento
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();