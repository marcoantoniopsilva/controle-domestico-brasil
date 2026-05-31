## Plano

1. Mover os 3 lançamentos das categorias "Carro e Uber" (1) e "Compras parceladas" (2) para a categoria **Outros** do usuário `84618d95-3564-4a0e-b8f0-4370d65f3cdb`.
2. Excluir as categorias "Carro e Uber" e "Compras parceladas".
3. Manter "Aniversário da Aurora" intacta.

### Detalhes técnicos
- `UPDATE lancamentos SET categoria='Outros' WHERE usuario_id=... AND categoria IN ('Carro e Uber','Compras parceladas')`
- `DELETE FROM categorias WHERE usuario_id=... AND nome IN ('Carro e Uber','Compras parceladas')`
- Executado via migration (DELETE/UPDATE exigem migração).
- Sem alterações de código no frontend.