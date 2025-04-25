
import { Categoria, CicloFinanceiro, Transacao } from "@/types";

// Definição das categorias com orçamentos
export const categorias: Categoria[] = [
  { nome: "Supermercado", orcamento: 2000, gastosAtuais: 0 },
  { nome: "Aplicativos e restaurantes", orcamento: 1000, gastosAtuais: 0 },
  { nome: "Uber / transporte", orcamento: 250, gastosAtuais: 0 },
  { nome: "Farmácia", orcamento: 600, gastosAtuais: 0 },
  { nome: "Compras parceladas Marco", orcamento: 900, gastosAtuais: 0 }, // Updated name and limit
  { nome: "Compras parceladas Bruna", orcamento: 900, gastosAtuais: 0 }, // New category
  { nome: "Compras do Marco", orcamento: 500, gastosAtuais: 0 },
  { nome: "Compras da Bruna", orcamento: 500, gastosAtuais: 0 },
  { nome: "Serviços de internet", orcamento: 350, gastosAtuais: 0 },
  { nome: "Academia", orcamento: 350, gastosAtuais: 0 },
  { nome: "Poupança/investimento", orcamento: 100, gastosAtuais: 0 },
  { nome: "Doações", orcamento: 100, gastosAtuais: 0 },
  { nome: "Aniversário da Aurora", orcamento: 0, gastosAtuais: 0 },
  { nome: "Fraldas Aurora", orcamento: 300, gastosAtuais: 0 },
  { nome: "Fórmula e leite Aurora", orcamento: 300, gastosAtuais: 0 },
  { nome: "Essence", orcamento: 0, gastosAtuais: 0 }, // New category without limit
  { nome: "Estacionamento", orcamento: 120, gastosAtuais: 0 }, // New category
  { nome: "Outros", orcamento: 500, gastosAtuais: 0 },
];

// Função para calcular o início e fim do ciclo atual
export function calcularCicloAtual(): CicloFinanceiro {
  const hoje = new Date();
  let inicioMes: Date;
  let fimMes: Date;
  
  if (hoje.getDate() < 25) {
    // Estamos entre 1 e 24 do mês atual
    const mesAnterior = hoje.getMonth() === 0 ? 11 : hoje.getMonth() - 1;
    const anoInicio = mesAnterior === 11 ? hoje.getFullYear() - 1 : hoje.getFullYear();
    
    inicioMes = new Date(anoInicio, mesAnterior, 25);
    fimMes = new Date(hoje.getFullYear(), hoje.getMonth(), 24);
  } else {
    // Estamos entre 25 e 31 do mês atual
    inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 25);
    
    const proxMes = hoje.getMonth() === 11 ? 0 : hoje.getMonth() + 1;
    const anoFim = proxMes === 0 ? hoje.getFullYear() + 1 : hoje.getFullYear();
    
    fimMes = new Date(anoFim, proxMes, 24);
  }
  
  // Formatação do nome do ciclo
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  const mesInicioNome = meses[inicioMes.getMonth()];
  const mesFimNome = meses[fimMes.getMonth()];
  const nomeCiclo = `${mesInicioNome} - ${mesFimNome}`;
  
  return {
    inicio: inicioMes,
    fim: fimMes,
    nome: nomeCiclo
  };
}

// Função para formatar valor em moeda brasileira
export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

// Função para calcular limite diário ideal
export function calcularLimiteDiario(ciclo: CicloFinanceiro, orcamentoTotal: number): number {
  const umDia = 24 * 60 * 60 * 1000; // milissegundos em um dia
  const diasNoCiclo = Math.round((ciclo.fim.getTime() - ciclo.inicio.getTime()) / umDia) + 1;
  return orcamentoTotal / diasNoCiclo;
}

// Função para filtrar transações por ciclo
export function filtrarTransacoesPorCiclo(transacoes: Transacao[], ciclo: CicloFinanceiro): Transacao[] {
  return transacoes.filter(transacao => {
    const dataTransacao = new Date(transacao.data);
    return dataTransacao >= ciclo.inicio && dataTransacao <= ciclo.fim;
  });
}

// Função para verificar se uma data está dentro do ciclo
export function dataEstaNoCiclo(data: Date, ciclo: CicloFinanceiro): boolean {
  return data >= ciclo.inicio && data <= ciclo.fim;
}
