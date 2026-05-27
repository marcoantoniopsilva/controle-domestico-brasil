## Problema

Feedback de um novo usuário expôs 3 bugs no fluxo WhatsApp que ainda assumem o ambiente do Marco/Bruna:

1. **Relatório diário "completo" mostra "Compras do Marco / Compras da Bruna / Presentes/roupas Aurora"** mesmo para outros usuários — o template Twilio `HXe114dce7a30e14b0aa6e97f680549e78` tem esses rótulos fixos no corpo, só os valores são variáveis. Por isso só `Casa` e `Supermercado` (categorias que coincidem com as do usuário novo) bateram com algum gasto; o resto ficou R$0.
2. **URL antigo** `https://controle-domestico-brasil.lovable.app` aparece na mensagem "Número não cadastrado" — deveria ser a URL atual (`https://plannerplenna.lovable.app`).
3. **`whatsapp-finance` (assistente do chat) e `twilio-webhook`** usam listas fixas de categorias com nomes do Marco/Bruna (`Cartão de Crédito Marco`, `Salário Bruna`, `Compras do Marco`, etc.) ao montar o contexto e a lista prioritária — o assistente acaba ignorando as categorias reais do usuário.

## Mudanças

### 1. `supabase/functions/whatsapp-daily-report/index.ts` — relatório "completo" genérico

Hoje o tipo `completo` envia variáveis para um template com rótulos fixos do casal. Vou redirecioná-lo para o **mesmo template `TWILIO_TEMPLATE_CATEGORIAS_SID`** (uma única variável de texto livre), que aceita conteúdo dinâmico:

- `getTemplateSid('completo')` passa a retornar `TWILIO_TEMPLATE_CATEGORIAS_SID` (com fallback para o template antigo se a secret não existir, mantendo compatibilidade).
- Em `buildTemplateVariables`, o branch `completo` monta `{ "1": linha }` com:
  - Saldo do ciclo
  - Top 6 categorias de despesa do próprio usuário (ordenadas por `gasto desc`, e se nenhum gasto, pelas de maior `orçamento`)
  - Dias restantes
  - Separadas por `▪️` (Twilio não aceita `\n` em `ContentVariables`), respeitando limite de 1000 chars.
- Removo do `ReportData` os campos hardcoded `comprasMarco`, `comprasBruna`, `presentesAurora`, `appsRestaurantes`, `casa`, `supermercado` (não são mais usados depois da mudança acima).

Resultado: qualquer usuário recebe um resumo coerente com as próprias categorias.

### 2. URL correto na mensagem "Número não cadastrado"

Trocar `https://controle-domestico-brasil.lovable.app` por `https://plannerplenna.lovable.app` em:
- `supabase/functions/twilio-webhook/index.ts` linha 98
- `supabase/functions/whatsapp-finance/index.ts` linha 108

### 3. `twilio-webhook/index.ts` — remover lista fixa de categorias prioritárias

A constante `categoriasPrioritarias` (linhas 42-51, contém "Compras da Bruna", "Compras do Marco", "Presentes/roupas Aurora") influencia o contexto que o Gemini recebe quando o usuário pergunta sobre gastos.

- Remover a constante.
- Em `buildContextoTexto` (linhas ~518-529), simplificar para: pegar todas as categorias de despesa do usuário com `gasto > 0`, ordenar por `gasto desc`, limitar às top 8. Sem priorização por nome.

### 4. `whatsapp-finance/index.ts` — usar categorias reais do usuário

Hoje o assistente monta o contexto a partir de `categoriasDefault` (lista hardcoded com Marco/Bruna). Substituir por busca real:

- Remover a constante `categoriasDefault` (linhas 50-68).
- Em `getFinancialContext` (~linha 212), buscar `categorias` do usuário (`select nome, tipo, orcamento where usuario_id = ... and ativa = true`) e mapear gastos/orçamentos sobre essa lista — mesmo padrão já usado em `whatsapp-daily-report`.

## Sem mudanças

- Sem migração de banco — só lógica de edge function.
- Sem alteração na UI / configuração do usuário — o tipo de relatório "completo" continua existindo, só passa a ser dinâmico.
- Templates Twilio existentes ficam intocados; o "completo" antigo simplesmente deixa de ser usado por código (mas continua disponível como fallback se a secret `TWILIO_TEMPLATE_CATEGORIAS_SID` estiver vazia).

## Deploy

Após as edições: redeploy de `whatsapp-daily-report`, `twilio-webhook` e `whatsapp-finance`. Validação rápida disparando `whatsapp-daily-report?force=true&phone=<numero_do_novo_usuário>` e checando o conteúdo recebido.
