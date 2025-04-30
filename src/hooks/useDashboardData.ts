
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
    
    // Filtrar transações reais do ciclo atual
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

  // Cálculo dos totais por categoria e totais gerais - foco em separar receitas e despesas corretamente
  const totais = useMemo(() => {
    console.log(`[Dashboard] Calculando totais para o ciclo ${cicloAtual.nome} com ${transacoesFiltradas.length} transações`);
    
    // Identificar explicitamente as categorias de receita para garantir a separação correta
    const categoriasReceita = [
      "Salário", 
      "13º", 
      "⅓ de férias", 
      "Restituição", 
      "Pagamento mamãe", 
      "Receita Essence", 
      "Outras receitas"
    ];
    
    // Calcular totais para cada categoria usando APENAS transações do ciclo atual
    const categoriasAtuais = categorias.map(cat => {
      // Filtrar transações desta categoria que pertencem ao ciclo atual
      const transacoesDaCategoria = transacoesFiltradas.filter(t => t.categoria === cat.nome);
      
      console.log(`[Dashboard] Categoria ${cat.nome} (tipo: ${cat.tipo}): ${transacoesDaCategoria.length} transações no ciclo atual`);
      
      // Verificar explicitamente se é uma categoria de despesa ou receita
      const ehCategoriaReceita = categoriasReceita.includes(cat.nome);
      
      if (!ehCategoriaReceita) { // É uma categoria de despesa
        // Para despesas, o valor é negativo
        const gastosNaCategoria = transacoesDaCategoria
          .filter(t => t.valor < 0)
          .reduce((acc, t) => acc + Math.abs(t.valor), 0);
        
        console.log(`[Dashboard] Total de gastos na categoria ${cat.nome}: ${gastosNaCategoria}`);
        
        return {
          ...cat,
          gastosAtuais: gastosNaCategoria
        };
      } else { // É uma categoria de receita
        // Para receitas, o valor é positivo
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
    // Adicionando mais logs para depuração
    console.log("[Dashboard] Calculando totais de receitas e despesas:");
    
    let totalReceitasCalculado = 0;
    let totalDespesasCalculado = 0;
    
    // Listamos todas as transações para depuração detalhada
    transacoesFiltradas.forEach(t => {
      const dataFormatada = t.data instanceof Date ? t.data.toISOString() : new Date(t.data).toISOString();
      const valorAbs = Math.abs(t.valor);
      const ehReceita = categoriasReceita.includes(t.categoria);
      
      // Verificamos explicitamente o tipo da transação baseado na categoria
      if (ehReceita) {
        if (t.valor > 0) {
          totalReceitasCalculado += t.valor;
          console.log(`[Dashboard] RECEITA: ${t.id} - ${t.categoria} - ${t.valor} - ${dataFormatada}`);
        } else {
          console.warn(`[Dashboard] ALERTA: Transação em categoria de receita com valor negativo: ${t.id} - ${t.categoria} - ${t.valor}`);
        }
      } else {
        if (t.valor < 0) {
          totalDespesasCalculado += valorAbs;
          console.log(`[Dashboard] DESPESA: ${t.id} - ${t.categoria} - ${valorAbs} - ${dataFormatada}`);
        } else {
          console.warn(`[Dashboard] ALERTA: Transação em categoria de despesa com valor positivo: ${t.id} - ${t.categoria} - ${t.valor}`);
        }
      }
    });
    
    console.log(`[Dashboard] Total de receitas calculado: ${totalReceitasCalculado}`);
    console.log(`[Dashboard] Total de despesas calculado: ${totalDespesasCalculado}`);
    console.log(`[Dashboard] Saldo calculado: ${totalReceitasCalculado - totalDespesasCalculado}`);
    
    return {
      categoriasAtualizadas: categoriasAtuais,
      totalReceitas: totalReceitasCalculado,
      totalDespesas: totalDespesasCalculado,
      saldo: totalReceitasCalculado - totalDespesasCalculado
    };
  }, [transacoesFiltradas, cicloAtual]);

  return {
    transacoesFiltradas,
    ...totais
  };
}
