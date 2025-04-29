
import { useMemo } from "react";
import { CicloFinanceiro, Transacao } from "@/types";
import { categorias } from "@/utils/financas";
import { useParcelasFuturas } from "./useParcelasFuturas";

export function useDashboardData(
  transacoes: Transacao[],
  cicloAtual: CicloFinanceiro
) {
  // Obter as parcelas futuras projetadas
  const parcelasFuturas = useParcelasFuturas(transacoes, cicloAtual);

  // Filtragem de transações e parcelas futuras combinadas
  const transacoesFiltradas = useMemo(() => {
    console.log("[Dashboard] Filtrando transações e parcelas para ciclo:", cicloAtual.nome);
    console.log("[Dashboard] Data início do ciclo:", cicloAtual.inicio instanceof Date ? cicloAtual.inicio.toISOString() : cicloAtual.inicio);
    console.log("[Dashboard] Data fim do ciclo:", cicloAtual.fim instanceof Date ? cicloAtual.fim.toISOString() : cicloAtual.fim);
    
    // Garantir que estamos trabalhando com objetos Date válidos
    const inicio = new Date(cicloAtual.inicio);
    const fim = new Date(cicloAtual.fim);
    
    if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
      console.error("[Dashboard] Datas de ciclo inválidas ao filtrar transações!");
      return [];
    }
    
    inicio.setHours(0, 0, 0, 0);
    fim.setHours(23, 59, 59, 999);
    
    // Filtrar transações do ciclo atual - estritamente no período
    const transacoesCicloAtual = transacoes.filter(t => {
      // Certifique-se de que a data da transação é um objeto Date válido
      const dataTransacao = new Date(t.data);
      
      if (isNaN(dataTransacao.getTime())) {
        console.error(`[Dashboard] Data inválida para transação ${t.id}`);
        return false;
      }
      
      dataTransacao.setHours(0, 0, 0, 0);
      
      // A transação deve estar estritamente entre o início e fim do ciclo
      const estaNoCiclo = dataTransacao >= inicio && dataTransacao <= fim;
      
      if (estaNoCiclo) {
        console.log(`[Dashboard] Transação ${t.id} (${t.descricao || t.categoria}) está no ciclo ${cicloAtual.nome}`);
      }
      
      return estaNoCiclo;
    });
    
    console.log(`[Dashboard] Encontradas ${transacoesCicloAtual.length} transações no ciclo ${cicloAtual.nome}`);
    
    // Filtrar parcelas futuras para este ciclo - apenas as que pertencem ao ciclo atual
    const parcelasFuturasCicloAtual = parcelasFuturas.filter(t => {
      const dataTransacao = new Date(t.data);
      
      if (isNaN(dataTransacao.getTime())) {
        console.error(`[Dashboard] Data inválida para parcela futura ${t.id}`);
        return false;
      }
      
      dataTransacao.setHours(0, 0, 0, 0);
      
      // A parcela deve estar estritamente entre o início e fim do ciclo
      const estaNoCiclo = dataTransacao >= inicio && dataTransacao <= fim;
      
      if (estaNoCiclo) {
        console.log(`[Dashboard] Parcela futura ${t.id} (${t.descricao}) está no ciclo ${cicloAtual.nome}`);
      }
      
      return estaNoCiclo;
    });
    
    console.log("[Dashboard] Transações do ciclo atual:", transacoesCicloAtual.length);
    console.log("[Dashboard] Parcelas futuras do ciclo atual:", parcelasFuturasCicloAtual.length);
    
    // Combinar transações reais e parcelas futuras para este ciclo
    const todasTransacoes = [
      ...transacoesCicloAtual,
      ...parcelasFuturasCicloAtual
    ];
    
    console.log(`[Dashboard] Total combinado de transações para o ciclo ${cicloAtual.nome}: ${todasTransacoes.length}`);
    
    return todasTransacoes;
  }, [transacoes, parcelasFuturas, cicloAtual]);

  // Cálculo dos totais por categoria e totais gerais - melhorado para incluir apenas transações do ciclo atual
  const totais = useMemo(() => {
    console.log(`[Dashboard] Calculando totais para o ciclo ${cicloAtual.nome} com ${transacoesFiltradas.length} transações`);
    
    // Calcular totais para cada categoria usando APENAS transações do ciclo atual
    const categoriasAtuais = categorias.map(cat => {
      // Filtrar transações desta categoria que pertencem ao ciclo atual
      const transacoesDaCategoria = transacoesFiltradas.filter(t => t.categoria === cat.nome);
      
      // Log para depuração
      console.log(`[Dashboard] Categoria ${cat.nome}: ${transacoesDaCategoria.length} transações no ciclo atual`);
      
      if (cat.tipo === "despesa") {
        // Para despesas, considerar apenas valores negativos que pertencem a este ciclo
        const gastosNaCategoria = transacoesDaCategoria
          .filter(t => t.valor < 0)
          .reduce((acc, t) => acc + Math.abs(t.valor), 0);
        
        console.log(`[Dashboard] Total de gastos na categoria ${cat.nome}: ${gastosNaCategoria}`);
        
        return {
          ...cat,
          gastosAtuais: gastosNaCategoria
        };
      } else {
        // Para categorias de receita, considerar apenas valores positivos que pertencem a este ciclo
        const receitasNaCategoria = transacoesDaCategoria
          .filter(t => t.valor > 0)
          .reduce((acc, t) => acc + t.valor, 0);
        
        console.log(`[Dashboard] Total de receitas na categoria ${cat.nome}: ${receitasNaCategoria}`);
        
        return {
          ...cat,
          gastosAtuais: receitasNaCategoria
        };
      }
    });
    
    // Calcular totais gerais para receitas e despesas APENAS com transações do ciclo atual
    const receitas = transacoesFiltradas
      .filter(t => t.valor > 0)
      .reduce((acc, t) => acc + t.valor, 0);
      
    const despesas = transacoesFiltradas
      .filter(t => t.valor < 0)
      .reduce((acc, t) => acc + Math.abs(t.valor), 0);
    
    console.log(`[Dashboard] Receitas: ${receitas}, Despesas: ${despesas}, Saldo: ${receitas - despesas}`);
    
    // Listar todas as transações para depuração
    console.log("[Dashboard] Listagem de todas as transações consideradas:");
    transacoesFiltradas.forEach(t => {
      const tipo = t.valor > 0 ? "RECEITA" : "DESPESA";
      console.log(`[Dashboard] ${tipo} - ${t.id} - ${t.descricao || t.categoria} - ${Math.abs(t.valor)} - Data: ${new Date(t.data).toISOString()}`);
    });
    
    return {
      categoriasAtualizadas: categoriasAtuais,
      totalReceitas: receitas,
      totalDespesas: despesas,
      saldo: receitas - despesas
    };
  }, [transacoesFiltradas, cicloAtual]);

  return {
    transacoesFiltradas,
    ...totais
  };
}
