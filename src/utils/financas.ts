
import { CicloFinanceiro } from "@/types";
import { format, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

export const formatarMoeda = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

export const DEFAULT_CYCLE_START_DAY = 25;

export const categorias = [
  // Categorias de Despesa - Apenas categorias com atividade no ciclo atual
  { nome: "Aplicativos e restaurantes", tipo: "despesa" as const, orcamento: 800, gastosAtuais: 0 },
  { nome: "Atividades do(a)(s) filho(a)(s)", tipo: "despesa" as const, orcamento: 421, gastosAtuais: 0 },
  { nome: "Casa", tipo: "despesa" as const, orcamento: 1000, gastosAtuais: 0 },
  { nome: "Condomínio e aluguel", tipo: "despesa" as const, orcamento: 6500, gastosAtuais: 0 },
  { nome: "Contas e convênios", tipo: "despesa" as const, orcamento: 550, gastosAtuais: 0 },
  { nome: "Compras à vista 1", tipo: "despesa" as const, orcamento: 600, gastosAtuais: 0 },
  { nome: "Compras à vista 2", tipo: "despesa" as const, orcamento: 600, gastosAtuais: 0 },
  { nome: "Compras parceladas 1", tipo: "despesa" as const, orcamento: 600, gastosAtuais: 0 },
  { nome: "Compras parceladas 2", tipo: "despesa" as const, orcamento: 600, gastosAtuais: 0 },
  { nome: "Despesas fixas no dinheiro", tipo: "despesa" as const, orcamento: 5200, gastosAtuais: 0 },
  { nome: "Estacionamento", tipo: "despesa" as const, orcamento: 100, gastosAtuais: 0 },
  { nome: "Farmácia", tipo: "despesa" as const, orcamento: 250, gastosAtuais: 0 },
  { nome: "Abastecimento Carro", tipo: "despesa" as const, orcamento: 200, gastosAtuais: 0 },
  { nome: "Gato/Cachorro", tipo: "despesa" as const, orcamento: 50, gastosAtuais: 0 },
  { nome: "Lazer", tipo: "despesa" as const, orcamento: 180, gastosAtuais: 0 },
  { nome: "Outros", tipo: "despesa" as const, orcamento: 350, gastosAtuais: 0 },
  { nome: "Serviços de internet", tipo: "despesa" as const, orcamento: 150, gastosAtuais: 0 },
  { nome: "Supermercado", tipo: "despesa" as const, orcamento: 2300, gastosAtuais: 0 },
  
  // Categorias com orçamentos baseados no histórico real
  { nome: "Academia", tipo: "despesa" as const, orcamento: 160, gastosAtuais: 0 },
  { nome: "Presentes/roupas bebê", tipo: "despesa" as const, orcamento: 300, gastosAtuais: 0 },
  { nome: "Doações", tipo: "despesa" as const, orcamento: 50, gastosAtuais: 0 },
  { nome: "Gastos com bebê", tipo: "despesa" as const, orcamento: 200, gastosAtuais: 0 },
  { nome: "Saúde", tipo: "despesa" as const, orcamento: 800, gastosAtuais: 0 },
  { nome: "Seguro e manutenção", tipo: "despesa" as const, orcamento: 500, gastosAtuais: 0 },
  { nome: "Uber", tipo: "despesa" as const, orcamento: 120, gastosAtuais: 0 },
  { nome: "Viagens", tipo: "despesa" as const, orcamento: 300, gastosAtuais: 0 },
  { nome: "Impostos, taxas e multas", tipo: "despesa" as const, orcamento: 0, gastosAtuais: 0 },
  { nome: "Gastos extraordinários", tipo: "despesa" as const, orcamento: 0, gastosAtuais: 0 },
  
  // Categorias de Receita - Baseadas nos dados reais do banco
  { nome: "⅓ de férias", tipo: "receita" as const, orcamento: 0, gastosAtuais: 0 },
  { nome: "Outras receitas", tipo: "receita" as const, orcamento: 0, gastosAtuais: 0 },
  { nome: "Transferências", tipo: "receita" as const, orcamento: 0, gastosAtuais: 0 },
  { nome: "Restituições", tipo: "receita" as const, orcamento: 0, gastosAtuais: 0 },
  { nome: "Salário", tipo: "receita" as const, orcamento: 0, gastosAtuais: 0 },
  { nome: "13º salário", tipo: "receita" as const, orcamento: 0, gastosAtuais: 0 },
  { nome: "Gratificações/horas extras", tipo: "receita" as const, orcamento: 0, gastosAtuais: 0 },
  
  // Categorias de Investimento
  { nome: "Renda Fixa", tipo: "investimento" as const, orcamento: 0, gastosAtuais: 0 },
  { nome: "Ações", tipo: "investimento" as const, orcamento: 0, gastosAtuais: 0 },
  { nome: "Fundos de Investimento", tipo: "investimento" as const, orcamento: 0, gastosAtuais: 0 },
  { nome: "Tesouro Direto", tipo: "investimento" as const, orcamento: 0, gastosAtuais: 0 },
  { nome: "CDB", tipo: "investimento" as const, orcamento: 0, gastosAtuais: 0 },
  { nome: "LCI/LCA", tipo: "investimento" as const, orcamento: 0, gastosAtuais: 0 },
  { nome: "Criptomoedas", tipo: "investimento" as const, orcamento: 0, gastosAtuais: 0 },
  { nome: "Previdência Privada", tipo: "investimento" as const, orcamento: 0, gastosAtuais: 0 },
  { nome: "Outros Investimentos", tipo: "investimento" as const, orcamento: 0, gastosAtuais: 0 },
];

// Alias para manter compatibilidade
export const categoriasDefault = categorias;

// Log para verificar o total dos orçamentos de despesa
const totalOrcamentoDespesas = categorias
  .filter(cat => cat.tipo === "despesa")
  .reduce((acc, cat) => acc + cat.orcamento, 0);

console.log("[financas.ts] TOTAL ORÇAMENTO DESPESAS:", totalOrcamentoDespesas);
console.log("[financas.ts] Categorias de despesa:", categorias.filter(cat => cat.tipo === "despesa").map(cat => `${cat.nome}: R$ ${cat.orcamento}`));

// Lista de responsáveis agora é configurada por usuário (ver user_preferences.responsaveis).

export const calcularCicloAtual = (cycleStartDay: number = DEFAULT_CYCLE_START_DAY): CicloFinanceiro => {
  const hoje = new Date();
  const diaAtual = hoje.getDate();
  const startDay = Math.max(1, Math.min(28, cycleStartDay || DEFAULT_CYCLE_START_DAY));

  let inicio: Date;
  let fim: Date;

  if (diaAtual >= startDay) {
    inicio = new Date(hoje.getFullYear(), hoje.getMonth(), startDay);
    fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, startDay - 1);
  } else {
    inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, startDay);
    fim = new Date(hoje.getFullYear(), hoje.getMonth(), startDay - 1);
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
