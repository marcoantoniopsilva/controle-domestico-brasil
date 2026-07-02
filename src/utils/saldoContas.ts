import { ContaBancaria, Transacao } from "@/types";

/**
 * Saldo real de uma conta = saldo inicial + soma de receitas/despesas vinculadas.
 * Despesas já são armazenadas negativas; receitas positivas.
 * Investimentos não afetam o saldo real (dinheiro que "sai" da conta corrente vira aporte).
 */
export function calcularSaldoConta(conta: ContaBancaria, transacoes: Transacao[]): number {
  const movimentos = transacoes
    .filter((t) => t.contaId === conta.id && (t.tipo === "despesa" || t.tipo === "receita"))
    .reduce((acc, t) => acc + Number(t.valor || 0), 0);
  return Number(conta.saldoInicial || 0) + movimentos;
}

export function calcularSaldoTotal(contas: ContaBancaria[], transacoes: Transacao[]): number {
  return contas
    .filter((c) => c.incluirNoSaldo && c.ativo)
    .reduce((acc, c) => acc + calcularSaldoConta(c, transacoes), 0);
}
