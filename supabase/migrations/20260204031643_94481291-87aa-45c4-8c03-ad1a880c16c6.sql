-- Tabela para códigos de verificação de WhatsApp
CREATE TABLE public.whatsapp_verification_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL,
  phone_number text NOT NULL,
  code text NOT NULL,
  expires_at timestamptz NOT NULL,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.whatsapp_verification_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own verification codes"
  ON public.whatsapp_verification_codes FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can insert their own verification codes"
  ON public.whatsapp_verification_codes FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update their own verification codes"
  ON public.whatsapp_verification_codes FOR UPDATE
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can delete their own verification codes"
  ON public.whatsapp_verification_codes FOR DELETE
  USING (auth.uid() = usuario_id);

-- Index para busca rápida
CREATE INDEX idx_whatsapp_verification_phone ON public.whatsapp_verification_codes(phone_number, code);
CREATE INDEX idx_whatsapp_verification_expires ON public.whatsapp_verification_codes(expires_at);

-- Adicionar coluna de verificação na tabela principal
ALTER TABLE public.whatsapp_finance_users 
ADD COLUMN is_verified boolean NOT NULL DEFAULT false;
