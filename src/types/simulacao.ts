export interface SimulacaoCategoria {
  categoriaNome: string;
  categoriaTipo: "despesa" | "receita" | "investimento";
  valorPrevisto: number;
  valorOrcamentoBase: number;
}

export interface SimulacaoMes {
  mes: number; // 1-12
  ano: number;
  categorias: SimulacaoCategoria[];
}

export interface SimulacaoAnual {
  ano: number;
  meses: SimulacaoMes[];
}

export interface ComparativoCiclo {
  mes: number;
  ano: number;
  cicloFechado: boolean;
  totalReceitasPrevisto: number;
  totalDespesasPrevisto: number;
  totalInvestimentosPrevisto: number;
  totalReceitasRealizado: number;
  totalDespesasRealizado: number;
  totalInvestimentosRealizado: number;
  saldoPrevisto: number;
  saldoRealizado: number;
  diferenca: number;
}

export interface TotaisSimulacao {
  totalReceitas: number;
  totalDespesas: number;
  totalInvestimentos: number;
  saldoLiquido: number;
  capacidadeInvestimento: number;
}

export interface SaldoMensal {
  mes: number;
  receitas: number;
  despesas: number;
  investimentos: number;
  saldoMes: number;
  saldoAcumulado: number;
}

export const MESES_NOMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export const MESES_ABREV = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez"
];
