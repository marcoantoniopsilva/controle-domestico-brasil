## Editar descrição na revisão de importação

Tornar o campo "Descrição" editável em `ImportarLancamentosReview.tsx`, para que o usuário ajuste o nome antes de salvar.

### Alterações

**`src/components/financas/ImportarLancamentosReview.tsx`**
- Adicionar handler `handleDescricaoChange(index, value)` análogo aos já existentes (`handleDataChange`, `handleValorChange`).
- Substituir o `<p>` atual da descrição por um `<Input>` controlado vinculado a `transacao.descricao`.
- Manter o indicador de "Parcela X/Y" abaixo do input quando aplicável.

Nada muda no fluxo de salvar: o estado `transacoes` já é a fonte da verdade enviada para `onImportar`, então a descrição editada será persistida automaticamente em `lancamentos.descricao`.

### Fora de escopo
- Edição em massa, sugestões automáticas/normalização de nomes ou aprendizado de "apelidos" recorrentes por loja (podemos abrir como próximo passo se quiser).
