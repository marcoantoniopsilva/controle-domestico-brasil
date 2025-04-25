
import { useMemo } from "react";
import { Transacao, CicloFinanceiro } from "@/types";

export function useParcelasFuturas(transacoes: Transacao[], cicloAtual: CicloFinanceiro) {
  // Função para gerar projeções de parcelas futuras
  const parcelasFuturas = useMemo(() => {
    // Filtra apenas transações parceladas (parcelas > 1)
    const transacoesParceladas = transacoes.filter(t => t.parcelas > 1);
    
    // Se não tiver transações parceladas, retorna array vazio
    if (transacoesParceladas.length === 0) {
      return [];
    }

    console.log(`Gerando parcelas futuras para ${transacoesParceladas.length} transações parceladas`);
    
    const todasParcelas: Transacao[] = [];
    
    // Para cada transação parcelada, projeta as parcelas futuras
    transacoesParceladas.forEach(transacao => {
      // Data da transação original
      const dataTransacao = new Date(transacao.data);
      
      console.log(`Gerando parcelas para transação: ${transacao.descricao || transacao.categoria}`, 
                  `ID: ${transacao.id}`,
                  `Data: ${dataTransacao.toISOString()}`,
                  `Total parcelas: ${transacao.parcelas}`);
      
      // Gera as parcelas para todos os meses além do primeiro (que já está na lista de transações)
      for (let i = 2; i <= transacao.parcelas; i++) {
        // Calcula a data da parcela (um mês adicional por parcela)
        const dataParcela = new Date(dataTransacao);
        dataParcela.setMonth(dataTransacao.getMonth() + (i - 1));
        
        // Ajusta o dia se necessário para evitar problemas com meses com diferentes números de dias
        // Por exemplo, se a data original é 31/01, a próxima parcela será 28/02 em anos não bissextos
        const ultimoDiaDoMes = new Date(
          dataParcela.getFullYear(),
          dataParcela.getMonth() + 1,
          0
        ).getDate();
        
        if (dataParcela.getDate() > ultimoDiaDoMes) {
          dataParcela.setDate(ultimoDiaDoMes);
        }
        
        // Criamos um novo objeto para a parcela futura
        const parcela: Transacao = {
          ...transacao,
          id: `projecao-${transacao.id}-parcela-${i}`,
          data: dataParcela,
          descricao: `${transacao.descricao || transacao.categoria} (Parcela ${i}/${transacao.parcelas})`,
          isParcela: true, // Marca como uma parcela projetada
          parcelaAtual: i
        };
        
        console.log(`Gerada parcela ${i}/${transacao.parcelas} para data: ${dataParcela.toISOString()}`);
        todasParcelas.push(parcela);
      }
    });
    
    console.log("Parcelas futuras geradas:", todasParcelas.length);
    todasParcelas.forEach((parcela, index) => {
      if (index < 10) { // Limitar a 10 para não sobrecarregar o console
        console.log(`Parcela ${index}: ${parcela.descricao}, data: ${new Date(parcela.data).toISOString()}`);
      }
    });
    
    return todasParcelas;
  }, [transacoes]);
  
  return parcelasFuturas;
}
