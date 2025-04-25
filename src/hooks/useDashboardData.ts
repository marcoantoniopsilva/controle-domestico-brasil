
import { useState, useMemo } from "react";
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
    
    // Verificar cuidadosamente a data de todas as transações
    console.log("[Dashboard] Verificando datas de todas as transações:");
    transacoes.forEach((t, idx) => {
      if (idx < 10) {
        const dataTransacao = new Date(t.data);
        console.log(`[Dashboard] Transação ${t.id} data: ${dataTransacao.toISOString()}, válida: ${!isNaN(dataTransacao.getTime())}`);
      }
    });
    
    // Filtrar transações do ciclo atual
    const transacoesCicloAtual = transacoes.filter(t => {
      const dataTransacao = new Date(t.data);
      
      if (isNaN(dataTransacao.getTime())) {
        console.error(`[Dashboard] Data inválida para transação ${t.id}`);
        return false;
      }
      
      dataTransacao.setHours(0, 0, 0, 0);
      
      const estaNoCiclo = dataTransacao >= inicio && dataTransacao <= fim;
      
      if (estaNoCiclo) {
        console.log(`[Dashboard] Transação ${t.id} (${t.descricao || t.categoria}) está no ciclo ${cicloAtual.nome}`);
      }
      
      return estaNoCiclo;
    });
    
    console.log(`[Dashboard] Encontradas ${transacoesCicloAtual.length} transações no ciclo ${cicloAtual.nome}`);
    
    // Verificar se o ciclo é março-abril 2025
    if (inicio.getFullYear() === 2025 && inicio.getMonth() === 2 && inicio.getDate() === 25) {
      console.log("[Dashboard] CICLO ESPECIAL MARÇO-ABRIL 2025 DETECTADO!");
      console.log("[Dashboard] Início:", inicio.toISOString());
      console.log("[Dashboard] Fim:", fim.toISOString());
      
      // Verificar se alguma transação é desse período
      const temTransacoes = transacoes.some(t => {
        const dataT = new Date(t.data);
        dataT.setHours(0, 0, 0, 0);
        return dataT >= inicio && dataT <= fim;
      });
      
      console.log("[Dashboard] Tem transações para março-abril 2025:", temTransacoes);
    }
    
    // Filtrar parcelas futuras para este ciclo
    const parcelasFuturasCicloAtual = parcelasFuturas.filter(t => {
      const dataTransacao = new Date(t.data);
      
      if (isNaN(dataTransacao.getTime())) {
        console.error(`[Dashboard] Data inválida para parcela futura ${t.id}`);
        return false;
      }
      
      dataTransacao.setHours(0, 0, 0, 0);
      
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
    ].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    
    console.log(`[Dashboard] Total combinado de transações para o ciclo ${cicloAtual.nome}: ${todasTransacoes.length}`);
    
    return todasTransacoes;
  }, [transacoes, parcelasFuturas, cicloAtual]);

  // Cálculo dos totais por categoria e totais gerais
  const totais = useMemo(() => {
    console.log(`[Dashboard] Calculando totais para o ciclo ${cicloAtual.nome} com ${transacoesFiltradas.length} transações`);
    
    // Calcular totais para cada categoria
    const categoriasAtuais = categorias.map(cat => {
      const gastosNaCategoria = transacoesFiltradas
        .filter(t => t.categoria === cat.nome && t.valor < 0)
        .reduce((acc, t) => acc + Math.abs(t.valor), 0);
      
      return {
        ...cat,
        gastosAtuais: gastosNaCategoria
      };
    });
    
    const receitas = transacoesFiltradas
      .filter(t => t.valor > 0)
      .reduce((acc, t) => acc + t.valor, 0);
      
    const despesas = transacoesFiltradas
      .filter(t => t.valor < 0)
      .reduce((acc, t) => acc + Math.abs(t.valor), 0);
    
    console.log(`[Dashboard] Receitas: ${receitas}, Despesas: ${despesas}, Saldo: ${receitas - despesas}`);
    
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
