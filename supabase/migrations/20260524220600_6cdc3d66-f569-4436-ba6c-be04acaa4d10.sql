SELECT cron.schedule(
  'whatsapp-hourly-report',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url:='https://eepkixxqvelppxzfwoin.supabase.co/functions/v1/whatsapp-daily-report',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlcGtpeHhxdmVscHB4emZ3b2luIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNTQ3MDIsImV4cCI6MjA2MDkzMDcwMn0.fPkjY979Pr2fKjVds0Byq3UAQ6Z5w0bBGaS48_LTBA4"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);