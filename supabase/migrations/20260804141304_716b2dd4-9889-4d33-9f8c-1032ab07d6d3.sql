ALTER TABLE public.whatsapp_finance_users
ADD COLUMN IF NOT EXISTS weekly_report_days smallint[] NOT NULL DEFAULT '{}'::smallint[];

UPDATE public.whatsapp_finance_users
SET weekly_report_days = ARRAY[weekly_report_day]::smallint[]
WHERE cardinality(weekly_report_days) = 0;