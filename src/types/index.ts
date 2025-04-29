
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
  quemGastou: 'Marco' | 'Bruna';
  descricao?: string;
  tipo: 'despesa' | 'receita';
  isParcela?: boolean; // Indica se é uma parcela projetada
  parcelaAtual?: number; // Número da parcela atual
}

export interface Categoria {
  nome: string;
  orcamento: number;
  gastosAtuais: number;
  tipo: 'despesa' | 'receita';
}

export interface CicloFinanceiro {
  inicio: Date;
  fim: Date;
  nome: string;
}

export interface ResumoFinanceiro {
  totalReceitas: number;
  totalDespesas: number;
  saldoAtual: number;
}
