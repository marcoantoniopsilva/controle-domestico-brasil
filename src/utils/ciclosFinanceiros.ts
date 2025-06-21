
import { format, subMonths, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Transacao } from "@/types";

export interface CicloFinanceiroDetalhado {
  inicio: Date;
  fim: Date;
  nome: string;
  nomeCompleto: string;
  temTransacoes: boolean;
}

// Função para calcular o início do ciclo financeiro baseado em uma data
const calcularInicioCiclo = (data: Date): Date => {
  const ano = data.getFullYear();
  const mes = data.getMonth();
  
  // Se estamos antes do dia 25, o ciclo atual começou no dia 25 do mês anterior
  if (data.getDate() < 25) {
    return new Date(ano, mes - 1, 25);
  } else {
    // Se estamos no dia 25 ou depois, o ciclo atual começou no dia 25 deste mês
    return new Date(ano, mes, 25);
  }
};

// Função para calcular o fim do ciclo financeiro baseado no início
const calcularFimCiclo = (inicioCiclo: Date): Date => {
  const fimCiclo = new Date(inicioCiclo);
  fimCiclo.setMonth(fimCiclo.getMonth() + 1);
  fimCiclo.setDate(24);
  return fimCiclo;
};

// Função aprimorada para gerar ciclos financeiros que detecta TODOS os ciclos com dados
export const gerarCiclosFinanceiros = (transacoes: Transacao[]): CicloFinanceiroDetalhado[] => {
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
  let cicloAtual = calcularInicioCiclo(inicioGeracao);
  
  while (cicloAtual <= fimGeracao) {
    const inicioCiclo = new Date(cicloAtual);
    const fimCiclo = calcularFimCiclo(inicioCiclo);
    
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
