## Diagnóstico

O bug relatado tem **uma causa raiz clara** e **um efeito colateral**:

### 1. Causa raiz: importação por foto usa lista hardcoded
Em `src/components/financas/ImportarLancamentos.tsx` (linha 72) e `src/components/financas/ImportarLancamentosReview.tsx` (linha 49), o código chama `getCategoriasDisponiveis()` de `src/utils/categorizacao.ts`, que retorna a **lista hardcoded `categoriasDefault`** (categorias antigas como "Aplicativos e restaurantes", "Compras da Bruna" etc.).

Resultado:
- O Gemini recebe a lista antiga no prompt → sugere categorias que não existem mais.
- O dropdown de revisão também mostra a lista antiga → usuário não consegue reatribuir para suas categorias reais.
- O lançamento é salvo com o nome da categoria antiga → some das despesas (porque os grupos/relatórios filtram pelas categorias atuais do usuário).

### 2. Efeito colateral: lançamentos órfãos
Verifiquei no banco: existem hoje 2 categorias órfãs no usuário relator ("Abastecimento Carro" com 2 lançamentos). São lançamentos cuja `categoria` aponta para um nome que não está mais na tabela `categorias`. Isso explica o "sumiço" — a UI agrupa/exibe apenas o que casa com as categorias ativas.

`updateCategoria` já faz rename em cascata em `lancamentos`, mas a importação por foto cria lançamentos **já órfãos**, então rename posterior não resolve.

---

## Plano de correção

### Passo 1 — Usar categorias reais do usuário na importação
- `ImportarLancamentos.tsx`: substituir `getCategoriasDisponiveis()` por uma lista derivada de `useCategorias()` filtrada por `tipo = "despesa"` e `ativa = true`. Enviar `categorias.map(c => c.nome)` para a edge function.
- `ImportarLancamentosReview.tsx`: receber as categorias reais via prop (ou também consumir `useCategorias`) e popular o `Select` com elas. Se o Gemini devolver uma categoria que não bate exatamente, fazer fallback para `"Outros"` (se existir) ou para a primeira categoria de despesa, e marcar visualmente como "revisar".
- Manter `quemGastou` usando `responsaveis` (já está correto via `useUserPreferences`).

### Passo 2 — Validação no salvamento
No `handleImport` do `ImportarLancamentos.tsx`, antes de chamar `onImportar`, validar que cada `t.categoria` existe nas categorias ativas do usuário. Se não existir, forçar `"Outros"`. Isso garante que nunca mais entre lançamento órfão por essa via.

### Passo 3 — Limpar a referência hardcoded
- O arquivo `src/utils/categorizacao.ts` ainda tem utilidade para o keyword mapping (`categorizarPorDescricao`), mas o mapeamento aponta para nomes antigos. Vou:
  - Manter a função `categorizarPorDescricao` mas fazê-la receber a lista de categorias atuais do usuário como parâmetro, e só retornar uma categoria se ela existir nessa lista (senão, `"Outros"` se existir, senão `""`).
  - Remover/deprecar `getCategoriasDisponiveis()` para evitar reuso futuro do hardcode.

### Passo 4 — Sanear os 2 órfãos existentes
Migrar os lançamentos órfãos de "Abastecimento Carro" para uma categoria válida do mesmo usuário. Como o usuário renomeou suas categorias, a opção mais segura é mover para **"Outros"** (despesa) do próprio usuário — ele pode reatribuir manualmente depois se quiser. Vou pedir confirmação do alvo antes de executar (ou usar "Outros" como padrão).

---

## Arquivos afetados

```text
src/components/financas/ImportarLancamentos.tsx      (usar useCategorias, validar antes de salvar)
src/components/financas/ImportarLancamentosReview.tsx (receber categorias reais via prop)
src/utils/categorizacao.ts                            (deprecar getCategoriasDisponiveis, parametrizar)
```

E uma migração de dados para os 2 lançamentos órfãos.

## O que NÃO está no escopo

- Não vou mexer na estrutura da tabela `categorias` nem nos grupos — eles estão corretos.
- Não vou mexer no fluxo de criar/editar/deletar categoria (`useCategorias`) — o rename em cascata já funciona; o problema é só na importação por foto.

Confirma que posso seguir? Se sim, sigo com a correção e movo os 2 órfãos para "Outros".