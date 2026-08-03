# Template Twilio — Relatório Semanal (WhatsApp)

Crie em Twilio Console > Messaging > Content Template Builder > **Create new** > tipo **Text**.

- **Template name:** `relatorio_semanal_categoria`
- **Language:** Portuguese (BR)
- **Category:** Utility
- **Content variables:** 16 (todas obrigatórias)

## Body (copiar exatamente, com as quebras de linha)

```
📅 *Resumo semanal* — {{1}}

🎯 *{{2}}*
Total na semana: *{{3}}*
Média por dia: {{4}}
Comparativo: {{5}}

🔎 *Onde foi o dinheiro*
{{6}}
{{7}}
{{8}}

💥 Maior gasto: {{9}}

━━━━━━━━━━━━━━

📊 *Saldo do mês por categoria*

{{10}}

{{11}}

{{12}}

{{13}}

{{14}}

━━━━━━━━━━━━━━

💰 Saldo do ciclo: *{{15}}*
🗓️ {{16}}
```

## Sample values (preencher no Twilio, variável por variável)

No formulário de criação do template, o Twilio pede um exemplo para cada variável. Cole os valores abaixo na ordem de `{{1}}` a `{{16}}`:

| Variável | Exemplo para colar no Twilio |
|----------|------------------------------|
| {{1}} | `27/07 a 02/08` |
| {{2}} | `Alimentação` |
| {{3}} | `R$ 743,20` |
| {{4}} | `R$ 106,17` |
| {{5}} | `🔻 12% abaixo (semana anterior: R$ 845,00)` |
| {{6}} | `🛒 Supermercado: R$ 420,00` |
| {{7}} | `🍽️ Restaurantes: R$ 230,20` |
| {{8}} | `📦 Outros: R$ 93,00` |
| {{9}} | `Feira do mês — R$ 312,40` |
| {{10}} | `🛒 Supermercado: R$ 1.240 de R$ 1.500 🟡 83% • restam R$ 260` |
| {{11}} | `🍽️ Restaurantes: R$ 980 de R$ 1.200 🟡 82% • restam R$ 220` |
| {{12}} | `⛽ Transporte: R$ 450 de R$ 500 🟢 90% • restam R$ 50` |
| {{13}} | `💡 Contas: R$ 320 de R$ 300 🔴 107% • estourou R$ 20` |
| {{14}} | `🎮 Lazer: R$ 150 de R$ 200 🟢 75% • restam R$ 50` |
| {{15}} | `R$ 1.480,55` |
| {{16}} | `Jul/Ago 2026 • faltam 12 dias` |

> Se o usuário escolher menos de 5 categorias, as variáveis não usadas chegam como `—`.

## Exemplo de como fica a mensagem com os samples acima

```
📅 *Resumo semanal* — 27/07 a 02/08

🎯 *Alimentação*
Total na semana: *R$ 743,20*
Média por dia: R$ 106,17
Comparativo: 🔻 12% abaixo (semana anterior: R$ 845,00)

🔎 *Onde foi o dinheiro*
🛒 Supermercado: R$ 420,00
🍽️ Restaurantes: R$ 230,20
📦 Outros: R$ 93,00

💥 Maior gasto: Feira do mês — R$ 312,40

━━━━━━━━━━━━━━

📊 *Saldo do mês por categoria*

🛒 Supermercado: R$ 1.240 de R$ 1.500 🟡 83% • restam R$ 260

🍽️ Restaurantes: R$ 980 de R$ 1.200 🟡 82% • restam R$ 220

⛽ Transporte: R$ 450 de R$ 500 🟢 90% • restam R$ 50

💡 Contas: R$ 320 de R$ 300 🔴 107% • estourou R$ 20

🎮 Lazer: R$ 150 de R$ 200 🟢 75% • restam R$ 50

━━━━━━━━━━━━━━

💰 Saldo do ciclo: *R$ 1.480,55*
🗓️ Jul/Ago 2026 • faltam 12 dias
```

## Depois de aprovar

Copie o **Content SID** (`HX...`) e salve no projeto como secret **`TWILIO_TEMPLATE_SEMANAL_SID`**.
Sem esse secret a função envia o mesmo conteúdo como texto livre (só funciona dentro da janela de 24h).
