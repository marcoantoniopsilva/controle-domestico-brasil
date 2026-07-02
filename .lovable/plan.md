## Objetivo

Adicionar três frentes que faltam à Plenna e que são padrão em Mobills/Organizze/YNAB/Monarch:

1. **Metas & reservas financeiras** — objetivos com valor-alvo, prazo e progresso.
2. **Contas bancárias & saldo real** — saldo consolidado além do ciclo.
3. **Lançamentos recorrentes / agendados** — assinaturas, salário, aluguel automáticos.

Vou entregar em 3 fases (uma por feature) para você validar cada uma antes da próxima. Este plano cobre a **Fase 1 (Metas)** em detalhe, com o desenho conceitual das Fases 2 e 3.

---

## Fase 1 — Metas & reservas financeiras (entrega agora)

### Experiência do usuário

- Nova página **/metas** no menu mobile e sidebar desktop.
- Card por meta com: nome, ícone/emoji, valor-alvo, prazo, valor acumulado, barra de progresso, aporte mensal sugerido (calculado: `(alvo − acumulado) / meses restantes`) e status (Em dia / Atrasada / Concluída).
- Botão "Aportar" em cada meta → registra um aporte manual (data + valor + observação).
- Botão "Nova meta" → formulário: nome, tipo (Reserva de emergência, Viagem, Compra, Investimento, Outro), valor-alvo, prazo (data), valor inicial opcional, cor.
- Widget compacto no Dashboard mostrando 3 metas principais com progresso.
- Ao concluir 100%: badge "Concluída" + toast comemorativo.

### Modelo de dados

Duas tabelas novas:

- `metas_financeiras` — nome, tipo, valor_alvo, valor_inicial, prazo (date), cor, icone, concluida (bool), ordem.
- `metas_aportes` — meta_id, valor, data, observacao. Progresso = `valor_inicial + soma(aportes)`.

Ambas com RLS por `usuario_id` seguindo o padrão de `cartoes_credito`.

### Integração com o resto do app

- Aportes NÃO viram lançamentos de despesa automaticamente (metas são separadas do orçamento do ciclo, como no YNAB). Se o usuário quiser, pode marcar no formulário "Registrar também como investimento" e aí criamos um `lancamento` tipo `investimento` linkado.
- Insights do dashboard passam a mencionar metas atrasadas quando aplicável.

---

## Fase 2 — Contas bancárias & saldo real (próxima entrega)

**Escopo pretendido** (será detalhado após aprovação da Fase 1):

- Tabela `contas_bancarias` (nome, tipo: corrente/poupança/carteira/dinheiro, saldo_inicial, cor, banco, ativa).
- Coluna opcional `conta_id` em `lancamentos` — cada lançamento debita/credita uma conta.
- Página **/contas** com saldo atual de cada conta (`saldo_inicial + Σ receitas − Σ despesas`) e saldo consolidado.
- Transferências entre contas (novo tipo de lançamento `transferencia`, não entra em receitas/despesas).
- Lançamentos existentes ficam sem conta (retrocompatível); usuário pode atribuir depois em lote.

---

## Fase 3 — Recorrentes / agendados (última entrega)

**Escopo pretendido:**

- Tabela `lancamentos_recorrentes` (template: descrição, categoria, valor, frequência mensal/semanal/anual, dia do mês, cartão/conta padrão, ativo, próxima_execucao).
- Cron diário (usa o `pg_cron` que já existe) que materializa os lançamentos do dia em `lancamentos`.
- Página de gestão: listar, pausar, editar, excluir recorrentes.
- Alerta no WhatsApp/dashboard N dias antes do vencimento de contas fixas.
- Migração leve: usuário pode transformar um lançamento existente em recorrente com 1 clique.

---

## Detalhes técnicos (Fase 1)

**Migração:**

```sql
CREATE TABLE public.metas_financeiras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL,
  nome text NOT NULL,
  tipo text NOT NULL DEFAULT 'outro',  -- reserva|viagem|compra|investimento|outro
  valor_alvo numeric NOT NULL CHECK (valor_alvo > 0),
  valor_inicial numeric NOT NULL DEFAULT 0,
  prazo date,
  cor text DEFAULT '#3b82f6',
  icone text DEFAULT 'Target',
  concluida boolean NOT NULL DEFAULT false,
  ordem int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.metas_aportes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meta_id uuid NOT NULL REFERENCES public.metas_financeiras(id) ON DELETE CASCADE,
  usuario_id uuid NOT NULL,
  valor numeric NOT NULL CHECK (valor > 0),
  data date NOT NULL DEFAULT current_date,
  observacao text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- GRANTs + RLS por usuario_id (padrão do projeto) + trigger updated_at.
```

**Arquivos front-end novos/alterados:**

- `src/hooks/useMetas.ts` — CRUD + cálculo de progresso.
- `src/pages/Metas.tsx` — página principal.
- `src/components/metas/MetaCard.tsx`, `MetaForm.tsx`, `AporteDialog.tsx`.
- `src/components/financas/dashboard/MetasWidget.tsx` — resumo no dashboard.
- `src/App.tsx` — rota `/metas`.
- `src/components/layout/NavBar.tsx` + `AppSidebar.tsx` — item de menu.

---

## O que NÃO entra nesta entrega

- Fase 2 e Fase 3 (planos ficam registrados, implementação depois da sua validação da Fase 1).
- Alertas proativos, patrimônio líquido, PDF mensal, Open Finance — ficam para uma próxima rodada de priorização.
- Aportes vindos automaticamente do WhatsApp — pode ser feature futura.
