
import { useMemo } from "react";
import { Transacao, Categoria, CicloFinanceiro } from "@/types";
import { categorias as categoriasIniciais } from "@/utils/financas";
import { useCategoryBudgets } from "./useCategoryBudgets";

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

    // Garantir que estamos trabalhando com objetos Date válidos
    const inicio = new Date(cicloAtual.inicio);
    const fim = new Date(cicloAtual.fim);
    
    inicio.setHours(0, 0, 0, 0);
    fim.setHours(23, 59, 59, 999);

    console.log("[useDashboardData] Período do ciclo:", inicio.toDateString(), "até", fim.toDateString());

    // Filtrar transações do ciclo atual com logs detalhados
    const transacoesFiltradas = transacoes.filter(t => {
      if (!t || !t.data) {
        console.error("[useDashboardData] Encontrada transação sem data ou inválida:", t);
        return false;
      }
      
      // Incluir parcelas futuras no cálculo dos gastos
      if (t.isParcela) {
        console.log("[useDashboardData] Incluindo parcela projetada:", t.id, "valor:", t.valor);
      }
      
      // Certifique-se de que a data da transação é um objeto Date válido
      const dataTransacao = t.data instanceof Date ? t.data : new Date(t.data);
      
      if (isNaN(dataTransacao.getTime())) {
        console.error(`[useDashboardData] Data inválida para transação ${t.id}:`, t.data);
        return false; // Excluir transações com datas inválidas
      }
      
      dataTransacao.setHours(0, 0, 0, 0);
      
      // A transação deve estar estritamente entre o início e fim do ciclo
      const estaNoCiclo = dataTransacao >= inicio && dataTransacao <= fim;
      
      if (estaNoCiclo) {
        console.log(`[useDashboardData] ✅ Transação ${t.id} incluída: ${dataTransacao.toDateString()}, categoria: ${t.categoria}, valor: ${t.valor}, tipo: ${t.tipo}`);
      }
      
      return estaNoCiclo;
    });

    console.log("[useDashboardData] Transações filtradas:", transacoesFiltradas.length);

    // Debug: Log das transações filtradas por tipo
    const transacoesPorTipo = {
      receita: transacoesFiltradas.filter(t => t.tipo === "receita"),
      despesa: transacoesFiltradas.filter(t => t.tipo === "despesa"),
      investimento: transacoesFiltradas.filter(t => t.tipo === "investimento")
    };

    console.log("[useDashboardData] Transações por tipo:", {
      receitas: transacoesPorTipo.receita.length,
      despesas: transacoesPorTipo.despesa.length,
      investimentos: transacoesPorTipo.investimento.length
    });

    // Calcular totais por tipo com logs detalhados
    const totalReceitas = transacoesPorTipo.receita.reduce((acc, t) => {
      const valor = Math.abs(t.valor);
      console.log(`[useDashboardData] Receita: ${t.categoria} = R$ ${valor}`);
      return acc + valor;
    }, 0);

    const totalDespesas = transacoesPorTipo.despesa.reduce((acc, t) => {
      const valor = Math.abs(t.valor);
      console.log(`[useDashboardData] Despesa: ${t.categoria} = R$ ${valor}`);
      return acc + valor;
    }, 0);

    const totalInvestimentos = transacoesPorTipo.investimento.reduce((acc, t) => {
      const valor = Math.abs(t.valor);
      const ganhos = t.ganhos || 0;
      console.log(`[useDashboardData] Investimento: ${t.categoria} = R$ ${valor}, ganhos: R$ ${ganhos}`);
      return acc + valor;
    }, 0);

    // Saldo considerando receitas - despesas (investimentos não afetam o saldo diretamente)
    const saldo = totalReceitas - totalDespesas;

    // Atualizar categorias com gastos atuais - usando filtragem mais rigorosa
    const categoriasAtualizadas = categoriasComOrcamento.map(categoria => {
      const transacoesDaCategoria = transacoesFiltradas.filter(t => {
        const mesmaCategoria = t.categoria === categoria.nome;
        const mesmoTipo = t.tipo === categoria.tipo;
        const match = mesmaCategoria && mesmoTipo;
        
        // Log detalhado para debug
        if (categoria.nome === "Supermercado" || categoria.nome === "Casa" || categoria.nome === "Despesas fixas no dinheiro") {
          console.log(`[useDashboardData] Verificando categoria ${categoria.nome}:`);
          console.log(`  - Transação: ${t.categoria} (${t.tipo}) = R$ ${t.valor}`);
          console.log(`  - Match: ${match} (categoria: ${mesmaCategoria}, tipo: ${mesmoTipo})`);
        }
        
        return match;
      });
      
      const gastosAtuais = transacoesDaCategoria.reduce((acc, t) => acc + Math.abs(t.valor), 0);
      
      // Log para todas as categorias com gastos
      if (gastosAtuais > 0 || categoria.nome === "Supermercado" || categoria.nome === "Casa" || categoria.nome === "Despesas fixas no dinheiro") {
        console.log(`[useDashboardData] Categoria ${categoria.nome} (${categoria.tipo}): R$ ${gastosAtuais} (${transacoesDaCategoria.length} transações)`);
        console.log(`[useDashboardData] Orçamento da categoria ${categoria.nome}: R$ ${categoria.orcamento}`);
      }
      
      return {
        ...categoria,
        gastosAtuais: gastosAtuais || 0
      };
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
