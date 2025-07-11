
import { useMemo } from "react";
import { Transacao, Categoria, CicloFinanceiro } from "@/types";
import { categorias as categoriasIniciais } from "@/utils/financas";

export function useDashboardData(transacoes: Transacao[], cicloAtual: CicloFinanceiro) {
  const dadosProcessados = useMemo(() => {
    if (!cicloAtual || !transacoes) {
      return {
        transacoesFiltradas: [],
        categoriasAtualizadas: categoriasIniciais,
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

    // Filtrar transações do ciclo atual
    const transacoesFiltradas = transacoes.filter(t => {
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
      
      return estaNoCiclo;
    });

    console.log("[useDashboardData] Transações filtradas:", transacoesFiltradas.length);

    // Calcular totais por tipo
    const totalReceitas = transacoesFiltradas
      .filter(t => t.tipo === "receita")
      .reduce((acc, t) => acc + Math.abs(t.valor), 0);

    const totalDespesas = transacoesFiltradas
      .filter(t => t.tipo === "despesa")
      .reduce((acc, t) => acc + Math.abs(t.valor), 0);

    const totalInvestimentos = transacoesFiltradas
      .filter(t => t.tipo === "investimento")
      .reduce((acc, t) => acc + Math.abs(t.valor), 0);

    // Saldo considerando receitas - despesas (investimentos não afetam o saldo diretamente)
    const saldo = totalReceitas - totalDespesas;

    // Atualizar categorias com gastos atuais
    const categoriasAtualizadas = categoriasIniciais.map(categoria => {
      const transacoesDaCategoria = transacoesFiltradas.filter(t => t.categoria === categoria.nome);
      const gastosAtuais = transacoesDaCategoria.reduce((acc, t) => acc + Math.abs(t.valor), 0);
      
      return {
        ...categoria,
        gastosAtuais
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
  }, [transacoes, cicloAtual]);

  return dadosProcessados;
}
