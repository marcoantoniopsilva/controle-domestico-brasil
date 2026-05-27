# Responsáveis configuráveis por usuário

Hoje o app fixa "Marco" e "Bruna" como opções de "quem realizou" e usa "Marco" como padrão em todo novo lançamento. Vamos tornar isso configurável por usuário, sem quebrar dados existentes.

## O que muda para o usuário

1. **Em Preferências** surge uma nova seção "Responsáveis pelos lançamentos":
   - Lista editável de nomes (mínimo 1, máximo 5). Botões para adicionar/remover/renomear.
   - Seletor de "Responsável padrão" (um dos nomes da lista) — é o nome pré-selecionado em novos lançamentos.
2. **No formulário de novo/editar lançamento**, o campo "Quem realizou" passa a listar os nomes configurados pelo usuário, com o padrão já selecionado. Continua editável por lançamento.
3. **Na importação por imagem (OCR)** e na revisão de lançamentos importados, o seletor também usa os nomes do usuário; padrão = responsável padrão.
4. **Usuários novos** começam com um único responsável igual ao nome do cadastro (fallback: parte antes do `@` do e-mail), podendo adicionar outros depois.
5. **Usuários já existentes** (Marco/Bruna e demais) recebem backfill automático: a lista de responsáveis é preenchida com os nomes distintos já usados em `lancamentos`, e o padrão é o nome do primeiro lançamento mais recente do usuário. Lançamentos antigos permanecem intactos.

## Mudanças técnicas

### Banco (migration)
Adicionar em `user_preferences`:
- `responsaveis text[] not null default '{}'::text[]`
- `responsavel_padrao text` (nullable)

Backfill por usuário a partir de `lancamentos.quem_gastou` distintos; se vazio, usar `'Você'`. Definir `responsavel_padrao` como o `quem_gastou` do lançamento mais recente, ou primeiro da lista.

Nenhuma alteração em `lancamentos` (continua `quem_gastou text`). Tipo TS `"Marco" | "Bruna"` vira `string`.

### Frontend
- `useUserPreferences`: expor `responsaveis: string[]`, `responsavelPadrao: string`, `update({...})`.
- `src/types/index.ts`: `Transacao.quemGastou: string` (remover união Marco/Bruna).
- `src/utils/financas.ts`: remover `quemGastouOpcoes` fixo.
- `src/components/financas/form/SpenderSelector.tsx`: receber `opcoes: string[]` por props e renderizar dinamicamente; reintroduzir o seletor no formulário (hoje está oculto e fixo em "Marco").
- `src/hooks/useTransacaoForm.ts` e `src/components/financas/form/useTransacaoForm.ts`: estado `quemGastou` inicializado com `responsavelPadrao`; expor handler e usar no submit em vez de fixar `"Marco"`.
- `src/components/financas/AddTransacaoForm.tsx` e `EditTransacaoForm.tsx`: incluir `<SpenderSelector />` na grid, passando `opcoes`.
- `src/components/financas/ImportarLancamentos.tsx` e `ImportarLancamentosReview.tsx`: trocar literais por lista do usuário; padrão = `responsavelPadrao`.
- `src/hooks/useTransacaoFetch.ts` e `useComparativoSimulacao.ts`: remover cast `as "Marco" | "Bruna"`.
- `src/pages/Preferencias.tsx`: nova seção "Responsáveis" com lista editável + select de padrão.

### Categorias com nomes pessoais
`categoryIcons.ts` e `categoryGroups.ts` mencionam "Compras do Marco / da Bruna". Isso só afeta usuários que ainda tenham essas categorias literais (Marco/Bruna originais). Não vamos renomear categorias automaticamente — manter os mapeamentos atuais como fallback. Renomear categorias é responsabilidade do usuário em "Categorias".

### Fora do escopo
- Edge functions de WhatsApp (já tratadas em iterações anteriores).
- Migração automática de nomes de categorias com Marco/Bruna.

## Resultado
Qualquer usuário define seus próprios responsáveis, com um padrão pré-selecionado, e pode editar por lançamento. Dados existentes continuam funcionando.
