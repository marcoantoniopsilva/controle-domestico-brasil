
import { useMemo } from "react";
import { Transacao, CicloFinanceiro } from "@/types";

export const useTransactionsByCategory = (
  transacoes: Transacao[],
  cicloAtual: CicloFinanceiro
) => {
  const getTransactionsForCategory = useMemo(() => {
    return (categoria: string): Transacao[] => {
      console.log(`[useTransactionsByCategory] Buscando transações para ${categoria} no ciclo ${cicloAtual.nome}`);
      
      // Garantir que estamos trabalhando com objetos Date válidos
      const inicio = new Date(cicloAtual.inicio);
      const fim = new Date(cicloAtual.fim);
      
      inicio.setHours(0, 0, 0, 0);
      fim.setHours(23, 59, 59, 999);
      
      console.log(`[useTransactionsByCategory] Período do ciclo: ${inicio.toISOString()} até ${fim.toISOString()}`);
      
      // Filtrar transações da categoria no período do ciclo
      const transacoesFiltradas = transacoes.filter(t => {
        if (!t || !t.data) {
          console.error("[useTransactionsByCategory] Transação sem data ou inválida");
          return false;
        }
        
        if (t.categoria !== categoria) return false;
        
        // Certifique-se de que a data da transação é um objeto Date válido
        const dataTransacao = t.data instanceof Date ? t.data : new Date(t.data);
        
        if (isNaN(dataTransacao.getTime())) {
          console.error(`[useTransactionsByCategory] Data inválida para transação ${t.id}`);
          return true; // Include transactions with invalid dates rather than filtering them out
        }
        
        dataTransacao.setHours(0, 0, 0, 0);
        
        // A transação deve estar estritamente entre o início e fim do ciclo
        const estaNoCiclo = dataTransacao >= inicio && dataTransacao <= fim;
        
        if (estaNoCiclo) {
          console.log(`[useTransactionsByCategory] ✅ Transação ${t.id} incluída para ${categoria} no ciclo ${cicloAtual.nome}`);
        }
        
        return estaNoCiclo;
      });
      
      console.log(`[useTransactionsByCategory] Encontradas ${transacoesFiltradas.length} transações para ${categoria} no ciclo ${cicloAtual.nome}`);
      
      return transacoesFiltradas;
    };
  }, [transacoes, cicloAtual]);
  
  return { getTransactionsForCategory };
};
