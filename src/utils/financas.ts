
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
  // Categorias de Despesa - Apenas categorias com atividade no ciclo atual
  { nome: "Aplicativos e restaurantes", tipo: "despesa" as const, orcamento: 400, gastosAtuais: 0 },
  { nome: "Casa", tipo: "despesa" as const, orcamento: 1000, gastosAtuais: 0 },
  { nome: "Compras da Bruna", tipo: "despesa" as const, orcamento: 500, gastosAtuais: 0 },
  { nome: "Compras do Marco", tipo: "despesa" as const, orcamento: 300, gastosAtuais: 0 },
  { nome: "Compras parceladas Bruna", tipo: "despesa" as const, orcamento: 250, gastosAtuais: 0 },
  { nome: "Compras parceladas Marco", tipo: "despesa" as const, orcamento: 150, gastosAtuais: 0 },
  { nome: "Despesas fixas no dinheiro", tipo: "despesa" as const, orcamento: 5200, gastosAtuais: 0 },
  { nome: "Essence", tipo: "despesa" as const, orcamento: 700, gastosAtuais: 0 },
  { nome: "Estacionamento", tipo: "despesa" as const, orcamento: 100, gastosAtuais: 0 },
  { nome: "Farmácia", tipo: "despesa" as const, orcamento: 250, gastosAtuais: 0 },
  { nome: "Fraldas Aurora", tipo: "despesa" as const, orcamento: 400, gastosAtuais: 0 },
  { nome: "Gato", tipo: "despesa" as const, orcamento: 50, gastosAtuais: 0 },
  { nome: "Outros", tipo: "despesa" as const, orcamento: 350, gastosAtuais: 0 },
  { nome: "Serviços de internet", tipo: "despesa" as const, orcamento: 150, gastosAtuais: 0 },
  { nome: "Supermercado", tipo: "despesa" as const, orcamento: 1800, gastosAtuais: 0 },
  
  // Categorias com orçamentos baseados no histórico real
  { nome: "Academia", tipo: "despesa" as const, orcamento: 160, gastosAtuais: 0 },
  { nome: "Aniversário da Aurora", tipo: "despesa" as const, orcamento: 300, gastosAtuais: 0 },
  { nome: "Doações", tipo: "despesa" as const, orcamento: 50, gastosAtuais: 0 },
  { nome: "Fórmula e leite Aurora", tipo: "despesa" as const, orcamento: 200, gastosAtuais: 0 },
  { nome: "Saúde", tipo: "despesa" as const, orcamento: 700, gastosAtuais: 0 },
  { nome: "Uber / transporte", tipo: "despesa" as const, orcamento: 200, gastosAtuais: 0 },
  { nome: "Viagens", tipo: "despesa" as const, orcamento: 300, gastosAtuais: 0 },
  
  // Categorias de Receita - Baseadas nos dados reais do banco
  { nome: "⅓ de férias", tipo: "receita" as const, orcamento: 0, gastosAtuais: 0 },
  { nome: "Outras receitas", tipo: "receita" as const, orcamento: 0, gastosAtuais: 0 },
  { nome: "Pagamento mamãe", tipo: "receita" as const, orcamento: 0, gastosAtuais: 0 },
  { nome: "Receita Essence", tipo: "receita" as const, orcamento: 0, gastosAtuais: 0 },
  { nome: "Salário", tipo: "receita" as const, orcamento: 0, gastosAtuais: 0 },
];

// Log para verificar o total dos orçamentos de despesa
const totalOrcamentoDespesas = categorias
  .filter(cat => cat.tipo === "despesa")
  .reduce((acc, cat) => acc + cat.orcamento, 0);

console.log("[financas.ts] TOTAL ORÇAMENTO DESPESAS:", totalOrcamentoDespesas);
console.log("[financas.ts] Categorias de despesa:", categorias.filter(cat => cat.tipo === "despesa").map(cat => `${cat.nome}: R$ ${cat.orcamento}`));

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
