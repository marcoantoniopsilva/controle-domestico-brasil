/**
 * Módulo centralizado para cálculos financeiros
 * Evita duplicação de lógica Math.abs() e garante consistência em todos os relatórios
 */

import { Transacao, CicloFinanceiro, Categoria } from "@/types";

// ==================== TIPOS ====================

export interface TotaisFinanceiros {
  totalReceitas: number;
  totalDespesas: number;
  totalInvestimentos: number;
  saldo: number;
}

export interface TransacaoPorCategoria {
  categoria: string;
  total: number;
  transacoes: Transacao[];
}

export interface FiltroCiclo {
  inicio: Date;
  fim: Date;
}

// ==================== FUNÇÕES DE VALOR ====================

/**
 * Retorna o valor absoluto de uma transação
 * Centraliza a lógica Math.abs() para evitar inconsistências
 */
export const valorAbsoluto = (transacao: Transacao): number => {
  return Math.abs(transacao.valor);
};

/**
 * Retorna o valor absoluto de um número
 */
export const valorAbs = (valor: number): number => {
  return Math.abs(valor);
};

// ==================== FUNÇÕES DE FILTRO ====================

/**
 * Filtra transações por tipo
 */
export const filtrarPorTipo = (
  transacoes: Transacao[],
  tipo: "despesa" | "receita" | "investimento"
): Transacao[] => {
  return transacoes.filter(t => t.tipo === tipo);
};

/**
 * Filtra transações dentro de um ciclo financeiro
 */
export const filtrarPorCiclo = (
  transacoes: Transacao[],
  ciclo: CicloFinanceiro | FiltroCiclo
): Transacao[] => {
  const inicio = new Date(ciclo.inicio);
  const fim = new Date(ciclo.fim);
  
  inicio.setHours(0, 0, 0, 0);
  fim.setHours(23, 59, 59, 999);

  return transacoes.filter(t => {
    if (!t || !t.data) return false;
    
    const dataTransacao = t.data instanceof Date ? t.data : new Date(t.data);
    if (isNaN(dataTransacao.getTime())) return false;
    
    dataTransacao.setHours(0, 0, 0, 0);
    return dataTransacao >= inicio && dataTransacao <= fim;
  });
};

/**
 * Filtra transações por categoria
 */
export const filtrarPorCategoria = (
  transacoes: Transacao[],
  categoria: string
): Transacao[] => {
  return transacoes.filter(t => t.categoria === categoria);
};

// ==================== FUNÇÕES DE SOMA ====================

/**
 * Calcula o total de um array de transações (usando valor absoluto)
 */
export const somarTransacoes = (transacoes: Transacao[]): number => {
  return transacoes.reduce((acc, t) => acc + valorAbsoluto(t), 0);
};

/**
 * Calcula o total de receitas
 */
export const calcularTotalReceitas = (transacoes: Transacao[]): number => {
  return somarTransacoes(filtrarPorTipo(transacoes, "receita"));
};

/**
 * Calcula o total de despesas
 */
export const calcularTotalDespesas = (transacoes: Transacao[]): number => {
  return somarTransacoes(filtrarPorTipo(transacoes, "despesa"));
};

/**
 * Calcula o total de investimentos
 */
export const calcularTotalInvestimentos = (transacoes: Transacao[]): number => {
  return somarTransacoes(filtrarPorTipo(transacoes, "investimento"));
};

/**
 * Calcula o saldo (receitas - despesas)
 */
export const calcularSaldo = (transacoes: Transacao[]): number => {
  return calcularTotalReceitas(transacoes) - calcularTotalDespesas(transacoes);
};

/**
 * Calcula todos os totais financeiros de uma vez
 */
export const calcularTotaisFinanceiros = (transacoes: Transacao[]): TotaisFinanceiros => {
  const totalReceitas = calcularTotalReceitas(transacoes);
  const totalDespesas = calcularTotalDespesas(transacoes);
  const totalInvestimentos = calcularTotalInvestimentos(transacoes);
  const saldo = totalReceitas - totalDespesas;

  return {
    totalReceitas,
    totalDespesas,
    totalInvestimentos,
    saldo
  };
};

// ==================== FUNÇÕES DE AGRUPAMENTO ====================

/**
 * Agrupa transações por categoria e calcula totais
 */
export const agruparPorCategoria = (
  transacoes: Transacao[],
  tipo?: "despesa" | "receita" | "investimento"
): TransacaoPorCategoria[] => {
  const transacoesFiltradas = tipo ? filtrarPorTipo(transacoes, tipo) : transacoes;
  
  const grupos: Record<string, TransacaoPorCategoria> = {};
  
  transacoesFiltradas.forEach(t => {
    if (!grupos[t.categoria]) {
      grupos[t.categoria] = {
        categoria: t.categoria,
        total: 0,
        transacoes: []
      };
    }
    grupos[t.categoria].total += valorAbsoluto(t);
    grupos[t.categoria].transacoes.push(t);
  });
  
  return Object.values(grupos);
};

/**
 * Retorna as top N categorias por valor total
 */
export const topCategorias = (
  transacoes: Transacao[],
  tipo: "despesa" | "receita" | "investimento",
  limite: number = 5
): TransacaoPorCategoria[] => {
  return agruparPorCategoria(transacoes, tipo)
    .sort((a, b) => b.total - a.total)
    .slice(0, limite);
};

// ==================== FUNÇÕES DE CATEGORIA/ORÇAMENTO ====================

/**
 * Calcula gastos por categoria para um array de categorias
 */
export const calcularGastosPorCategoria = (
  transacoes: Transacao[],
  categorias: Categoria[]
): Categoria[] => {
  return categorias.map(categoria => {
    const transacoesDaCategoria = transacoes.filter(
      t => t.categoria === categoria.nome && t.tipo === categoria.tipo
    );
    
    const gastosAtuais = somarTransacoes(transacoesDaCategoria);
    
    return {
      ...categoria,
      gastosAtuais
    };
  });
};

/**
 * Calcula economia/estouro por categoria
 */
export const calcularEconomiaPorCategoria = (
  transacoes: Transacao[],
  categorias: Categoria[]
): Array<Categoria & { economia: number; percentualUsado: number }> => {
  const categoriasComGastos = calcularGastosPorCategoria(transacoes, categorias);
  
  return categoriasComGastos.map(cat => ({
    ...cat,
    economia: cat.orcamento - (cat.gastosAtuais || 0),
    percentualUsado: cat.orcamento > 0 
      ? ((cat.gastosAtuais || 0) / cat.orcamento) * 100 
      : 0
  }));
};

// ==================== FUNÇÕES DE TAXA/PERCENTUAL ====================

/**
 * Calcula a taxa de poupança
 */
export const calcularTaxaPoupanca = (transacoes: Transacao[]): number => {
  const totalReceitas = calcularTotalReceitas(transacoes);
  const totalDespesas = calcularTotalDespesas(transacoes);
  
  if (totalReceitas === 0) return 0;
  
  return ((totalReceitas - totalDespesas) / totalReceitas) * 100;
};

/**
 * Calcula variação percentual entre dois valores
 */
export const calcularVariacaoPercentual = (valorAtual: number, valorAnterior: number): number => {
  if (valorAnterior === 0) return valorAtual > 0 ? 100 : 0;
  return ((valorAtual - valorAnterior) / valorAnterior) * 100;
};

// ==================== FUNÇÕES DE PARCELAMENTO ====================

/**
 * Filtra transações parceladas
 */
export const filtrarParceladas = (transacoes: Transacao[]): Transacao[] => {
  return transacoes.filter(t => t.parcelas > 1);
};

/**
 * Calcula valor total de uma transação parcelada
 */
export const valorTotalParcelado = (transacao: Transacao): number => {
  return valorAbsoluto(transacao) * transacao.parcelas;
};

/**
 * Calcula valor da parcela
 */
export const valorParcela = (transacao: Transacao): number => {
  return valorAbsoluto(transacao);
};
