import { ContaBancaria, Transacao } from "@/types";

/**
 * Saldo real de uma conta.
 * - Se o usuário informou um "saldo atual" manual, usamos esse valor como base
 *   e somamos apenas os lançamentos posteriores à data do ajuste.
 * - Caso contrário, saldo = saldo inicial + todos os lançamentos vinculados.
 * Despesas já são armazenadas negativas; receitas positivas.
 * Investimentos não afetam o saldo real.
 */
export function calcularSaldoConta(conta: ContaBancaria, transacoes: Transacao[]): number {
  const movs = transacoes.filter(
    (t) => t.contaId === conta.id && (t.tipo === "despesa" || t.tipo === "receita")
  );
  if (conta.saldoAtual != null && conta.saldoAtualAjustadoEm) {
    const ajuste = new Date(conta.saldoAtualAjustadoEm).getTime();
    const posteriores = movs
      .filter((t) => new Date(t.data).getTime() > ajuste)
      .reduce((acc, t) => acc + Number(t.valor || 0), 0);
    return Number(conta.saldoAtual) + posteriores;
  }
  const total = movs.reduce((acc, t) => acc + Number(t.valor || 0), 0);
  return Number(conta.saldoInicial || 0) + total;
}

export function calcularSaldoTotal(contas: ContaBancaria[], transacoes: Transacao[]): number {
  return contas
    .filter((c) => c.incluirNoSaldo && c.ativo)
    .reduce((acc, c) => acc + calcularSaldoConta(c, transacoes), 0);
}
