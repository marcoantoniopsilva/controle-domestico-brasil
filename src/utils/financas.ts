
import { CicloFinanceiro } from "@/types";
import { format, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

export const formatarMoeda = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

export const categorias = [
  // Categorias de Despesa
  { nome: "Alimentação", tipo: "despesa" as const, orcamento: 800, gastosAtuais: 0 },
  { nome: "Transporte", tipo: "despesa" as const, orcamento: 300, gastosAtuais: 0 },
  { nome: "Moradia", tipo: "despesa" as const, orcamento: 1200, gastosAtuais: 0 },
  { nome: "Saúde", tipo: "despesa" as const, orcamento: 200, gastosAtuais: 0 },
  { nome: "Educação", tipo: "despesa" as const, orcamento: 150, gastosAtuais: 0 },
  { nome: "Lazer", tipo: "despesa" as const, orcamento: 300, gastosAtuais: 0 },
  { nome: "Roupas", tipo: "despesa" as const, orcamento: 200, gastosAtuais: 0 },
  { nome: "Serviços", tipo: "despesa" as const, orcamento: 150, gastosAtuais: 0 },
  { nome: "Outros Despesas", tipo: "despesa" as const, orcamento: 100, gastosAtuais: 0 },
  
  // Categorias de Receita
  { nome: "Salário", tipo: "receita" as const, orcamento: 5000, gastosAtuais: 0 },
  { nome: "Freelance", tipo: "receita" as const, orcamento: 1000, gastosAtuais: 0 },
  { nome: "Renda Extra", tipo: "receita" as const, orcamento: 500, gastosAtuais: 0 },
  { nome: "Outros Receitas", tipo: "receita" as const, orcamento: 200, gastosAtuais: 0 },
  
  // Categorias de Investimento
  { nome: "Ações", tipo: "investimento" as const, orcamento: 1000, gastosAtuais: 0 },
  { nome: "Fundos", tipo: "investimento" as const, orcamento: 800, gastosAtuais: 0 },
  { nome: "Renda Fixa", tipo: "investimento" as const, orcamento: 600, gastosAtuais: 0 },
  { nome: "Criptomoedas", tipo: "investimento" as const, orcamento: 300, gastosAtuais: 0 },
  { nome: "Imóveis", tipo: "investimento" as const, orcamento: 2000, gastosAtuais: 0 },
  { nome: "Outros Investimentos", tipo: "investimento" as const, orcamento: 500, gastosAtuais: 0 },
];

export const quemGastouOpcoes = [
  { value: "Marco", label: "Marco" },
  { value: "Bruna", label: "Bruna" },
];

export const calcularCicloAtual = (): CicloFinanceiro => {
  const hoje = new Date();
  const diaAtual = hoje.getDate();
  
  let inicio: Date;
  let fim: Date;
  
  if (diaAtual >= 25) {
    // Estamos no ciclo atual (25 do mês atual até 24 do próximo mês)
    inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 25);
    fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 24);
  } else {
    // Estamos no ciclo anterior (25 do mês passado até 24 do mês atual)
    inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 25);
    fim = new Date(hoje.getFullYear(), hoje.getMonth(), 24);
  }
  
  const nomeMesInicio = format(inicio, 'MMMM', { locale: ptBR });
  const nomeMesFim = format(fim, 'MMMM', { locale: ptBR });
  const anoInicio = format(inicio, 'yyyy');
  const anoFim = format(fim, 'yyyy');
  
  return {
    inicio,
    fim,
    nome: `${nomeMesInicio} ${anoInicio} - ${nomeMesFim} ${anoFim}`
  };
};

export const calcularLimiteDiario = (ciclo: CicloFinanceiro, orcamentoTotal: number): number => {
  const diasNoCiclo = Math.ceil((ciclo.fim.getTime() - ciclo.inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return orcamentoTotal / diasNoCiclo;
};
