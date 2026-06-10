## Contexto

Os 2 jobs de cron já existem (`whatsapp-daily-report` jobid 2 e `whatsapp-hourly-report` jobid 3), mas estão batendo na edge function com `Authorization: Bearer <anon_key>`. Há 2 dias a função passou a exigir `Bearer <service_role>` OU header `x-cron-secret`, então as últimas 525 execuções retornaram **HTTP 401** — por isso o relatório parou de chegar.

Como você não é o dono dos jobs no `pg_cron`, `cron.unschedule` e `cron.schedule` dão `permission denied`. Mas `cron.alter_job` funciona para o dono atual e permite trocar só o `command`.

## O que fazer

Você roda **um único SQL** no SQL Editor do Supabase, substituindo `COLE_AQUI_O_VALOR_DO_CRON_SECRET` pelo valor real do secret `CRON_SECRET` (o mesmo que está em Edge Function Secrets).

```sql
-- Job diário (23:00 UTC = 20:00 BRT)
select cron.alter_job(
  job_id := 2,
  command := $cmd$
    select net.http_post(
      url := 'https://eepkixxqvelppxzfwoin.supabase.co/functions/v1/whatsapp-daily-report',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-cron-secret', 'COLE_AQUI_O_VALOR_DO_CRON_SECRET'
      ),
      body := '{}'::jsonb
    );
  $cmd$
);

-- Job horário (toda hora cheia)
select cron.alter_job(
  job_id := 3,
  command := $cmd$
    select net.http_post(
      url := 'https://eepkixxqvelppxzfwoin.supabase.co/functions/v1/whatsapp-daily-report',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-cron-secret', 'COLE_AQUI_O_VALOR_DO_CRON_SECRET'
      ),
      body := '{}'::jsonb
    );
  $cmd$
);
```

## Verificação (rodar 5 min depois)

```sql
select jobid, status, return_message, start_time
from cron.job_run_details
where jobid in (2,3)
order by start_time desc
limit 10;
```

Esperado: `status = succeeded` e o `return_message` contendo `200`. Se aparecer `401`, o valor colado não bate com o secret `CRON_SECRET`.

## O que NÃO vou mexer

- Código da edge function `whatsapp-daily-report` (a checagem de auth está correta do ponto de vista de segurança).
- Secrets já configurados.
- Frontend / fluxo do Twilio (o webhook de mensagem do usuário não passa pelo cron).

## Observação sobre o job horário

O `jobid 3` (`whatsapp-hourly-report`) está agendado para rodar de hora em hora, mas chama a mesma função do relatório diário. A própria função já filtra usuários pela hora preferida deles, então isso está ok — só queria registrar para você saber.
