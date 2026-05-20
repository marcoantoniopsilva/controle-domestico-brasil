// Utilitários para cálculo de ciclos financeiros
import { format, subMonths, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Transacao } from "@/types";
import { DEFAULT_CYCLE_START_DAY } from "@/utils/financas";

export interface CicloFinanceiroDetalhado {
  inicio: Date;
  fim: Date;
  nome: string;
  nomeCompleto: string;
  temTransacoes: boolean;
}

const clampDay = (d: number) => Math.max(1, Math.min(28, d || DEFAULT_CYCLE_START_DAY));

// Função para calcular o início do ciclo financeiro baseado em uma data
const calcularInicioCiclo = (data: Date, cycleStartDay: number = DEFAULT_CYCLE_START_DAY): Date => {
  const ano = data.getFullYear();
  const mes = data.getMonth();
  const startDay = clampDay(cycleStartDay);

  if (data.getDate() < startDay) {
    return new Date(ano, mes - 1, startDay);
  } else {
    return new Date(ano, mes, startDay);
  }
};

// Função para calcular o fim do ciclo financeiro baseado no início
const calcularFimCiclo = (inicioCiclo: Date, cycleStartDay: number = DEFAULT_CYCLE_START_DAY): Date => {
  const fimCiclo = new Date(inicioCiclo);
  fimCiclo.setMonth(fimCiclo.getMonth() + 1);
  fimCiclo.setDate(clampDay(cycleStartDay) - 1);
  return fimCiclo;
};

// Função aprimorada para gerar ciclos financeiros que detecta TODOS os ciclos com dados
export const gerarCiclosFinanceiros = (transacoes: Transacao[], cycleStartDay: number = DEFAULT_CYCLE_START_DAY): CicloFinanceiroDetalhado[] => {
  console.log("[ciclosFinanceiros] Iniciando geração de ciclos para", transacoes.length, "transações");
  
  if (transacoes.length === 0) {
    console.log("[ciclosFinanceiros] Nenhuma transação fornecida");
    return [];
  }
  
  const ciclos: CicloFinanceiroDetalhado[] = [];
  
  // Encontrar a data mais antiga e mais recente das transações
  const datasTransacoes = transacoes.map(t => new Date(t.data)).sort((a, b) => a.getTime() - b.getTime());
  const dataInicial = datasTransacoes[0];
  const dataFinal = datasTransacoes[datasTransacoes.length - 1];
  
  console.log(`[ciclosFinanceiros] Período das transações: ${dataInicial.toDateString()} até ${dataFinal.toDateString()}`);
  
  // Expandir MUITO o período para garantir que cobrimos TODOS os ciclos possíveis
  const inicioGeracao = subMonths(dataInicial, 6); // 6 meses antes da primeira transação
  const fimGeracao = addMonths(dataFinal, 6); // 6 meses depois da última transação
  
  console.log(`[ciclosFinanceiros] Gerando ciclos de ${inicioGeracao.toDateString()} até ${fimGeracao.toDateString()}`);
  
  // Começar do início do primeiro ciclo no período
  let cicloAtual = calcularInicioCiclo(inicioGeracao, cycleStartDay);
  
  while (cicloAtual <= fimGeracao) {
    const inicioCiclo = new Date(cicloAtual);
    const fimCiclo = calcularFimCiclo(inicioCiclo, cycleStartDay);
    
    // Verificar se este ciclo tem transações usando comparação de datas normalizada
    const transacoesCiclo = transacoes.filter(t => {
      const dataTransacao = new Date(t.data);
      // Normalizar datas para comparação apenas de dia/mês/ano
      const dataTransacaoNormalizada = new Date(dataTransacao.getFullYear(), dataTransacao.getMonth(), dataTransacao.getDate());
      const inicioNormalizado = new Date(inicioCiclo.getFullYear(), inicioCiclo.getMonth(), inicioCiclo.getDate());
      const fimNormalizado = new Date(fimCiclo.getFullYear(), fimCiclo.getMonth(), fimCiclo.getDate());
      
      const dentroDoIntervalo = dataTransacaoNormalizada >= inicioNormalizado && dataTransacaoNormalizada <= fimNormalizado;
      
      // Log detalhado para debug
      if (dentroDoIntervalo) {
        console.log(`[ciclosFinanceiros] Transação ${t.id} (${dataTransacaoNormalizada.toDateString()}) está no ciclo ${formatarNomeCiclo(inicioCiclo, fimCiclo)}`);
      }
      
      return dentroDoIntervalo;
    });
    
    const nomeCiclo = formatarNomeCiclo(inicioCiclo, fimCiclo);
    
    console.log(`[ciclosFinanceiros] Ciclo ${nomeCiclo}: ${transacoesCiclo.length} transações (${inicioCiclo.toDateString()} a ${fimCiclo.toDateString()})`);
    
    ciclos.push({
      inicio: inicioCiclo,
      fim: fimCiclo,
      nome: nomeCiclo,
      nomeCompleto: formatarNomeCompletosCiclo(inicioCiclo, fimCiclo),
      temTransacoes: transacoesCiclo.length > 0
    });
    
    // Avançar para o próximo ciclo (próximo mês)
    cicloAtual = addMonths(cicloAtual, 1);
  }
  
  console.log("[ciclosFinanceiros] Total de ciclos gerados:", ciclos.length);
  console.log("[ciclosFinanceiros] Ciclos com transações:", ciclos.filter(c => c.temTransacoes).length);
  
  return ciclos;
};

// Função para obter o ciclo financeiro de um mês/ano específico
export const getCicloFinanceiro = (mes: number, ano: number, cycleStartDay: number = DEFAULT_CYCLE_START_DAY): CicloFinanceiroDetalhado => {
  const startDay = clampDay(cycleStartDay);
  const inicioCiclo = new Date(ano, mes - 2, startDay);
  const fimCiclo = new Date(ano, mes - 1, startDay - 1);

  return {
    inicio: inicioCiclo,
    fim: fimCiclo,
    nome: formatarNomeCiclo(inicioCiclo, fimCiclo),
    nomeCompleto: formatarNomeCompletosCiclo(inicioCiclo, fimCiclo),
    temTransacoes: false // Será atualizado quando filtrar transações
  };
};

// Função para formatar o nome do ciclo
const formatarNomeCiclo = (inicio: Date, fim: Date): string => {
  const mesInicio = format(inicio, 'MMM', { locale: ptBR });
  const mesFim = format(fim, 'MMM', { locale: ptBR });
  const anoInicio = inicio.getFullYear();
  const anoFim = fim.getFullYear();
  
  if (anoInicio === anoFim) {
    return `${mesInicio}/${mesFim} ${anoInicio}`;
  } else {
    return `${mesInicio} ${anoInicio}/${mesFim} ${anoFim}`;
  }
};

// Função para formatar o nome completo do ciclo
const formatarNomeCompletosCiclo = (inicio: Date, fim: Date): string => {
  const mesInicio = format(inicio, 'MMMM', { locale: ptBR });
  const mesFim = format(fim, 'MMMM', { locale: ptBR });
  const anoInicio = inicio.getFullYear();
  const anoFim = fim.getFullYear();
  
  if (anoInicio === anoFim) {
    return `${mesInicio}/${mesFim} de ${anoInicio}`;
  } else {
    return `${mesInicio} de ${anoInicio} / ${mesFim} de ${anoFim}`;
  }
};
