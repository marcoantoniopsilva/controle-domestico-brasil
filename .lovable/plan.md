## Remover Infobip do projeto

O fluxo de WhatsApp roda 100% no Twilio. O Infobip ficou como código legado e abre superfície de ataque sem benefício. Vou limpar tudo.

### O que será feito

1. **Apagar a edge function `infobip-webhook`**
   - Remove `supabase/functions/infobip-webhook/index.ts`
   - Chama `supabase--delete_edge_functions` para tirar do Supabase também

2. **Apagar os secrets do Infobip**
   - `INFOBIP_API_KEY`
   - `INFOBIP_BASE_URL`
   - `INFOBIP_WHATSAPP_NUMBER`
   - `INFOBIP_WEBHOOK_SECRET` (o que acabei de adicionar — não será mais necessário)

3. **Não mexer no Twilio**
   - `twilio-webhook`, `whatsapp-send-verification`, `whatsapp-verify-code`, `whatsapp-daily-report` e os secrets `TWILIO_*` ficam exatamente como estão.
   - `CRON_SECRET` continua válido para proteger o relatório diário do Twilio.

### O que você precisa fazer depois

- **Painel do Infobip:** se houver um webhook apontando para `…/infobip-webhook`, pode remover lá também (opcional — depois de apagada, a URL retorna 404 de qualquer forma).
- **Cron do relatório diário (Twilio):** segue valendo a instrução anterior — configurar o header `x-cron-secret` no `pg_cron` que dispara `whatsapp-daily-report`.

### Observação de segurança

Depois da limpeza, o scanner não terá mais o endpoint Infobip aberto para reclamar. Vou atualizar a `@security-memory` registrando que Infobip foi removido e Twilio é o único provedor WhatsApp.
