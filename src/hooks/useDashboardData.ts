
import { useMemo } from "react";
import { CicloFinanceiro, Transacao } from "@/types";
import { categorias as categoriasIniciais } from "@/utils/financas";
import { useParcelasFuturas } from "./useParcelasFuturas";

export function useDashboardData(
  transacoes: Transacao[],
  cicloAtual: CicloFinanceiro
) {
  // Verificar se há alguma transação
  const temTransacoes = useMemo(() => {
    return Array.isArray(transacoes) && transacoes.length > 0;
  }, [transacoes]);

  // Obter as parcelas futuras projetadas que caem dentro do ciclo atual
  const parcelasFuturas = useParcelasFuturas(transacoes, cicloAtual);

  // Filtragem de transações e parcelas futuras combinadas para o ciclo atual
  const transacoesFiltradas = useMemo(() => {
    console.log("[useDashboardData] Filtrando transações para ciclo:", cicloAtual.nome);
    console.log("[useDashboardData] Total de transações disponíveis:", transacoes.length);
    
    // Do not filter if there are no transactions
    if (!Array.isArray(transacoes) || transacoes.length === 0) {
      console.log("[useDashboardData] Não há transações para filtrar");
      return [];
    }
    
    // Garantir que estamos trabalhando com objetos Date válidos
    const inicio = new Date(cicloAtual.inicio);
    const fim = new Date(cicloAtual.fim);
    
    if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
      console.error("[useDashboardData] Datas de ciclo inválidas!");
      return transacoes; // Return all transactions if dates are invalid
    }
    
    inicio.setHours(0, 0, 0, 0);
    fim.setHours(23, 59, 59, 999);
    
    console.log(`[useDashboardData] Período do ciclo: ${inicio.toISOString()} até ${fim.toISOString()}`);
    
    // Filtrar transações reais do ciclo atual (não parcelas projetadas)
    const transacoesCicloAtual = transacoes.filter(t => {
      if (!t || !t.data) {
        console.error("[useDashboardData] Encontrada transação sem data ou inválida");
        return false;
      }
      
      if (t.isParcela) return false; // Ignorar parcelas projetadas nas transações originais
      
      // Certifique-se de que a data da transação é um objeto Date válido
      const dataTransacao = t.data instanceof Date ? t.data : new Date(t.data);
      
      if (isNaN(dataTransacao.getTime())) {
        console.error(`[useDashboardData] Data inválida para transação ${t.id}`);
        return true; // Include transactions with invalid dates rather than filtering them out
      }
      
      dataTransacao.setHours(0, 0, 0, 0);
      
      // A transação deve estar estritamente entre o início e fim do ciclo
      const estaNoCiclo = dataTransacao >= inicio && dataTransacao <= fim;
      
      // For debugging
      if (!estaNoCiclo) {
        console.log(`[useDashboardData] Transação ${t.id} (${dataTransacao.toISOString()}) está FORA do ciclo`);
      }
      
      return estaNoCiclo;
    });
    
    console.log(`[useDashboardData] Encontradas ${transacoesCicloAtual.length} transações reais no ciclo ${cicloAtual.nome}`);
    
    // TEMPORARILY FOR DEBUGGING: Return all transactions to verify they exist
    // return transacoes;
    
    // Combinar transações reais com parcelas futuras projetadas para este ciclo
    const todasTransacoes = [
      ...transacoesCicloAtual,
      ...parcelasFuturas
    ];
    
    console.log(`[useDashboardData] Total combinado para o ciclo ${cicloAtual.nome}: ${todasTransacoes.length} transações`);
    
    return todasTransacoes;
  }, [transacoes, parcelasFuturas, cicloAtual]);

  // Cálculo dos totais por categoria e totais gerais
  const totais = useMemo(() => {
    console.log(`[useDashboardData] Calculando totais para o ciclo ${cicloAtual.nome} com ${transacoesFiltradas.length} transações`);
    
    // Lista definitiva de categorias de receita
    const categoriasReceita = categoriasIniciais
      .filter(cat => cat.tipo === "receita")
      .map(cat => cat.nome);
    
    // Calcular totais para cada categoria usando APENAS transações do ciclo atual
    const categoriasAtualizadas = categoriasIniciais.map(cat => {
      // Filtrar transações desta categoria que pertencem ao ciclo atual
      const transacoesDaCategoria = transacoesFiltradas.filter(t => t.categoria === cat.nome);
      
      // Verificar explicitamente se é uma categoria de despesa ou receita
      const ehCategoriaReceita = cat.tipo === "receita";
      
      // Para todas as categorias, somamos os valores absolutos
      const valorTotal = transacoesDaCategoria.reduce((acc, t) => acc + Math.abs(t.valor), 0);
      
      return {
        ...cat,
        gastosAtuais: valorTotal
      };
    });
    
    // Log detalhado de cada transação para depuração
    if (transacoesFiltradas.length > 0) {
      console.log("[useDashboardData] Detalhamento das transações do ciclo:");
    }
    
    let totalReceitasCalculado = 0;
    let totalDespesasCalculado = 0;
    
    // Analisamos cada transação para classificá-la corretamente
    transacoesFiltradas.forEach(t => {
      const categoriaCorrespondente = categoriasIniciais.find(cat => cat.nome === t.categoria);
      const ehReceita = categoriaCorrespondente?.tipo === "receita";
      const valorAbs = Math.abs(t.valor);
      
      if (ehReceita) {
        totalReceitasCalculado += valorAbs;
        console.log(`[useDashboardData] RECEITA: ${t.id} - ${t.categoria} - ${valorAbs}`);
      } else {
        totalDespesasCalculado += valorAbs;
        console.log(`[useDashboardData] DESPESA: ${t.id} - ${t.categoria} - ${valorAbs}`);
      }
    });
    
    const saldo = totalReceitasCalculado - totalDespesasCalculado;
    
    console.log(`[useDashboardData] Total de receitas: ${totalReceitasCalculado}`);
    console.log(`[useDashboardData] Total de despesas: ${totalDespesasCalculado}`);
    console.log(`[useDashboardData] Saldo: ${saldo}`);
    
    return {
      categoriasAtualizadas,
      totalReceitas: totalReceitasCalculado,
      totalDespesas: totalDespesasCalculado,
      saldo
    };
  }, [transacoesFiltradas, cicloAtual]);

  return {
    transacoesFiltradas: transacoesFiltradas || [], // Ensure we always return an array
    temTransacoes,
    ...totais
  };
}
