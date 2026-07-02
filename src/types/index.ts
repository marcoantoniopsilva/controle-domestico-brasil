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
  quemGastou: string;
  descricao?: string;
  tipo: "despesa" | "receita" | "investimento";
  ganhos?: number; // Novo campo para ganhos/perdas de investimentos
  isParcela?: boolean;
  parcelaAtual?: number;
  cartaoId?: string | null;
  contaId?: string | null;
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

export interface CartaoCredito {
  id: string;
  nome: string;
  bandeira?: string | null;
  banco?: string | null;
  cor: string;
  diaFechamento: number;
  diaVencimento: number;
  metaMensal?: number | null;
  ativo: boolean;
  ordem: number;
}

export type MetaTipo = "reserva" | "viagem" | "compra" | "investimento" | "outro";

export interface MetaFinanceira {
  id: string;
  nome: string;
  tipo: MetaTipo;
  valorAlvo: number;
  valorInicial: number;
  prazo: string | null; // YYYY-MM-DD
  cor: string;
  icone: string;
  concluida: boolean;
  ordem: number;
}

export interface MetaAporte {
  id: string;
  metaId: string;
  valor: number;
  data: string; // YYYY-MM-DD
  observacao: string | null;
}

export type ContaTipo = "corrente" | "poupanca" | "carteira" | "dinheiro" | "investimento" | "outro";

export interface ContaBancaria {
  id: string;
  nome: string;
  tipo: ContaTipo;
  banco: string | null;
  saldoInicial: number;
  cor: string;
  incluirNoSaldo: boolean;
  ativo: boolean;
  observacoes: string | null;
}
