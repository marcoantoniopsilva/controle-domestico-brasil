
import { Categoria } from "@/types";

// Categorias específicas para investimentos
export const categoriasInvestimentos: Categoria[] = [
  { nome: "Renda Fixa", orcamento: 0, gastosAtuais: 0, tipo: "investimento" },
  { nome: "FII", orcamento: 0, gastosAtuais: 0, tipo: "investimento" },
  { nome: "Dólar", orcamento: 0, gastosAtuais: 0, tipo: "investimento" },
  { nome: "Tesouro Direto", orcamento: 0, gastosAtuais: 0, tipo: "investimento" },
  { nome: "Ações", orcamento: 0, gastosAtuais: 0, tipo: "investimento" },
];

// Função para calcular a evolução dos investimentos
export const calcularEvolucaoInvestimentos = (transacoes: any[], periodo: 'semana' | 'mes' | 'semestre' | 'ano') => {
  const investimentos = transacoes.filter(t => t.tipo === 'investimento');
  const agora = new Date();
  let dataInicio: Date;

  switch (periodo) {
    case 'semana':
      dataInicio = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'mes':
      dataInicio = new Date(agora.getFullYear(), agora.getMonth() - 1, agora.getDate());
      break;
    case 'semestre':
      dataInicio = new Date(agora.getFullYear(), agora.getMonth() - 6, agora.getDate());
      break;
    case 'ano':
      dataInicio = new Date(agora.getFullYear() - 1, agora.getMonth(), agora.getDate());
      break;
    default:
      dataInicio = new Date(agora.getFullYear(), 0, 1);
  }

  const investimentosFiltrados = investimentos.filter(inv => 
    new Date(inv.data) >= dataInicio && new Date(inv.data) <= agora
  );

  // Agrupar por categoria
  const evolucaoPorCategoria = categoriasInvestimentos.map(categoria => {
    const investimentosCategoria = investimentosFiltrados.filter(inv => inv.categoria === categoria.nome);
    const totalInvestido = investimentosCategoria.reduce((acc, inv) => acc + Math.abs(inv.valor), 0);
    const totalGanhos = investimentosCategoria.reduce((acc, inv) => acc + (inv.ganhos || 0), 0);
    
    return {
      categoria: categoria.nome,
      totalInvestido,
      totalGanhos,
      saldoTotal: totalInvestido + totalGanhos,
      percentualGanho: totalInvestido > 0 ? (totalGanhos / totalInvestido) * 100 : 0
    };
  });

  return evolucaoPorCategoria;
};

// Função para formatar valores monetários
export const formatarMoedaInvestimento = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
};

// Cores para os gráficos de investimentos
export const coresInvestimentos = {
  "Renda Fixa": "#22c55e",
  "FII": "#3b82f6", 
  "Dólar": "#eab308",
  "Tesouro Direto": "#8b5cf6",
  "Ações": "#ef4444"
};
