

## Orçamentos por Ciclo

### Problema atual
A tabela `category_budgets` armazena um orçamento global por categoria/usuário, sem distinção de ciclo. Qualquer edição afeta todos os ciclos.

### Solução
Adicionar uma coluna `ciclo_id` (texto no formato "YYYY-MM-DD", representando a data de início do ciclo) à tabela `category_budgets`. Registros sem `ciclo_id` (ou NULL) continuam sendo o **orçamento padrão**. Registros com `ciclo_id` são **sobrescritas específicas** daquele ciclo.

### Hierarquia de resolução
1. Orçamento específico do ciclo (se existir)
2. Orçamento padrão personalizado pelo usuário (sem ciclo)
3. Orçamento padrão do código (`financas.ts`)

### Mudanças

**1. Migration: adicionar coluna `ciclo_id`**
- `ALTER TABLE category_budgets ADD COLUMN ciclo_id text DEFAULT NULL`
- Atualizar a constraint unique para `(usuario_id, categoria_nome, categoria_tipo, ciclo_id)` — usar um índice único parcial ou COALESCE para lidar com NULLs

**2. Hook `useCategoryBudgets.ts`**
- `saveBudget` e `resetBudget` passam a aceitar um parâmetro opcional `cicloId?: string`
- `fetchCustomBudgets` carrega todos os budgets do usuário (padrão + ciclo-específicos)
- `getCategoriesWithCustomBudgets` recebe um `cicloId` opcional e aplica a hierarquia: ciclo > padrão > código

**3. Componente `EditarOrcamentos.tsx`**
- Recebe o `cicloAtual` como prop
- Mostra o nome do ciclo no header ("Orçamentos para Mar/Abr 2026")
- Adiciona um toggle/switch: "Editar apenas para este ciclo" vs "Editar padrão global"
- Quando editando para o ciclo, salva com `ciclo_id`; quando editando padrão, salva com `ciclo_id = null`
- Badge "Personalizado neste ciclo" quando há override de ciclo

**4. `DashboardHeader.tsx`**
- Passa `cicloAtual` para `EditarOrcamentos`

**5. `Dashboard.tsx`**
- Passa `cicloAtual` para `DashboardHeader`

**6. Consumidores (`useDashboardData`, etc.)**
- Passa o `cicloId` derivado do `cicloAtual.inicio` para `getCategoriesWithCustomBudgets` para que os orçamentos reflitam o ciclo selecionado

### Formato do ciclo_id
Usar `format(cicloAtual.inicio, 'yyyy-MM-dd')` — ex: `"2026-03-25"`. Simples e determinístico.

