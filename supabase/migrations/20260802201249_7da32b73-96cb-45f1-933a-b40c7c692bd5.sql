ALTER TABLE public.whatsapp_finance_users
  ADD COLUMN IF NOT EXISTS weekly_report_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS weekly_report_day smallint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS weekly_report_hour smallint NOT NULL DEFAULT 9,
  ADD COLUMN IF NOT EXISTS weekly_week_start smallint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS weekly_scope_tipo text NOT NULL DEFAULT 'grupo',
  ADD COLUMN IF NOT EXISTS weekly_scope_nome text,
  ADD COLUMN IF NOT EXISTS weekly_scope_categorias text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS weekly_month_categorias text[] NOT NULL DEFAULT '{}';

ALTER TABLE public.whatsapp_finance_users
  DROP CONSTRAINT IF EXISTS whatsapp_weekly_scope_tipo_check;
ALTER TABLE public.whatsapp_finance_users
  ADD CONSTRAINT whatsapp_weekly_scope_tipo_check CHECK (weekly_scope_tipo IN ('grupo','categoria'));