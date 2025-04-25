
import { useMemo } from "react";
import { Transacao, CicloFinanceiro } from "@/types";
import { dataEstaNoCiclo } from "@/utils/financas";

export function useParcelasFuturas(transacoes: Transacao[], cicloAtual: CicloFinanceiro) {
  // Função para gerar projeções de parcelas futuras
  const parcelasFuturas = useMemo(() => {
    // Filtra apenas transações parceladas (parcelas > 1)
    const transacoesParceladas = transacoes.filter(t => t.parcelas > 1);
    
    // Se não tiver transações parceladas, retorna array vazio
    if (transacoesParceladas.length === 0) {
      return [];
    }

    const todasParcelas: Transacao[] = [];
    
    // Para cada transação parcelada, projeta as parcelas futuras
    transacoesParceladas.forEach(transacao => {
      // Verifica se a data da transação está no ciclo atual
      const dataTransacao = new Date(transacao.data);
      const estaNoCicloAtual = dataEstaNoCiclo(dataTransacao, cicloAtual);
      
      // Se estiver no ciclo atual, calcula quais parcelas já foram criadas
      let parcelaInicial = 1;
      
      if (estaNoCicloAtual) {
        // No ciclo atual, só projetamos parcelas futuras
        parcelaInicial = 2;
      }
      
      // Gera as parcelas futuras
      for (let i = parcelaInicial; i <= transacao.parcelas; i++) {
        // Calcula a data da parcela (um mês adicional por parcela)
        const dataParcela = new Date(dataTransacao);
        dataParcela.setMonth(dataParcela.getMonth() + (i - 1));
        
        // Não incluímos parcelas do ciclo atual que já estão nos lançamentos
        if (i === 1 && estaNoCicloAtual) continue;
        
        // Criamos um novo objeto para a parcela futura
        const parcela: Transacao = {
          ...transacao,
          id: `projecao-${transacao.id}-parcela-${i}`,
          data: dataParcela,
          descricao: `${transacao.descricao || ''} (Parcela ${i}/${transacao.parcelas})`,
          isParcela: true, // Marca como uma parcela projetada
          parcelaAtual: i
        };
        
        todasParcelas.push(parcela);
      }
    });
    
    return todasParcelas;
  }, [transacoes, cicloAtual]);
  
  return parcelasFuturas;
}
