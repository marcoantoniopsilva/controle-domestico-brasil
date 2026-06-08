## Objetivo

Permitir que o usuário cadastre seus cartões de crédito (com bandeira, apelido, cor, dia de fechamento e dia de vencimento), associe lançamentos a um cartão (opcional, inclusive em lançamentos antigos via edição) e veja relatórios agrupados por fatura (fechamento→fechamento), além de poder definir metas independentes por cartão e/ou meta global de cartão de crédito. O ciclo financeiro mensal (25→24) continua intacto e segue governando o orçamento global.

## Escopo

### 1. Modelo de dados (Supabase)

Nova tabela `cartoes_credito`:
- `id`, `usuario_id`, `nome` (apelido), `bandeira` (visa/master/elo/amex/hipercard/outro), `banco` (nubank/itau/bradesco/santander/bb/caixa/inter/c6/xp/outro), `cor` (hex), `dia_fechamento` (1–31), `dia_vencimento` (1–31), `limite` (numérico, opcional/nullable — não pediu, mas deixaremos só se quiser; **na dúvida não incluo agora**), `meta_mensal` (numérico, opcional), `ativo` (bool), `ordem`, timestamps.
- RLS por `usuario_id`; GRANTs padrão authenticated + service_role.

Nova tabela `meta_cartao_global`:
- Por simplicidade vira uma coluna em `user_preferences`: `meta_cartao_credito_total` (numérico, opcional).

Alteração em `lancamentos`:
- Nova coluna `cartao_id uuid NULL REFERENCES public.cartoes_credito(id) ON DELETE SET NULL`.
- Lançamentos existentes ficam com `cartao_id = NULL` (opcional, conforme escolha).

### 2. UI — Cadastro de cartões

Nova página `/cartoes` (e item no sidebar):
- Lista de cartões com card visual (cor de fundo, ícone do banco/bandeira, apelido, fechamento dia X, vencimento dia Y).
- Botão "Novo cartão" → modal com: apelido, banco (select com ícone), bandeira (select com ícone), cor (color picker simples ou paleta predefinida), dia de fechamento, dia de vencimento, meta mensal (opcional).
- Editar / desativar / excluir.

Ícones de banco/bandeira: SVGs próprios em `src/assets/cards/` (Visa, Master, Elo, Amex, Hipercard + bancos principais). Mapa centralizado em `src/utils/cardIcons.tsx`. Fallback: ícone `CreditCard` do lucide.

### 3. Seleção em lançamentos

- Novo componente `CardSelector` (similar ao `CategorySelector`) usado em:
  - `AddTransacaoForm` — apenas quando `tipo === "despesa"` e categoria ≠ "Despesas fixas no dinheiro". Opcional. Pré-seleciona o último cartão usado pelo usuário (salvo em `user_preferences.ultimo_cartao_id`).
  - `EditTransacaoForm` — sempre disponível para despesas, permitindo atribuir cartão a lançamentos antigos.
  - `ImportarLancamentosReview` — coluna extra "Cartão" no review, com select por linha + ação em massa "aplicar cartão X a todas as linhas selecionadas".
- `useTransacaoForm` ganha estado `cartaoId` e propaga em `Omit<Transacao, "id">`.
- Tipo `Transacao` ganha `cartaoId?: string` e `cartao?: { nome, cor, banco, bandeira }` (hidratado opcionalmente no fetch).

### 4. Relatórios por cartão

Reformulação do menu "Relatório Cartão de Crédito":
- Toggle "Todos os cartões" | seletor de cartão específico.
- Quando "Todos": comportamento atual (gastos do ciclo financeiro), agora com breakdown por cartão (lista resumida com total de cada cartão e barra de progresso vs meta do cartão, se houver). Gastos sem cartão aparecem como "Sem cartão atribuído".
- Quando cartão específico: agrupar por **fatura** (período = dia seguinte ao fechamento anterior até o dia do fechamento atual). Mostrar:
  - Fatura atual (em aberto): período, total, dia do vencimento, progresso vs meta do cartão.
  - Faturas anteriores (últimas 6) em lista com total por fatura.
  - Breakdown por categoria dentro da fatura selecionada.
  - Lista de lançamentos da fatura (incluindo parcelas projetadas que cairão nela — usar a lógica de parcelas virtuais já existente).
- Nova util `src/utils/faturas.ts`: `getFaturaPeriodo(diaFechamento, refDate)` retorna `{inicio, fim, vencimento}`.

### 5. Metas

- Meta por cartão: campo no cadastro do cartão. Aparece como barra de progresso na fatura atual e no card resumo do cartão.
- Meta global de cartão de crédito: novo campo em Preferências → Orçamento. Aparece no card "Meta vs Realizado" do relatório "Todos os cartões".
- São **independentes** das metas de categoria: nada muda no orçamento por categoria.

### 6. Importação por IA (extract-transactions)

- Sem mudança no edge function (não há como inferir cartão de forma confiável).
- O usuário escolhe o cartão no review (passo 3) — opcionalmente um "cartão padrão" para o lote inteiro.

## Detalhes técnicos

**Migrations necessárias:**
1. `CREATE TABLE public.cartoes_credito (...)` + GRANTs + RLS + policies (`auth.uid() = usuario_id` para todas as 4 ações).
2. `ALTER TABLE public.lancamentos ADD COLUMN cartao_id uuid NULL REFERENCES public.cartoes_credito(id) ON DELETE SET NULL;` + index.
3. `ALTER TABLE public.user_preferences ADD COLUMN meta_cartao_credito_total numeric NULL, ADD COLUMN ultimo_cartao_id uuid NULL;`

**Arquivos novos:**
- `src/pages/Cartoes.tsx`
- `src/components/cartoes/CartaoCard.tsx`
- `src/components/cartoes/CartaoForm.tsx` (modal cadastro/edição)
- `src/components/cartoes/CartaoIcone.tsx`
- `src/components/financas/form/CardSelector.tsx`
- `src/components/financas/relatorios/RelatorioCartaoFatura.tsx`
- `src/hooks/useCartoes.ts` (CRUD + cache)
- `src/utils/faturas.ts`
- `src/utils/cardIcons.tsx` + `src/assets/cards/*.svg`

**Arquivos alterados:**
- `src/types/index.ts` — `Transacao.cartaoId`, novo tipo `CartaoCredito`.
- `src/hooks/useTransacaoForm.ts` + `useTransacaoCRUD.ts` + `useTransacaoFetch.ts` — propagar `cartaoId`.
- `src/components/financas/AddTransacaoForm.tsx` + `EditTransacaoForm.tsx` — incluir `CardSelector`.
- `src/components/financas/ImportarLancamentosReview.tsx` — coluna cartão.
- `src/components/financas/RelatorioCartaoCredito.tsx` — adicionar toggle e breakdown por cartão.
- `src/components/layout/AppSidebar.tsx` — novo item "Cartões".
- `src/App.tsx` — rota `/cartoes`.
- `src/pages/Preferencias.tsx` — campo meta global de cartão.

**Cálculo de fatura:** dado `diaFechamento = F` e data `d`: se `d.dia <= F`, a fatura corresponde a `(mesAnterior.F+1 .. mesAtual.F)`, com vencimento no `diaVencimento` do mês atual (ou seguinte, conforme regra do cartão — assumiremos próximo mês quando vencimento < fechamento).

**Parcelas:** mantemos a lógica de parcelas virtuais já existente; ao gerar a projeção da fatura, cada parcela é atribuída ao cartão do lançamento pai.

**Memória do projeto:** ao final, salvar `mem://features/credit-cards` descrevendo modelo, regra de fatura e independência das metas.

## Fora de escopo (a confirmar depois)

- Limite de crédito e alertas de uso.
- Pagamento de fatura como receita/transferência automática.
- Suporte a múltiplas moedas / cartões internacionais.
- Sugestão automática de cartão por IA na importação.
