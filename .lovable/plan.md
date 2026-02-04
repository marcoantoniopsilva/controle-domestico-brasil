

# Plano: Comunicação WhatsApp com IA Gemini + Relatórios Automáticos

## Visao Geral

Este plano implementa um sistema completo de comunicacao via WhatsApp para o controle financeiro, permitindo:
- **Respostas inteligentes com IA Gemini** para perguntas sobre financas
- **Relatorios automaticos periodicos** com status das metas de cada categoria
- **Configuracao pelo usuario** da frequencia dos relatorios

---

## Arquitetura

```text
+-------------------+     +----------------------+     +------------------+
|   Usuario         |---->|   Projeto Saude      |---->|  whatsapp-finance|
|   WhatsApp        |     |   (Router Twilio)    |     |  (Edge Function) |
+-------------------+     +----------------------+     +------------------+
                                                              |
                                                              v
                                                       +-------------+
                                                       | Gemini AI   |
                                                       +-------------+
                                                              |
                                                              v
                                                       +-------------+
                                                       | lancamentos |
                                                       | (Database)  |
                                                       +-------------+

+------------------+     +------------------------+     +------------------+
|   pg_cron        |---->|  whatsapp-daily-report |---->|  Projeto Saude   |
|   (Scheduler)    |     |  (Edge Function)       |     |  (Envia WA)      |
+------------------+     +------------------------+     +------------------+
```

---

## Componentes a Implementar

### 1. Tabela: `whatsapp_finance_users`
Vincula numeros de WhatsApp aos usuarios do sistema financeiro.

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid | PK |
| usuario_id | uuid | FK para auth.users |
| phone_number | text | Numero WhatsApp (formato: 5531...) |
| is_active | boolean | Se notificacoes estao ativas |
| report_frequency | text | 'daily', 'weekly', 'none' |
| report_hour | integer | Hora do dia para envio (0-23) |
| created_at | timestamptz | Data de criacao |
| updated_at | timestamptz | Data de atualizacao |

### 2. Edge Function: `whatsapp-finance` (Atualizar)
Expandir a funcao existente para:
- Identificar o usuario pelo numero de telefone
- Integrar com Gemini AI para processar perguntas
- Consultar dados financeiros em tempo real
- Responder comandos como:
  - "quanto gastei este mes?"
  - "como estao minhas metas?"
  - "registrar gasto de 50 reais em supermercado"

### 3. Edge Function: `whatsapp-daily-report` (Nova)
Funcao para enviar relatorios automaticos:
- Consulta usuarios com notificacoes ativas
- Calcula status de cada categoria (orcamento vs gasto)
- Envia mensagem para o webhook do projeto Saude

### 4. Cron Job: `pg_cron`
Agendar execucao da funcao de relatorio:
- Executar a cada hora
- A funcao verifica quais usuarios devem receber relatorio naquela hora

---

## Detalhamento Tecnico

### Fase 1: Banco de Dados

**Migracao SQL:**
```sql
CREATE TABLE whatsapp_finance_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  report_frequency text NOT NULL DEFAULT 'daily',
  report_hour integer NOT NULL DEFAULT 8,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_frequency CHECK (report_frequency IN ('daily', 'weekly', 'none')),
  CONSTRAINT valid_hour CHECK (report_hour >= 0 AND report_hour <= 23)
);

-- RLS Policies
ALTER TABLE whatsapp_finance_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own config"
  ON whatsapp_finance_users FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can insert their own config"
  ON whatsapp_finance_users FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update their own config"
  ON whatsapp_finance_users FOR UPDATE
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can delete their own config"
  ON whatsapp_finance_users FOR DELETE
  USING (auth.uid() = usuario_id);

-- Index para busca por telefone
CREATE INDEX idx_whatsapp_finance_users_phone ON whatsapp_finance_users(phone_number);
```

### Fase 2: Edge Function whatsapp-finance (Atualizada)

**Funcionalidades:**
1. **Identificar usuario**: Buscar `usuario_id` pelo `phone_number`
2. **Processar com IA**: Enviar mensagem para Gemini com contexto financeiro
3. **Consultar dados**: Buscar transacoes do ciclo atual
4. **Formatar resposta**: Retornar texto formatado para WhatsApp

**Fluxo da IA:**
```text
Usuario envia: "como estao minhas metas?"
     |
     v
Edge Function consulta banco de dados
     |
     v
Monta contexto: categorias, orcamentos, gastos atuais
     |
     v
Envia para Gemini: prompt + contexto + pergunta
     |
     v
Gemini gera resposta personalizada
     |
     v
Retorna para usuario via WhatsApp
```

**Prompt do Sistema (Gemini):**
```
Voce e um assistente financeiro pessoal chamado "Controle Financeiro".
Responda de forma amigavel e concisa em portugues brasileiro.
Use emojis apropriados.
Formate para WhatsApp (use *negrito* e _italico_).

Contexto financeiro do usuario:
- Ciclo atual: {inicio} a {fim}
- Categorias e gastos: {lista de categorias com orcamento e gasto atual}
- Total de despesas: R$ {valor}
- Total de receitas: R$ {valor}
- Saldo: R$ {valor}
```

### Fase 3: Edge Function whatsapp-daily-report (Nova)

**Funcionalidades:**
1. Buscar usuarios com notificacoes ativas para a hora atual
2. Para cada usuario, calcular status financeiro
3. Montar mensagem de relatorio
4. Enviar para webhook do projeto Saude

**Formato do Relatorio:**
```
📊 *Relatorio Financeiro Diario*
Ciclo: Jan/Fev 2026

💰 *Resumo Geral*
Receitas: R$ 10.000,00
Despesas: R$ 7.500,00
Saldo: R$ 2.500,00

📋 *Status das Categorias*

🟢 Supermercado: R$ 1.800 / R$ 2.300 (78%)
🟡 Casa: R$ 950 / R$ 1.000 (95%)
🔴 Lazer: R$ 220 / R$ 180 (122%)
...

Digite *ajuda* para ver comandos disponiveis.
```

### Fase 4: Configuracao do Cron Job

**SQL para agendar (via Supabase SQL Editor):**
```sql
SELECT cron.schedule(
  'whatsapp-daily-report',
  '0 * * * *', -- A cada hora
  $$
  SELECT net.http_post(
    url:='https://eepkixxqvelppxzfwoin.supabase.co/functions/v1/whatsapp-daily-report',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer [ANON_KEY]"}'::jsonb,
    body:=jsonb_build_object('current_hour', EXTRACT(HOUR FROM NOW()))
  ) as request_id;
  $$
);
```

### Fase 5: Interface de Configuracao (Opcional)

Adicionar componente na UI para usuarios configurarem:
- Numero de WhatsApp
- Frequencia de relatorios (diario/semanal/desativado)
- Horario preferido

---

## Secrets Necessarios

| Secret | Uso |
|--------|-----|
| GOOGLE_GEMINI_API_KEY | Ja configurado - Para IA |
| FINANCE_API_KEY | Ja configurado - Autenticacao com router |
| HEALTH_WEBHOOK_URL | Novo - URL do projeto Saude para enviar mensagens |

---

## Seguranca

1. **Validacao de API Key**: Todas as chamadas validam FINANCE_API_KEY
2. **RLS no banco**: Usuarios so acessam seus proprios dados
3. **Limite de taxa**: Implementar rate limiting para evitar abuso
4. **Sanitizacao**: Validar inputs antes de processar

---

## Ordem de Implementacao

1. Criar tabela `whatsapp_finance_users` com RLS
2. Atualizar `whatsapp-finance` com integracao Gemini
3. Criar `whatsapp-daily-report` para relatorios
4. Configurar cron job no Supabase
5. Adicionar secret `HEALTH_WEBHOOK_URL`
6. Testar fluxo completo
7. (Opcional) Criar UI de configuracao

---

## Dependencias Externas

- **Projeto Saude**: Deve expor endpoint para receber mensagens a serem enviadas via WhatsApp
- **Twilio/Router**: O projeto Saude deve estar configurado para rotear mensagens corretamente

