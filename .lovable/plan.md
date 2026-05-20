# Categorias editáveis e ciclo financeiro configurável

Tornar a aplicação flexível: cada usuário poderá renomear, criar e excluir categorias, editar os grupos macro e definir o dia de virada do ciclo financeiro. Novos usuários passam por um onboarding inicial para configurar tudo antes de começar a usar.

Foco: zero quebra para os usuários atuais. Todas as categorias e o ciclo dia 25 → 24 continuam valendo como padrão até que o usuário decida mudar.

## O que muda para o usuário

### Categorias personalizáveis
- Nova tela "Categorias" (acessível pelo menu / configurações) listando despesas, receitas e investimentos.
- Para cada categoria: renomear, editar orçamento, definir tipo, definir grupo macro, excluir (com aviso quando há lançamentos vinculados — opção de migrar para outra categoria).
- Botão "Nova categoria" em cada aba (despesa / receita / investimento).
- Editor de grupos macro: criar/renomear/excluir grupo, escolher ícone, mover categorias entre grupos.
- Renomeações iniciais aplicadas como **novo padrão** para todos:
  - Compras do Marco → Compras à vista 1
  - Compras da Bruna → Compras à vista 2
  - Compras parceladas Marco → Compras parceladas 1
  - Compras parceladas Bruna → Compras parceladas 2
  - Fórmula e leite Aurora → Gastos com bebê
  - Atividades Aurora → Atividades do(a)(s) filho(a)(s)
  - Presentes/roupas Aurora → Presentes/roupas bebê
  - Gato → Gato/Cachorro
  - Pagamento mamãe → Transferências
  - Remuneração Bruna → Restituições
- Renomeação propaga automaticamente para lançamentos existentes (UPDATE no campo `categoria` em `lancamentos` e `category_budgets`).

### Dia de virada do ciclo configurável
- Nova preferência do usuário: `cycle_start_day` (1–28, default 25).
- Toda função que hoje assume "dia 25 / dia 24" passa a ler esse valor.
- Mudar a data recalcula em tempo real: ciclos exibidos, relatórios, gráficos comparativos, simulador, relatório de cartão, previsão de fechamento, parcelas futuras, daily report do WhatsApp.
- Aviso ao mudar: explica que ciclos passados serão reagrupados visualmente (não altera lançamentos, só a janela de agrupamento).

### Onboarding do novo usuário
Wizard em 3 passos após o cadastro (antes do dashboard):
1. **Ciclo financeiro** — escolher dia de virada (default 25).
2. **Categorias** — confirmar/editar/excluir categorias padrão por tipo.
3. **Orçamentos** — definir valor por categoria de despesa (campos pré-preenchidos).
Botão "Usar padrão e começar agora" pula direto com os valores atuais.

Usuários existentes não veem o wizard — apenas ganham acesso aos novos menus de edição.

## Detalhes técnicos

### Banco (migrações)
- `user_preferences` (nova): `usuario_id`, `cycle_start_day int default 25`, `onboarding_completed boolean` (true para registros migrados, false para novos), timestamps. RLS por `usuario_id`.
- `categorias` (nova): `usuario_id`, `nome`, `tipo` (despesa/receita/investimento), `orcamento numeric default 0`, `grupo_id uuid null`, `ordem int`, `ativa boolean default true`, `is_default boolean`. RLS por `usuario_id`. Index `(usuario_id, nome, tipo)`.
- `categoria_grupos` (nova): `usuario_id`, `nome`, `icone text`, `ordem int`. RLS por `usuario_id`.
- Trigger no signup (ou função SECURITY DEFINER chamada do cliente) popula categorias padrão + grupos padrão + `user_preferences { onboarding_completed: false }` usando os nomes já renomeados.
- Backfill único para usuários atuais: cria as categorias padrão renomeadas em `categorias` para cada `usuario_id` distinto encontrado em `lancamentos`, e roda UPDATE em `lancamentos.categoria` e `category_budgets.categoria_nome` mapeando nomes antigos → novos.
- `category_budgets` continua existindo por compatibilidade (fallback de leitura). Plano futuro: deprecar em favor de `categorias.orcamento`.

### Frontend
- Novo hook `useUserPreferences()` → `cycleStartDay`, `loading`, `update()`.
- Novo hook `useCategorias()` substitui o array estático em `src/utils/financas.ts`. Retorna lista por tipo, agrupada, com CRUD.
- Refator de `calcularCicloAtual`, `useCiclos`, `ciclosFinanceiros.ts` para receber `cycleStartDay` como parâmetro — eliminar constantes 25/24.
- Substituir `categoryGroups` estático por dados de `categoria_grupos`.
- Páginas novas:
  - `src/pages/Onboarding.tsx` + componentes do wizard.
  - `src/pages/Categorias.tsx` (gestão de categorias e grupos).
  - Seção de Preferências (ciclo) — aba dentro de configurações ou página dedicada.
- Guard de rota: se `onboarding_completed === false`, redireciona para `/onboarding`.

### Áreas que precisam consumir os novos dados dinâmicos
Cálculos: `utils/financas.ts`, `utils/ciclosFinanceiros.ts`, `utils/calculosFinanceiros.ts`, `hooks/useCiclos.ts`, `hooks/useDashboardData.ts`, `hooks/useParcelasFuturas.ts`, `hooks/useSimulacaoOrcamento.ts`, `hooks/useComparativoSimulacao.ts`, `hooks/useTransactionsByCategory.ts`.
UI: dashboard, `relatorios/*`, `GraficoComparativo/*`, `simulador/*`, `RelatorioCartaoCredito`, `ResumoOrcamento`, `ProgressoCategoria*`, `grupos/*`, `DistribuicaoCategorias`, `EvolucaoReceitasDespesas`, formulários (`AddTransacaoForm`, `EditTransacaoForm`, `ImportarLancamentos*`), `EditarOrcamentos`, `WhatsAppConfig`.
Edge functions: `whatsapp-finance`, `whatsapp-daily-report`, `twilio-webhook`, `infobip-webhook`, `extract-transactions` — passam a buscar `cycle_start_day` do `user_preferences` em vez de assumir 25.

### Compatibilidade
- Default global continua `cycle_start_day = 25`.
- O backfill garante que toda categoria já em uso por lançamentos existentes exista na tabela `categorias`.
- A renomeação é feita via UPDATE restrito aos nomes exatos listados — não afeta customizações futuras nem categorias que já tenham nomes diferentes.

## Entregas em ordem
1. Migração de schema (`user_preferences`, `categorias`, `categoria_grupos`) + trigger de signup + backfill + renomeações.
2. Hooks `useUserPreferences` e `useCategorias`; refator dos utils de ciclo para receber `cycleStartDay`.
3. Substituir consumos estáticos no frontend (cálculos, relatórios, simulador, formulários).
4. Telas de gestão: Categorias, Grupos, Preferências (ciclo).
5. Wizard de onboarding + guard de rota.
6. Atualização das edge functions.
7. QA: ciclo atual, ciclos passados, parcelas, simulador, relatórios, WhatsApp, importação por imagem.

## Riscos
- Renomear categoria com muitos lançamentos exige UPDATE em massa — fazer dentro de transação e com índice em `(usuario_id, categoria)`.
- Mudar `cycle_start_day` muda a janela de TODOS os ciclos antigos exibidos; não altera dados, apenas o agrupamento. Tornar isso explícito no aviso.
- Edge functions precisam ser re-deployadas; sem isso, o WhatsApp continuaria assumindo dia 25.