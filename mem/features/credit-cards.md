---
name: Credit Cards Feature
description: Cadastro de cartões de crédito, associação opcional a lançamentos e relatório por fatura
type: feature
---
- Tabela `cartoes_credito` (RLS por usuario_id) com apelido, banco, bandeira, cor, dia_fechamento, dia_vencimento, meta_mensal, ativo, ordem.
- `lancamentos.cartao_id` é opcional (ON DELETE SET NULL). Lançamentos antigos ficam sem cartão e podem ser editados para receber um.
- `CardSelector` aparece em AddTransacaoForm/EditTransacaoForm somente quando tipo = "despesa".
- ImportarLancamentosReview tem dropdown "Cartão" para aplicar a todo o lote (default "Sem cartão").
- Relatório (`RelatorioCartaoCredito`): seletor "Todos os cartões" usa ciclo financeiro 25→24 e mostra breakdown por cartão; seleção de um cartão troca para período de fatura (fechamento→fechamento) via `src/utils/faturas.ts::getFaturaPeriodo`.
- Metas: cada cartão tem `meta_mensal` opcional, independente das metas de categoria. Em "Todos", a meta exibida é a soma das metas dos cartões; fallback para soma de orçamentos de categorias se nenhum cartão tem meta.
- Bandeiras/bancos visualmente representados por badge com iniciais sobre cor configurável (`src/utils/cardIcons.tsx`) — não usamos SVGs licenciados.