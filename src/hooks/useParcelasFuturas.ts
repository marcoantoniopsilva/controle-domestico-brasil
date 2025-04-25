
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
      // Data da transação original
      const dataTransacao = new Date(transacao.data);
      
      // Verifica se a primeira parcela está no ciclo atual
      const primeiraParcelaNoCicloAtual = dataEstaNoCiclo(dataTransacao, cicloAtual);
      
      // Gera as parcelas para todos os meses além do primeiro (que já está na lista de transações)
      for (let i = 2; i <= transacao.parcelas; i++) {
        // Calcula a data da parcela (um mês adicional por parcela)
        const dataParcela = new Date(dataTransacao);
        dataParcela.setMonth(dataTransacao.getMonth() + (i - 1));
        
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
    
    console.log("Parcelas futuras geradas:", todasParcelas.length);
    return todasParcelas;
  }, [transacoes, cicloAtual]);
  
  return parcelasFuturas;
}
