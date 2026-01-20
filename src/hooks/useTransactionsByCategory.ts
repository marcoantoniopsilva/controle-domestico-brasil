import { useMemo } from "react";
import { Transacao, CicloFinanceiro } from "@/types";

export const useTransactionsByCategory = (
  transacoes: Transacao[],
  cicloAtual: CicloFinanceiro
) => {
  // Gera parcelas futuras das transações parceladas que caem no ciclo atual
  const transacoesComParcelas = useMemo(() => {
    const ciclo = {
      inicio: new Date(cicloAtual.inicio),
      fim: new Date(cicloAtual.fim),
      nome: cicloAtual.nome
    };
    
    ciclo.inicio.setHours(0, 0, 0, 0);
    ciclo.fim.setHours(23, 59, 59, 999);
    
    // Começamos com as transações originais que estão no ciclo
    const transacoesNoCiclo: Transacao[] = [];
    const parcelasFuturas: Transacao[] = [];
    
    transacoes.forEach(transacao => {
      if (!transacao || !transacao.data) return;
      
      const dataTransacao = transacao.data instanceof Date 
        ? new Date(transacao.data) 
        : new Date(transacao.data);
      
      if (isNaN(dataTransacao.getTime())) return;
      
      dataTransacao.setHours(0, 0, 0, 0);
      
      // Verifica se a transação original está no ciclo
      const originalEstaNoCiclo = dataTransacao >= ciclo.inicio && dataTransacao <= ciclo.fim;
      
      if (originalEstaNoCiclo && !transacao.isParcela) {
        transacoesNoCiclo.push(transacao);
      }
      
      // Se for parcelada, gera as parcelas futuras que caem no ciclo atual
      if (transacao.parcelas > 1 && !transacao.isParcela) {
        for (let i = 2; i <= transacao.parcelas; i++) {
          const dataParcela = new Date(dataTransacao);
          dataParcela.setMonth(dataTransacao.getMonth() + (i - 1));
          
          // Ajusta o dia se necessário para meses com diferentes números de dias
          const ultimoDiaDoMes = new Date(
            dataParcela.getFullYear(),
            dataParcela.getMonth() + 1,
            0
          ).getDate();
          
          if (dataParcela.getDate() > ultimoDiaDoMes) {
            dataParcela.setDate(ultimoDiaDoMes);
          }
          
          dataParcela.setHours(0, 0, 0, 0);
          
          // Verifica se esta parcela está no ciclo atual
          const parcelaEstaNoCiclo = dataParcela >= ciclo.inicio && dataParcela <= ciclo.fim;
          
          if (parcelaEstaNoCiclo) {
            const parcela: Transacao = {
              ...transacao,
              id: `projecao-${transacao.id}-parcela-${i}`,
              data: dataParcela,
              descricao: `${transacao.descricao || transacao.categoria} (Parcela ${i}/${transacao.parcelas})`,
              isParcela: true,
              parcelaAtual: i
            };
            parcelasFuturas.push(parcela);
          }
        }
      }
    });
    
    // Inclui também as parcelas que já vêm marcadas como isParcela (do useParcelasFuturas)
    const parcelasExistentes = transacoes.filter(t => {
      if (!t.isParcela) return false;
      
      const dataTransacao = t.data instanceof Date 
        ? new Date(t.data) 
        : new Date(t.data);
      
      if (isNaN(dataTransacao.getTime())) return false;
      
      dataTransacao.setHours(0, 0, 0, 0);
      return dataTransacao >= ciclo.inicio && dataTransacao <= ciclo.fim;
    });
    
    // Combina tudo, evitando duplicatas
    const idsExistentes = new Set([
      ...transacoesNoCiclo.map(t => t.id),
      ...parcelasExistentes.map(t => t.id)
    ]);
    
    const parcelasNovas = parcelasFuturas.filter(p => !idsExistentes.has(p.id));
    
    return [...transacoesNoCiclo, ...parcelasExistentes, ...parcelasNovas];
  }, [transacoes, cicloAtual]);

  const getTransactionsForCategory = useMemo(() => {
    return (categoria: string): Transacao[] => {
      console.log(`[useTransactionsByCategory] Buscando transações para ${categoria} no ciclo ${cicloAtual.nome}`);
      
      // Filtra por categoria
      const transacoesFiltradas = transacoesComParcelas.filter(t => {
        if (!t || t.categoria !== categoria) return false;
        return true;
      });
      
      console.log(`[useTransactionsByCategory] Encontradas ${transacoesFiltradas.length} transações (incluindo parcelas) para ${categoria} no ciclo ${cicloAtual.nome}`);
      
      return transacoesFiltradas;
    };
  }, [transacoesComParcelas, cicloAtual]);
  
  return { getTransactionsForCategory };
};
