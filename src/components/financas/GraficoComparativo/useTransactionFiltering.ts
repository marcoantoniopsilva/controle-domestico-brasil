
import { useMemo } from "react";
import { Transacao } from "@/types";
import { gerarCiclosFinanceiros } from "@/utils/ciclosFinanceiros";

export const useTransactionFiltering = (transacoes: Transacao[]) => {
  const getTransactionsForCategoryAndCycle = useMemo(() => {
    return (categoria: string, cicloNome: string): Transacao[] => {
      console.log(`[TransactionFiltering] Buscando transações para ${categoria} no ciclo ${cicloNome}`);
      
      // Filtrar apenas transações de despesa
      const transacoesDespesa = transacoes.filter(t => t.tipo === "despesa");
      
      // Gerar ciclos para encontrar o período correto
      const ciclos = gerarCiclosFinanceiros(transacoesDespesa);
      const ciclo = ciclos.find(c => c.nome === cicloNome);
      
      if (!ciclo) {
        console.warn(`[TransactionFiltering] Ciclo ${cicloNome} não encontrado`);
        return [];
      }
      
      // Garantir que estamos trabalhando com objetos Date válidos
      const inicio = new Date(ciclo.inicio);
      const fim = new Date(ciclo.fim);
      
      inicio.setHours(0, 0, 0, 0);
      fim.setHours(23, 59, 59, 999);
      
      console.log(`[TransactionFiltering] Período do ciclo ${cicloNome}: ${inicio.toISOString()} até ${fim.toISOString()}`);
      
      // Filtrar transações da categoria no período do ciclo
      const transacoesFiltradas = transacoesDespesa.filter(t => {
        if (!t || !t.data) {
          console.error("[TransactionFiltering] Transação sem data ou inválida");
          return false;
        }
        
        if (t.categoria !== categoria) return false;
        if (t.isParcela) return false; // Ignorar parcelas projetadas nas transações originais
        
        // Certifique-se de que a data da transação é um objeto Date válido
        const dataTransacao = t.data instanceof Date ? t.data : new Date(t.data);
        
        if (isNaN(dataTransacao.getTime())) {
          console.error(`[TransactionFiltering] Data inválida para transação ${t.id}`);
          return true; // Include transactions with invalid dates rather than filtering them out
        }
        
        dataTransacao.setHours(0, 0, 0, 0);
        
        // A transação deve estar estritamente entre o início e fim do ciclo
        const estaNoCiclo = dataTransacao >= inicio && dataTransacao <= fim;
        
        if (estaNoCiclo) {
          console.log(`[TransactionFiltering] ✅ Transação ${t.id} incluída para ${categoria} no ciclo ${cicloNome}`);
        }
        
        return estaNoCiclo;
      });
      
      console.log(`[TransactionFiltering] Encontradas ${transacoesFiltradas.length} transações para ${categoria} no ciclo ${cicloNome}`);
      
      return transacoesFiltradas;
    };
  }, [transacoes]);
  
  return { getTransactionsForCategoryAndCycle };
};
