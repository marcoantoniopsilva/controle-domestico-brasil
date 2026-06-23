## Objetivo

1. Tornar acessível a tela de **Cartões de Crédito** na versão mobile (hoje só aparece no sidebar desktop).
2. Permitir definir um **cartão padrão** que é aplicado automaticamente em qualquer novo lançamento (manual ou via extração/importação), com possibilidade de troca pelo usuário no momento do registro.

## Mudanças

### 1. Acesso ao Cartões no mobile
- Em `src/components/layout/NavBar.tsx`, adicionar item **"Cartões"** dentro do `DropdownMenu` de Config (junto com Categorias e Preferências), navegando para `/cartoes`. Assim fica disponível em mobile sem ocupar espaço da topbar.

### 2. Cartão padrão por usuário
- Adicionar coluna `cartao_padrao_id uuid` na tabela `user_preferences` (FK lógica para `cartoes_credito.id`, `ON DELETE SET NULL`) via migration.
- Estender `useUserPreferences`:
  - tipo `UserPreferences` ganha `cartaoPadraoId: string | null`
  - fetch/update lendo e gravando `cartao_padrao_id`
- Em `src/pages/Preferencias.tsx`, adicionar uma seção **"Cartão padrão para novos lançamentos"** usando o `CardSelector` existente. Opção "Sem cartão" mantém o comportamento atual.
- Aplicar o padrão como valor inicial nos pontos de entrada de lançamento (somente quando ainda não há `cartao_id` definido):
  - `src/hooks/useTransacaoForm.ts` (manual): inicializar `cartaoId` com `preferences.cartaoPadraoId` quando `tipo === 'despesa'`.
  - `src/components/financas/ImportarLancamentosReview.tsx` (extração): default do dropdown "Cartão" passa a ser o cartão padrão em vez de "Sem cartão".
  - Em ambos os casos, o usuário continua podendo trocar para qualquer outro cartão ou "Sem cartão" antes de salvar.
- Se o cartão padrão estiver inativo ou tiver sido excluído, tratar como "sem padrão" (fallback silencioso).

### 3. Pontos que NÃO mudam
- Lançamentos via WhatsApp / edge functions não recebem default automático nesta entrega (escopo restrito a manual + extração, conforme pedido). Posso incluir se quiser depois.
- Estrutura de `lancamentos.cartao_id` permanece igual.

## Detalhes técnicos

Migration:
```sql
ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS cartao_padrao_id uuid NULL
  REFERENCES public.cartoes_credito(id) ON DELETE SET NULL;
```
RLS já existente em `user_preferences` cobre a nova coluna.

Em `useTransacaoForm`, o valor inicial vai depender de `preferences.cartaoPadraoId`; quando o usuário muda o tipo para algo diferente de "despesa", o `cartaoId` é zerado como já é hoje.
