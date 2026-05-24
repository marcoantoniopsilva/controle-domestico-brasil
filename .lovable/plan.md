
# Redesign visual: Dashboard + Design System + Sidebar + Insights IA

Escopo focado em **camada de apresentação**. Nenhuma mudança em hooks, cálculos financeiros, schema do DB ou lógica de negócio. Tudo continua usando `useDashboardData`, `useTransacoes`, `calculosFinanceiros.ts`, etc.

## 1. Novo design system (base de tudo)

Atualizar `src/index.css` e `tailwind.config.ts` com paleta wealth-management:

**Cores (HSL):**
- `--background`: 60 14% 97% (off-white #F7F8F5)
- `--card`: 0 0% 100% (branco puro)
- `--foreground`: 220 9% 12% (#1D1D1F)
- `--primary`: 158 35% 27% (verde escuro #2E5E4E) — substitui o verde atual 142 72% 40%
- `--primary-foreground`: 60 14% 97%
- `--accent-sand`: 35 25% 75% (areia suave)
- `--accent-petrol`: 195 40% 30% (azul petróleo)
- `--accent-terracotta`: 14 45% 55% (terracota leve)
- `--muted`: 60 8% 94%
- `--border`: 60 6% 90% (mais sutil)
- `--radius`: 1.25rem (20px, era 0.5rem)

**Sombras (novos tokens):**
- `--shadow-card`: 0 1px 3px hsl(220 9% 12% / 0.04), 0 1px 2px hsl(220 9% 12% / 0.03)
- `--shadow-elevated`: 0 4px 16px hsl(220 9% 12% / 0.06)

**Tipografia:** Manter Inter (já carregado). Adicionar classes utilitárias:
- `.text-display` → 2.5rem font-bold tracking-tight (números grandes 32–40px)
- `.text-metric` → 2rem font-semibold tabular-nums
- `.text-label` → 0.8125rem font-medium text-muted-foreground uppercase tracking-wide

Dark mode atualizado proporcionalmente.

## 2. Sidebar desktop + NavBar mobile

Usar shadcn sidebar (`SidebarProvider`, `Sidebar`, `SidebarMenuButton`).

- Criar `src/components/layout/AppSidebar.tsx` com itens: Dashboard, Categorias, Simulador, Preferências (ícones lucide).
- Criar `src/components/layout/AppLayout.tsx` que envolve rotas autenticadas com `SidebarProvider` + `Sidebar` (desktop) e mantém `NavBar` mobile (oculta a sidebar em `md:` para baixo via `hidden md:flex`).
- Atualizar `src/App.tsx` para usar o novo layout em rotas autenticadas (Dashboard, Categorias, Simulador, Preferências).
- `collapsible="icon"` para colapso elegante, com `SidebarTrigger` no header.

## 3. Redesign do Dashboard

Reorganizar `src/pages/Dashboard.tsx` + componentes em `src/components/financas/dashboard/` em camadas visuais:

**Camada 1 — Saudação personalizada (novo `GreetingHeader.tsx`):**
- "Bom dia/tarde/noite, {nome} 👋" baseado em hora local
- Subtítulo dinâmico: "Você economizou R$ X neste ciclo" ou "Você está R$ Y acima do orçamento"
- Tipografia grande, sem card, muito respiro

**Camada 2 — Cards de resumo (refatorar `SummaryCards.tsx`):**
- Grid 2x2 no mobile, 4 colunas no desktop
- Cards: Saldo, Receitas, Despesas, Investimentos
- Label pequeno em cima (uppercase, muted), número grande (`.text-display`), variação vs ciclo anterior abaixo em verde/vermelho
- Radius 20px, sombra suave, hover sutil

**Camada 3 — Insights IA (novo `InsightsCard.tsx`):**
- Card horizontal com 3 insights gerados por Gemini
- Ex: "🍔 Restaurantes ↑18% vs ciclo anterior", "🛒 Mercado ↓7%", "💡 Você pode economizar R$240 reduzindo X"
- Loading skeleton enquanto carrega; botão "Atualizar insights"
- Cache no `localStorage` por ciclo (evita refazer chamada a cada render)

**Camada 4 — Gráfico mensal limpo:**
- Manter `EvolucaoReceitasDespesas` mas refinar: remover grid pesado, linhas mais finas, cores da nova paleta, tooltip minimalista, sem legenda redundante

**Camada 5 — Categorias estilo YNAB (refatorar `ProgressoCategoriaClickable.tsx`):**
- Linha por categoria: ícone emoji + nome à esquerda, "R$ gasto / R$ orçamento" + % à direita, progress bar full-width abaixo
- Cores semafóricas usando `getBudgetProgressColor` já existente
- Click expande mostrando últimas transações da categoria (usa `useTransactionsByCategory`)

**Camada 6 — Tabs secundárias:**
- Manter `DashboardTabs` mas com visual mais clean (underline em vez de pill, sem bg)

## 4. Insights IA via Gemini (usa chave do usuário)

**Edge function nova:** `supabase/functions/dashboard-insights/index.ts`
- Recebe: ciclo atual + totais por categoria (ciclo atual e anterior)
- Chama Gemini API com a chave `GEMINI_API_KEY` (mesma já usada pelo WhatsApp — confirmar via `fetch_secrets`)
- Prompt instrui retornar JSON: `{ insights: [{ emoji, texto, tipo: 'positivo'|'negativo'|'dica' }] }` (3 a 4 insights, máx 80 chars cada)
- Retorna JSON estruturado via tool calling do Gemini

**Hook frontend novo:** `src/hooks/useDashboardInsights.ts`
- Recebe `cicloAtual`, dados processados de `useDashboardData` (ciclo atual + anterior)
- Cache em `localStorage` chave `insights-{cicloId}` por 24h
- Chama edge function via `supabase.functions.invoke`
- Estados: `insights`, `isLoading`, `error`, `refresh()`

Se `GEMINI_API_KEY` não existir nos secrets, edge function retorna 400 e UI mostra mensagem amigável + botão para configurar.

## 5. Refinos visuais nos componentes existentes

Atualizar para usar os novos tokens (sem mudança estrutural):
- `CardResumo.tsx`: remover `bg-white border` hardcoded → usar `bg-card shadow-[var(--shadow-card)] rounded-2xl`
- `ResumoOrcamento.tsx`: padding maior, tipografia hierárquica nova
- `DashboardHeader.tsx` (em `dashboard/`): simplificar, mover saudação pra `GreetingHeader`
- `GraficoCategorias.tsx`: paleta de cores atualizada (verde escuro + acentos), tooltip clean

## 6. Telas fora de escopo

Categorias, Simulador, Preferências, Relatórios: **herdam automaticamente** a nova paleta/radius/sombras via design system, mas **não** vou redesenhar layouts. Visual ficará consistente sem trabalho extra.

## Detalhes técnicos

- Sidebar shadcn já está instalada (`src/components/ui/sidebar.tsx` existe via shadcn template)
- Insights edge function: usar `google/gemini-2.5-flash` direto na API do Gemini (não pelo Lovable AI Gateway, pois usuário tem chave própria já configurada)
- Cálculo "ciclo anterior" para comparação: derivar do `cicloAtual` subtraindo 1 mês usando `calcularCicloAtual` com data offset
- Toda nova string em pt-BR
- Mobile: sidebar colapsa via offcanvas + `SidebarTrigger` no header mobile

## Arquivos novos

- `src/components/layout/AppSidebar.tsx`
- `src/components/layout/AppLayout.tsx`
- `src/components/financas/dashboard/GreetingHeader.tsx`
- `src/components/financas/dashboard/InsightsCard.tsx`
- `src/hooks/useDashboardInsights.ts`
- `supabase/functions/dashboard-insights/index.ts`

## Arquivos editados

- `src/index.css` (design tokens)
- `tailwind.config.ts` (tokens + radius)
- `src/App.tsx` (layout wrapper)
- `src/pages/Dashboard.tsx` (estrutura nova)
- `src/components/financas/dashboard/SummaryCards.tsx`
- `src/components/financas/dashboard/DashboardHeader.tsx`
- `src/components/financas/CardResumo.tsx`
- `src/components/financas/ResumoOrcamento.tsx`
- `src/components/financas/ProgressoCategoriaClickable.tsx`
- `src/components/financas/GraficoCategorias.tsx`
- `src/components/financas/graficos/EvolucaoReceitasDespesas.tsx`
- `supabase/config.toml` (registrar nova edge function)

## Fora de escopo (combinado com você)

- Heatmap calendário, Financial Health Score, timeline de transações, cards expansíveis com subcategorias detalhadas, redesign de Categorias/Simulador/Preferências/Relatórios. Podemos atacar depois em iterações separadas.
