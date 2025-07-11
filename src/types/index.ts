export interface Usuario {
  id: string;
  nome: string;
  email: string;
}

export interface Transacao {
  id: string;
  data: Date;
  categoria: string;
  valor: number;
  parcelas: number;
  quemGastou: "Marco" | "Bruna";
  descricao?: string;
  tipo: "despesa" | "receita" | "investimento";
  ganhos?: number; // Novo campo para ganhos/perdas de investimentos
  isParcela?: boolean;
  parcelaAtual?: number;
}

export interface Categoria {
  nome: string;
  tipo: "despesa" | "receita" | "investimento";
  orcamento: number;
  gastosAtuais?: number;
}

export interface CicloFinanceiro {
  inicio: Date;
  fim: Date;
  nome: string;
}

export interface ResumoFinanceiro {
  totalReceitas: number;
  totalDespesas: number;
  totalInvestimentos: number;
  totalGanhos: number;
  saldoAtual: number;
}

export interface InvestmentEvolution {
  data: Date;
  valorInvestido: number;
  ganhos: number;
  saldoTotal: number;
}
