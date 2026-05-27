## Objetivo

A importação de lançamentos por foto no WhatsApp (extrato, fatura, NF) precisa funcionar para qualquer usuário que cadastrar o número — hoje o webhook está hard-coded para escolher entre "Marco" e "Bruna".

## Diagnóstico

- A coluna `lancamentos.quem_gastou` é `text` livre no banco — nenhuma restrição impede outros nomes.
- O único ponto que assume Marco/Bruna no fluxo da foto é `supabase/functions/twilio-webhook/index.ts` (função `processImageMessage`), linhas 263-265.
- O restante (`whatsapp-finance`, `whatsapp-daily-report`, registro/verificação, contexto financeiro) já é por `usuario_id` e não depende do nome.
- Tipos do app (`Transacao.quemGastou: "Marco" | "Bruna"`) afetam a UI, mas o webhook escreve direto no banco — pode gravar qualquer string sem quebrar nada do lado servidor.

## Mudanças no `twilio-webhook` (apenas no fluxo de imagem)

1. **Identificar o "quem gastou" de forma genérica**, nesta ordem de prioridade:
   1. Se a legenda da foto começar com algo como "por <nome>" / "from <nome>" → usa esse nome (permite atribuir gasto a outra pessoa do mesmo perfil).
   2. Caso contrário, usar o `ProfileName` enviado pela Twilio (nome do contato WhatsApp do remetente), com fallback para o primeiro nome.
   3. Se vazio, usar `"WhatsApp"` como rótulo neutro.
   - Remover a heurística "Bruna senão Marco".

2. **Mensagem de confirmação** passa a mostrar o nome detectado dinamicamente (ex.: `✅ 4 lançamento(s) importado(s) (João)`).

3. **Prompt do Gemini**: continuar usando as categorias do próprio usuário (`categorias` table filtrado por `usuario_id`), o que já é genérico — sem mudanças.

## Sem migração de banco

A coluna já aceita texto livre. Não há alteração de schema, RLS, nem secrets.

## Sem mudanças no front-end neste passo

A UI de listagem mostra `quemGastou` como texto (`TableCell`), então qualquer nome aparece corretamente. O cast `as "Marco" | "Bruna"` em `useTransacaoFetch.ts` é só TypeScript em runtime — não filtra valores. Refinar esses tipos para `string` é um clean-up opcional e fora do escopo desta entrega (posso fazer numa próxima rodada se quiser, junto com o seletor "Quem realizou" no formulário/import).

## Detalhes técnicos

Arquivo: `supabase/functions/twilio-webhook/index.ts`, dentro de `processImageMessage`:

```text
// Antes
const lower = (profileName || '').toLowerCase();
const quemGastou = lower.includes('bruna') ? 'Bruna' : 'Marco';

// Depois
function detectQuemGastou(profileName: string, caption: string): string {
  const m = caption.match(/^\s*(?:por|from)\s+([\p{L}][\p{L}\s.'-]{0,40})/iu);
  if (m) return m[1].trim().split(/\s+/)[0];
  const first = (profileName || '').trim().split(/\s+/)[0];
  return first || 'WhatsApp';
}
const quemGastou = detectQuemGastou(profileName, caption);
```

Deploy: `twilio-webhook`. Sem riscos para usuários existentes — Marco/Bruna continuam funcionando porque o `ProfileName` deles já é "Marco"/"Bruna".
