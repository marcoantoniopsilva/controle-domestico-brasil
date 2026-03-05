

## Plan: Category Groups ("Grupos de Categorias") Feature

### Overview
Create a new dashboard tab called **"Grupos"** that aggregates individual expense categories into macro groups, showing both current cycle status and a 6-month historical evolution chart.

### Category Groups Definition
Define groups as a constant mapping in a new file `src/utils/categoryGroups.ts`:

| Group | Categories |
|-------|-----------|
| Alimentação | Aplicativos e restaurantes, Supermercado |
| Deslocamento | Seguro e manutenção, Uber, Recarga carro, Estacionamento |
| Saúde | Farmácia, Saúde |
| Aurora | Atividades Aurora, Fórmula e leite Aurora, Presentes/roupas Aurora |
| Pessoais | Lazer, Compras da Bruna, Compras do Marco, Compras parceladas Bruna, Compras parceladas Marco |
| Essenciais | Casa, Serviços de internet, Academia, Gato |
| Extraordinários | Gastos extraordinários, Viagens, Impostos taxas e multas, Outros |

Each group will derive its budget (sum of member category budgets) and current spending (sum of member category `gastosAtuais`) dynamically from the existing `categoriasAtualizadas` data.

### New Components

1. **`src/utils/categoryGroups.ts`** — Group definitions with name, icon, and member category names.

2. **`src/components/financas/grupos/GrupoCategoriasCard.tsx`** — A card component (similar to `ProgressoCategoriaClickable`) showing group name, total spent, total budget, progress bar, and remaining/exceeded amount. Clicking expands to show individual category breakdown.

3. **`src/components/financas/grupos/EvolucaoGrupos.tsx`** — A stacked area or line chart (recharts) showing each group's spending over the last 6 completed cycles. Reuses the same installment projection logic from `EvolucaoReceitasDespesas.tsx`.

### Tab Integration
Add a **"Grupos"** tab to `DashboardTabs.tsx` between "Despesas" and "Receitas". Content:
- Grid of `GrupoCategoriasCard` components (one per group) showing current cycle data
- Below the grid, the `EvolucaoGrupos` chart with 6-month history

### Data Flow
- Groups compute from the already-processed `categoriasAtualizadas` array (which includes custom budgets and current spending) — no new database queries needed for current cycle
- The evolution chart receives `transacoesOriginais` and processes historical cycles the same way `EvolucaoReceitasDespesas` does, but aggregating by group instead of receita/despesa

### Files to Create/Modify
- **Create**: `src/utils/categoryGroups.ts`
- **Create**: `src/components/financas/grupos/GrupoCategoriasCard.tsx`
- **Create**: `src/components/financas/grupos/EvolucaoGrupos.tsx`
- **Modify**: `src/components/financas/dashboard/DashboardTabs.tsx` — add "Grupos" tab
- **Modify**: `src/utils/categoryIcons.ts` — add icons for group names (Utensils for Alimentação, Car for Deslocamento, Heart for Saúde, Baby for Aurora, User for Pessoais, Home for Essenciais, AlertTriangle for Extraordinários)

