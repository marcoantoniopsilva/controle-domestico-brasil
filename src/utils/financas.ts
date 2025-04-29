
import { Categoria, CicloFinanceiro, Transacao } from "@/types";

// Definição das categorias com orçamentos
export const categorias: Categoria[] = [
  // Categorias de despesas
  { nome: "Supermercado", orcamento: 2000, gastosAtuais: 0, tipo: "despesa" },
  { nome: "Aplicativos e restaurantes", orcamento: 1000, gastosAtuais: 0, tipo: "despesa" },
  { nome: "Uber / transporte", orcamento: 250, gastosAtuais: 0, tipo: "despesa" },
  { nome: "Farmácia", orcamento: 600, gastosAtuais: 0, tipo: "despesa" },
  { nome: "Compras parceladas Marco", orcamento: 900, gastosAtuais: 0, tipo: "despesa" }, 
  { nome: "Compras parceladas Bruna", orcamento: 900, gastosAtuais: 0, tipo: "despesa" }, 
  { nome: "Compras do Marco", orcamento: 500, gastosAtuais: 0, tipo: "despesa" },
  { nome: "Compras da Bruna", orcamento: 500, gastosAtuais: 0, tipo: "despesa" },
  { nome: "Serviços de internet", orcamento: 350, gastosAtuais: 0, tipo: "despesa" },
  { nome: "Academia", orcamento: 350, gastosAtuais: 0, tipo: "despesa" },
  { nome: "Poupança/investimento", orcamento: 100, gastosAtuais: 0, tipo: "despesa" },
  { nome: "Doações", orcamento: 100, gastosAtuais: 0, tipo: "despesa" },
  { nome: "Aniversário da Aurora", orcamento: 0, gastosAtuais: 0, tipo: "despesa" },
  { nome: "Fraldas Aurora", orcamento: 300, gastosAtuais: 0, tipo: "despesa" },
  { nome: "Fórmula e leite Aurora", orcamento: 300, gastosAtuais: 0, tipo: "despesa" },
  { nome: "Essence", orcamento: 0, gastosAtuais: 0, tipo: "despesa" }, 
  { nome: "Estacionamento", orcamento: 120, gastosAtuais: 0, tipo: "despesa" }, 
  { nome: "Outros", orcamento: 500, gastosAtuais: 0, tipo: "despesa" },
  { nome: "Viagens", orcamento: 150, gastosAtuais: 0, tipo: "despesa" },
  { nome: "Casa", orcamento: 120, gastosAtuais: 0, tipo: "despesa" },
  { nome: "Gato", orcamento: 100, gastosAtuais: 0, tipo: "despesa" },
  { nome: "Despesas fixas no dinheiro", orcamento: 11910, gastosAtuais: 0, tipo: "despesa" },
  
  // Categorias de receitas
  { nome: "Salário", orcamento: 0, gastosAtuais: 0, tipo: "receita" },
  { nome: "13º", orcamento: 0, gastosAtuais: 0, tipo: "receita" },
  { nome: "⅓ de férias", orcamento: 0, gastosAtuais: 0, tipo: "receita" },
  { nome: "Restituição", orcamento: 0, gastosAtuais: 0, tipo: "receita" },
  { nome: "Pagamento mamãe", orcamento: 0, gastosAtuais: 0, tipo: "receita" },
  { nome: "Receita Essence", orcamento: 0, gastosAtuais: 0, tipo: "receita" },
  { nome: "Outras receitas", orcamento: 0, gastosAtuais: 0, tipo: "receita" },
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
  
  // Formatação do nome do ciclo com os anos sempre incluídos
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  const mesInicioNome = meses[inicioMes.getMonth()].toLowerCase();
  const mesFimNome = meses[fimMes.getMonth()].toLowerCase();
  const anoInicio = inicioMes.getFullYear();
  const anoFim = fimMes.getFullYear();
  
  // Sempre incluir os anos no nome do ciclo
  const nomeCiclo = `${mesInicioNome} ${anoInicio} - ${mesFimNome} ${anoFim}`;
  
  console.log(`[financas.ts] Ciclo atual calculado: ${nomeCiclo} (${inicioMes.toISOString()} até ${fimMes.toISOString()})`);
  
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
  const inicio = new Date(ciclo.inicio);
  const fim = new Date(ciclo.fim);
  const diasNoCiclo = Math.round((fim.getTime() - inicio.getTime()) / umDia) + 1;
  return orcamentoTotal / diasNoCiclo;
}

// Função para filtrar transações por ciclo - melhorada para garantir comparação correta
export function filtrarTransacoesPorCiclo(transacoes: Transacao[], ciclo: CicloFinanceiro): Transacao[] {
  // Certifique-se de que ciclo.inicio e ciclo.fim são instâncias de Date
  const inicio = new Date(ciclo.inicio);
  const fim = new Date(ciclo.fim);
  
  // Certifique-se de que as datas estejam na hora 00:00:00 para início e 23:59:59 para fim
  inicio.setHours(0, 0, 0, 0);
  fim.setHours(23, 59, 59, 999);
  
  console.log("[financas.ts] Filtrando transações para o ciclo:", ciclo.nome);
  console.log("[financas.ts] Data início do ciclo:", inicio.toISOString());
  console.log("[financas.ts] Data fim do ciclo:", fim.toISOString());
  
  return transacoes.filter(transacao => {
    // Certifique-se de que estamos trabalhando com objetos Date
    const dataTransacao = new Date(transacao.data);
    dataTransacao.setHours(0, 0, 0, 0);
    
    const estaNoCiclo = dataTransacao >= inicio && dataTransacao <= fim;
    
    if (estaNoCiclo) {
      console.log(`[financas.ts] Transação ${transacao.id} está no ciclo ${ciclo.nome}`);
      console.log(`[financas.ts] Data da transação: ${dataTransacao.toISOString()}`);
    }
    
    return estaNoCiclo;
  });
}

// Função para verificar se uma data está dentro do ciclo - melhorada para garantir comparação correta
export function dataEstaNoCiclo(data: Date, ciclo: CicloFinanceiro): boolean {
  // Certifique-se de que estamos trabalhando com objetos Date
  const dataParaComparar = new Date(data);
  const inicio = new Date(ciclo.inicio);
  const fim = new Date(ciclo.fim);
  
  // Configure as horas para garantir comparação correta
  dataParaComparar.setHours(0, 0, 0, 0);
  inicio.setHours(0, 0, 0, 0);
  fim.setHours(23, 59, 59, 999);
  
  return dataParaComparar >= inicio && dataParaComparar <= fim;
}
