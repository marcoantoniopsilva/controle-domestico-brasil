# Template Twilio — Relatório Semanal (WhatsApp)

Crie em Twilio Console > Messaging > Content Template Builder > **Create new** > tipo **Text**.

- **Template name:** `relatorio_semanal_categoria`
- **Language:** Portuguese (BR)
- **Category:** Utility
- **Content variables:** 16 (todas obrigatórias)

## Body (copiar exatamente, com as quebras de linha)

> **Importante:** cada variável deve estar no meio de uma linha (nunca no início ou no fim do template, nem no início ou fim de uma linha).

```
📅 *Resumo semanal do período {{1}}*

🎯 *Categoria: {{2}}*
Total na semana: *{{3}}*
Média por dia: *{{4}}*
Comparativo: {{5}}

🔎 *Onde foi o dinheiro*
1) {{6}}
2) {{7}}
3) {{8}}

💥 *Maior gasto:* {{9}}

━━━━━━━━━━━━━━

📊 *Saldo do mês por categoria*

1) {{10}}
2) {{11}}
3) {{12}}
4) {{13}}
5) {{14}}

━━━━━━━━━━━━━━

💰 *Saldo do ciclo: {{15}}*
🗓️ *Período: {{16}}*

Enviado pelo Planner Plenna.
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
📅 *Resumo semanal do período 27/07 a 02/08*

🎯 *Categoria: Alimentação*
Total na semana: *R$ 743,20*
Média por dia: *R$ 106,17*
Comparativo: 🔻 12% abaixo (semana anterior: R$ 845,00)

🔎 *Onde foi o dinheiro*
1) 🛒 Supermercado: R$ 420,00
2) 🍽️ Restaurantes: R$ 230,20
3) 📦 Outros: R$ 93,00

💥 *Maior gasto:* Feira do mês — R$ 312,40

━━━━━━━━━━━━━━

📊 *Saldo do mês por categoria*

1) 🛒 Supermercado: R$ 1.240 de R$ 1.500 🟡 83% • restam R$ 260
2) 🍽️ Restaurantes: R$ 980 de R$ 1.200 🟡 82% • restam R$ 220
3) ⛽ Transporte: R$ 450 de R$ 500 🟢 90% • restam R$ 50
4) 💡 Contas: R$ 320 de R$ 300 🔴 107% • estourou R$ 20
5) 🎮 Lazer: R$ 150 de R$ 200 🟢 75% • restam R$ 50

━━━━━━━━━━━━━━

💰 *Saldo do ciclo: R$ 1.480,55*
🗓️ *Período: Jul/Ago 2026 • faltam 12 dias*

Enviado pelo Planner Plenna.
```

## Depois de aprovar

Copie o **Content SID** (`HX...`) e salve no projeto como secret **`TWILIO_TEMPLATE_SEMANAL_SID`**.
Sem esse secret a função envia o mesmo conteúdo como texto livre (só funciona dentro da janela de 24h).
