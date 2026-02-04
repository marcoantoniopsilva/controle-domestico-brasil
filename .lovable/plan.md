
# Simplificar Cadastro WhatsApp - Remover Verificação OTP

## Resumo
Modificar o fluxo de configuração do WhatsApp para salvar o número diretamente como verificado, eliminando a necessidade do template de verificação no Infobip.

## Mudanças

### 1. Hook useWhatsAppConfig.ts
- Modificar a função `saveConfig` para definir `is_verified: true` automaticamente ao inserir/atualizar
- Remover as funções `sendVerificationCode` e `verifyCode` (não serão mais necessárias)
- Remover o estado `isVerifying`

### 2. Componente WhatsAppConfig.tsx
- Substituir o botão "Verificar" por um botão "Salvar" simples
- Remover toda a seção de verificação OTP (InputOTP, countdown, etc)
- Mostrar as configurações (frequência, horário) imediatamente após salvar o número
- Simplificar a lógica de estado removendo `showVerification`, `verificationCode`, `countdown`

### 3. Edge Functions (Opcional - Limpeza)
As Edge Functions `whatsapp-send-verification` e `whatsapp-verify-code` podem ser mantidas para uso futuro, mas não serão mais chamadas pelo frontend.

---

## Detalhes Técnicos

### useWhatsAppConfig.ts
```text
Alterações:
- Linha 18: Remover estado isVerifying
- Linhas 179-255: Remover funções sendVerificationCode e verifyCode
- Linha 106-114: Adicionar is_verified: true no insert
- Retorno: Remover isVerifying, sendVerificationCode, verifyCode
```

### WhatsAppConfig.tsx
```text
Alterações:
- Linhas 34-38: Remover sendVerificationCode, verifyCode, isVerifying do destructuring
- Linhas 46-49: Remover estados showVerification, verificationCode, countdown
- Linhas 61-67: Remover useEffect do countdown
- Linhas 94-111: Remover handleSendCode e handleVerifyCode
- Linhas 213-221: Substituir botão "Verificar" por "Salvar Número"
- Linhas 231-284: Remover toda a seção de verificação OTP
- Linhas 286-344: Mostrar configurações sempre que houver config (não só quando is_verified)
- Linha 115: Remover check de is_verified no handleSaveSettings
```

### Novo Fluxo
1. Usuário digita o número do WhatsApp
2. Clica em "Salvar Número"
3. Número é salvo diretamente com `is_verified: true`
4. Configurações de frequência e horário ficam disponíveis imediatamente
