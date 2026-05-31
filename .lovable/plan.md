## Diagnóstico

Mesma classe de bug do anterior: **dados hardcoded no frontend ignorando os dados reais do usuário no banco**.

A aba "Grupos" e o componente "Evolução por Grupo" usam `categoryGroups` (constante hardcoded em `src/utils/categoryGroups.ts`) — uma lista fixa de 7 grupos ("Alimentação", "Deslocamento", "Saúde", "Aurora", "Pessoais", "Essenciais", "Extraordinários") com listas fixas de categorias pertencentes a cada um.

Consequências:
1. **Para qualquer usuário**: aparecem os grupos do dev/owner (ex.: "Aurora") mesmo que o usuário tenha grupos totalmente diferentes no banco.
2. **Para o owner também**: categorias que ele moveu/colocou em grupos via Categorias **não aparecem** no grupo correto, porque o vínculo grupo↔categoria está sendo lido do array fixo e não do `categorias.grupo_id` do DB.

O DB já tem tudo certo:
- `categoria_grupos` (por usuário, com `nome`, `icone`, `ordem`)
- `categorias.grupo_id` referenciando o grupo do usuário

E `useCategorias()` já carrega ambos. O problema é só que a UI não está consumindo.

## Plano de correção

### Passo 1 — Derivar grupos do DB
Criar um helper `useGruposComCategorias()` (ou um `useMemo` direto em `DashboardTabs`) que, a partir de `useCategorias()`, produz uma estrutura equivalente ao tipo `CategoryGroup`:

```ts
{ id, nome, icon: LucideIcon, categorias: string[] }
```

- `categorias` = nomes das categorias com `grupo_id === grupo.id`, `tipo === "despesa"`, `ativa === true`.
- `icon` = resolvido por um mapa nome-string → `LucideIcon` (o DB salva `icone` como texto, ex.: "Utensils", "Car"). Fallback para `Folder`.
- Ordenado por `grupo.ordem`.
- Categorias órfãs (sem `grupo_id`) ficam fora dos grupos — opcionalmente, agregar em um grupo virtual "Sem grupo" se houver alguma, para o usuário enxergar e atribuir depois.

### Passo 2 — Substituir consumo nos 3 lugares
- `src/components/financas/dashboard/DashboardTabs.tsx`: trocar `categoryGroups` (import hardcoded) por `gruposDoUsuario` derivado do DB.
- `src/components/financas/grupos/EvolucaoGrupos.tsx`: receber os grupos via prop (ou consumir `useCategorias` internamente) em vez de importar `categoryGroups`. Gerar cores dinamicamente (paleta cíclica) já que os nomes dos grupos são livres — não dá mais para ter mapa fixo por nome.
- `src/components/financas/grupos/GrupoCategoriasCard.tsx`: continua aceitando `CategoryGroup`, só muda a origem dos dados.

### Passo 3 — Deprecar o hardcode
- `src/utils/categoryGroups.ts`: manter apenas o `interface CategoryGroup` (usado como tipo) e remover/esvaziar o array `categoryGroups` para evitar reuso. Mover o mapa `string → LucideIcon` para um arquivo dedicado (`src/utils/groupIcons.ts`) reutilizável.

### Passo 4 — Verificação visual
Após editar, abrir o dashboard, conferir aba "Grupos" mostrando exatamente os grupos do banco do usuário e cada categoria caindo no grupo correto.

## Arquivos afetados

```text
src/utils/groupIcons.ts                                 (NOVO — mapa string→LucideIcon)
src/utils/categoryGroups.ts                             (manter interface, remover array hardcoded)
src/hooks/useGruposDespesa.ts                           (NOVO — opcional; pode ser useMemo inline)
src/components/financas/dashboard/DashboardTabs.tsx     (usar grupos do DB)
src/components/financas/grupos/EvolucaoGrupos.tsx       (receber grupos via prop, cores dinâmicas)
src/components/financas/grupos/GrupoCategoriasCard.tsx  (sem mudança estrutural; tipo já é CategoryGroup)
```

## O que NÃO está no escopo

- Não vou mexer em CRUD de grupos/categorias — `useCategorias` já cobre.
- Não vou alterar o schema do DB — `categoria_grupos` e `categorias.grupo_id` já estão certos.

Posso seguir?