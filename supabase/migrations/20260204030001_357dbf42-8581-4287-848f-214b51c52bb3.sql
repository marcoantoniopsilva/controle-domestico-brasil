-- Tabela para vincular números WhatsApp aos usuários do sistema financeiro
CREATE TABLE public.whatsapp_finance_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL,
  phone_number text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  report_frequency text NOT NULL DEFAULT 'daily',
  report_hour integer NOT NULL DEFAULT 8,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_whatsapp_finance_users_updated_at
  BEFORE UPDATE ON public.whatsapp_finance_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.whatsapp_finance_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own WhatsApp config"
  ON public.whatsapp_finance_users FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can insert their own WhatsApp config"
  ON public.whatsapp_finance_users FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update their own WhatsApp config"
  ON public.whatsapp_finance_users FOR UPDATE
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can delete their own WhatsApp config"
  ON public.whatsapp_finance_users FOR DELETE
  USING (auth.uid() = usuario_id);

-- Index para busca rápida por telefone (usado pela Edge Function)
CREATE INDEX idx_whatsapp_finance_users_phone ON public.whatsapp_finance_users(phone_number);

-- Index para busca de relatórios por hora (usado pelo cron job)
CREATE INDEX idx_whatsapp_finance_users_report ON public.whatsapp_finance_users(is_active, report_frequency, report_hour);