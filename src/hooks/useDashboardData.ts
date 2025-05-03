
import { useMemo } from "react";
import { CicloFinanceiro, Transacao } from "@/types";
import { categorias } from "@/utils/financas";
import { useParcelasFuturas } from "./useParcelasFuturas";

export function useDashboardData(
  transacoes: Transacao[],
  cicloAtual: CicloFinanceiro
) {
  // Obter as parcelas futuras projetadas que caem dentro do ciclo atual
  const parcelasFuturas = useParcelasFuturas(transacoes, cicloAtual);

  // Filtragem de transações e parcelas futuras combinadas para o ciclo atual
  const transacoesFiltradas = useMemo(() => {
    console.log("[useDashboardData] Filtrando transações para ciclo:", cicloAtual.nome);
    
    // Garantir que estamos trabalhando com objetos Date válidos
    const inicio = new Date(cicloAtual.inicio);
    const fim = new Date(cicloAtual.fim);
    
    if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
      console.error("[useDashboardData] Datas de ciclo inválidas!");
      return [];
    }
    
    inicio.setHours(0, 0, 0, 0);
    fim.setHours(23, 59, 59, 999);
    
    // Filtrar transações reais do ciclo atual (não parcelas projetadas)
    const transacoesCicloAtual = transacoes.filter(t => {
      if (t.isParcela) return false; // Ignorar parcelas projetadas nas transações originais
      
      // Certifique-se de que a data da transação é um objeto Date válido
      const dataTransacao = new Date(t.data);
      
      if (isNaN(dataTransacao.getTime())) {
        console.error(`[useDashboardData] Data inválida para transação ${t.id}`);
        return false;
      }
      
      dataTransacao.setHours(0, 0, 0, 0);
      
      // A transação deve estar estritamente entre o início e fim do ciclo
      const estaNoCiclo = dataTransacao >= inicio && dataTransacao <= fim;
      return estaNoCiclo;
    });
    
    console.log(`[useDashboardData] Encontradas ${transacoesCicloAtual.length} transações reais no ciclo ${cicloAtual.nome}`);
    
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
    const categoriasReceita = [
      "Salário", "13º", "⅓ de férias", "Restituição", 
      "Pagamento mamãe", "Receita Essence", "Outras receitas"
    ];
    
    // Calcular totais para cada categoria usando APENAS transações do ciclo atual
    const categoriasAtuais = categorias.map(cat => {
      // Filtrar transações desta categoria que pertencem ao ciclo atual
      const transacoesDaCategoria = transacoesFiltradas.filter(t => t.categoria === cat.nome);
      
      // Verificar explicitamente se é uma categoria de despesa ou receita
      const ehCategoriaReceita = categoriasReceita.includes(cat.nome);
      
      if (!ehCategoriaReceita) { // É uma categoria de despesa
        // Para despesas, somamos os valores absolutos (os valores são negativos)
        const gastosNaCategoria = transacoesDaCategoria.reduce((acc, t) => acc + Math.abs(t.valor), 0);
        
        return {
          ...cat,
          gastosAtuais: gastosNaCategoria
        };
      } else { // É uma categoria de receita
        // Para receitas, somamos os valores positivos
        const receitasNaCategoria = transacoesDaCategoria.reduce((acc, t) => acc + Math.abs(t.valor), 0);
        
        return {
          ...cat,
          gastosAtuais: receitasNaCategoria
        };
      }
    });
    
    // Log detalhado de cada transação para depuração
    console.log("[useDashboardData] Detalhamento das transações do ciclo:");
    
    let totalReceitasCalculado = 0;
    let totalDespesasCalculado = 0;
    
    // Analisamos cada transação para classificá-la corretamente
    transacoesFiltradas.forEach(t => {
      const ehReceita = categoriasReceita.includes(t.categoria);
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
      categoriasAtualizadas: categoriasAtuais,
      totalReceitas: totalReceitasCalculado,
      totalDespesas: totalDespesasCalculado,
      saldo: saldo
    };
  }, [transacoesFiltradas, cicloAtual]);

  return {
    transacoesFiltradas,
    ...totais
  };
}
