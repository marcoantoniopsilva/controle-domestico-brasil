
import { format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Transacao } from "@/types";

export interface CicloFinanceiroDetalhado {
  inicio: Date;
  fim: Date;
  nome: string;
  nomeCompleto: string;
  temTransacoes: boolean;
}

// Função aprimorada para gerar ciclos financeiros com dados históricos
export const gerarCiclosFinanceiros = (transacoes: Transacao[]): CicloFinanceiroDetalhado[] => {
  const ciclos: CicloFinanceiroDetalhado[] = [];
  const hoje = new Date();
  
  console.log("[GraficoComparativo] Gerando ciclos históricos para", transacoes.length, "transações");
  
  // Sempre gerar os últimos 12 ciclos, independente das transações
  // Isso garante que sempre temos dados históricos para comparação
  for (let i = 11; i >= 0; i--) {
    const dataBase = subMonths(hoje, i);
    
    // Calcular o início do ciclo financeiro (dia 25 do mês anterior)
    const inicioCiclo = new Date(dataBase.getFullYear(), dataBase.getMonth() - 1, 25);
    
    // Calcular o fim do ciclo financeiro (dia 24 do mês atual)
    const fimCiclo = new Date(dataBase.getFullYear(), dataBase.getMonth(), 24);
    
    // Formatação do nome do ciclo
    const mesInicio = format(inicioCiclo, 'MMM', { locale: ptBR });
    const mesFim = format(fimCiclo, 'MMM', { locale: ptBR });
    const anoInicio = inicioCiclo.getFullYear();
    const anoFim = fimCiclo.getFullYear();
    
    const nomeCiclo = anoInicio === anoFim 
      ? `${mesInicio}/${mesFim} ${anoInicio}`
      : `${mesInicio} ${anoInicio}/${mesFim} ${anoFim}`;
    
    const nomeCicloCompleto = anoInicio === anoFim
      ? `${format(inicioCiclo, 'MMMM', { locale: ptBR })}/${format(fimCiclo, 'MMMM', { locale: ptBR })} de ${anoInicio}`
      : `${format(inicioCiclo, 'MMMM', { locale: ptBR })} de ${anoInicio} / ${format(fimCiclo, 'MMMM', { locale: ptBR })} de ${anoFim}`;
    
    // Verificar se este ciclo tem transações
    const transacoesCiclo = transacoes.filter(t => {
      const dataTransacao = new Date(t.data);
      return dataTransacao >= inicioCiclo && dataTransacao <= fimCiclo;
    });
    
    console.log(`[GraficoComparativo] Ciclo ${nomeCiclo}: ${transacoesCiclo.length} transações (${inicioCiclo.toDateString()} a ${fimCiclo.toDateString()})`);
    
    ciclos.push({
      inicio: new Date(inicioCiclo),
      fim: new Date(fimCiclo),
      nome: nomeCiclo,
      nomeCompleto: nomeCicloCompleto,
      temTransacoes: transacoesCiclo.length > 0
    });
  }
  
  console.log("[GraficoComparativo] Total de ciclos gerados:", ciclos.length);
  console.log("[GraficoComparativo] Ciclos com transações:", ciclos.filter(c => c.temTransacoes).length);
  
  return ciclos;
};
