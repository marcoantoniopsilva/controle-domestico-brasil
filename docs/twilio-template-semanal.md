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

## Valores de exemplo (Sample values no Twilio)

| Var | Conteúdo | Exemplo |
|-----|----------|---------|
| 1 | Período da semana | `27/07 a 02/08` |
| 2 | Grupo ou categoria acompanhada | `Alimentação` |
| 3 | Total gasto na semana | `R$ 743,20` |
| 4 | Média por dia | `R$ 106,17` |
| 5 | Comparativo com a semana anterior | `🔻 12% abaixo (semana anterior: R$ 845,00)` |
| 6 | Categoria 1 da semana | `🛒 Supermercado: R$ 420,00` |
| 7 | Categoria 2 da semana | `🍽️ Restaurantes: R$ 230,20` |
| 8 | Categoria 3 da semana | `📦 Outros: R$ 93,00` |
| 9 | Maior lançamento da semana | `Feira do mês — R$ 312,40` |
| 10-14 | Saldo do mês (até 5 categorias) | `🛒 Supermercado: R$ 1.240 de R$ 1.500 🟡 83% • restam R$ 260` |
| 15 | Saldo do ciclo | `R$ 1.480,55` |
| 16 | Ciclo e dias restantes | `Jul/Ago 2026 • faltam 12 dias` |

Se o usuário escolher menos de 5 categorias, as variáveis não usadas chegam como `—`.

## Depois de aprovar

Copie o **Content SID** (`HX...`) e salve no projeto como secret **`TWILIO_TEMPLATE_SEMANAL_SID`**.
Sem esse secret a função envia o mesmo conteúdo como texto livre (só funciona dentro da janela de 24h).
