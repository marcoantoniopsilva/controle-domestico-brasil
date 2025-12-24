
import { useMemo } from "react";
import { Transacao, CicloFinanceiro } from "@/types";
import { useCategoryBudgets } from "./useCategoryBudgets";
import {
  filtrarPorCiclo,
  filtrarPorTipo,
  somarTransacoes,
  calcularGastosPorCategoria
} from "@/utils/calculosFinanceiros";

export function useDashboardData(transacoes: Transacao[], cicloAtual: CicloFinanceiro) {
  const { getCategoriesWithCustomBudgets } = useCategoryBudgets();
  
  const dadosProcessados = useMemo(() => {
    // Obter categorias com orçamentos personalizados
    const categoriasComOrcamento = getCategoriesWithCustomBudgets();
    
    if (!cicloAtual || !transacoes) {
      return {
        transacoesFiltradas: [],
        categoriasAtualizadas: categoriasComOrcamento,
        totalReceitas: 0,
        totalDespesas: 0,
        totalInvestimentos: 0,
        saldo: 0
      };
    }

    console.log("[useDashboardData] Processando dados para ciclo:", cicloAtual.nome);
    console.log("[useDashboardData] Total de transações:", transacoes.length);

    // Filtrar transações do ciclo atual usando função centralizada
    const transacoesFiltradas = filtrarPorCiclo(transacoes, cicloAtual);

    // Incluir parcelas futuras no log
    transacoesFiltradas.forEach(t => {
      if (t.isParcela) {
        console.log("[useDashboardData] Incluindo parcela projetada:", t.id, "valor:", t.valor);
      }
    });

    console.log("[useDashboardData] Transações filtradas:", transacoesFiltradas.length);

    // Separar transações por tipo usando funções centralizadas
    const receitas = filtrarPorTipo(transacoesFiltradas, "receita");
    const despesas = filtrarPorTipo(transacoesFiltradas, "despesa");
    const investimentos = filtrarPorTipo(transacoesFiltradas, "investimento");

    console.log("[useDashboardData] Transações por tipo:", {
      receitas: receitas.length,
      despesas: despesas.length,
      investimentos: investimentos.length
    });

    // Calcular totais usando função centralizada (já usa Math.abs internamente)
    const totalReceitas = somarTransacoes(receitas);
    const totalDespesas = somarTransacoes(despesas);
    const totalInvestimentos = somarTransacoes(investimentos);

    // Saldo considerando receitas - despesas
    const saldo = totalReceitas - totalDespesas;

    // Atualizar categorias com gastos atuais usando função centralizada
    const categoriasAtualizadas = calcularGastosPorCategoria(transacoesFiltradas, categoriasComOrcamento);

    // Log para categorias importantes
    categoriasAtualizadas.forEach(cat => {
      if ((cat.gastosAtuais || 0) > 0 || cat.nome === "Supermercado" || cat.nome === "Casa" || cat.nome === "Despesas fixas no dinheiro") {
        console.log(`[useDashboardData] Categoria ${cat.nome} (${cat.tipo}): R$ ${cat.gastosAtuais} - Orçamento: R$ ${cat.orcamento}`);
      }
    });

    console.log("[useDashboardData] Totais calculados:", {
      receitas: totalReceitas,
      despesas: totalDespesas,
      investimentos: totalInvestimentos,
      saldo
    });

    return {
      transacoesFiltradas,
      categoriasAtualizadas,
      totalReceitas,
      totalDespesas,
      totalInvestimentos,
      saldo
    };
  }, [transacoes, cicloAtual, getCategoriesWithCustomBudgets]);

  return dadosProcessados;
}
