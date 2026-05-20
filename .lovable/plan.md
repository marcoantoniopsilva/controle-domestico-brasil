# Relatórios WhatsApp personalizáveis

Combinar abordagens 1 + 2: ampliar o template atual e criar templates adicionais focados, permitindo que cada usuário escolha o tipo de relatório que recebe e (quando aplicável) quais categorias quer destacar.

## Tipos de relatório oferecidos

1. **Resumo completo** (atual) — saldo, categorias principais, dias restantes.
2. **Só despesas** — gastos do ciclo, top categorias de despesa, % do orçamento.
3. **Só receitas** — entradas do ciclo, comparativo com ciclo anterior.
4. **Categorias escolhidas** — usuário marca de 1 a N categorias para acompanhar; o relatório lista cada uma com gasto/orçamento/percentual.

## Mudanças no banco

Nova tabela / extensão de `whatsapp_finance_users`:

- `report_type`: `'completo' | 'despesas' | 'receitas' | 'categorias'` (default `'completo'`)
- `selected_categories`: `text[]` (usado só quando `report_type='categorias'`)

Como mudança de schema, vai por migration. Os usuários atuais ficam em `'completo'` para preservar comportamento.

## Mudanças na UI

`src/components/financas/WhatsAppConfig.tsx`:

- Novo seletor "Tipo de relatório" com as 4 opções.
- Quando "Categorias escolhidas", mostrar multi-select alimentado por `useCategorias` (filtrando ativas), com limite recomendado de 6 categorias para caber no template.
- Preview textual mostrando como o relatório vai chegar.

## Templates Twilio (Content Templates)

Precisam ser criados no Console Twilio e aprovados pela Meta. Cada um usa variáveis genéricas para servir qualquer usuário:

- **`daily_completo`** — o atual (`HXe114dce7a30e14b0aa6e97f680549e78`), mantido.
- **`daily_despesas`** — variáveis: saldo de despesas, top 6 categorias de despesa formatadas como `"Nome: R$X de R$Y (Z%)"`, dias restantes.
- **`daily_receitas`** — variáveis: total recebido, comparativo, principais fontes.
- **`daily_categorias_flex`** — template "container": cabeçalho fixo + 1 variável grande (até ~1024 chars) onde o backend monta livremente a lista de categorias escolhidas pelo usuário.

IDs dos templates ficam em uma constante mapeada por `report_type` no edge function.

## Mudanças no edge function `whatsapp-daily-report`

- Ler `report_type` e `selected_categories` do usuário.
- Selecionar `ContentSid` correto via map.
- Função `generateReportData` vira `generateReportData(type, selectedCategories)` e retorna o set de variáveis adequado a cada template.
- Para `categorias`, montar string única (uma linha por categoria) e mandar como `{{1}}` no template flex.

## Passos de entrega

1. Migration: adicionar `report_type` e `selected_categories` em `whatsapp_finance_users`.
2. Atualizar `useWhatsAppConfig` para ler/gravar os novos campos.
3. UI em `WhatsAppConfig.tsx` com seletor + multi-select de categorias + preview.
4. Criar os 3 novos templates no Twilio (ação do usuário fora do código) e me informar os ContentSids.
5. Edge function: map de templates, ramificação na geração de variáveis, ajustes nos logs.
6. Testar cada tipo via `?force=true` para um usuário de teste.

## Limitações conhecidas (regras Meta)

- Templates precisam ser pré-aprovados pela Meta — não dá pra gerar templates dinamicamente.
- Cada variável aceita ~1024 caracteres; o relatório "Categorias escolhidas" fica limitado a ~6-8 categorias na prática.
- Sempre que o usuário enviar uma mensagem ao bot, abre a janela de 24h e respostas viram freeform (já é o comportamento do `whatsapp-finance`).
