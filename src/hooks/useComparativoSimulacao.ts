import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { ComparativoCiclo, SimulacaoMes } from "@/types/simulacao";
import { getCicloFinanceiro } from "@/utils/ciclosFinanceiros";
import { 
  filtrarPorCiclo, 
  calcularTotalReceitas, 
  calcularTotalDespesas, 
  calcularTotalInvestimentos 
} from "@/utils/calculosFinanceiros";
import { Transacao } from "@/types";

const ANO_SIMULACAO = 2026;

export function useComparativoSimulacao(simulacao: SimulacaoMes[]) {
  const { usuario } = useAuth();
  const [comparativos, setComparativos] = useState<ComparativoCiclo[]>([]);
  const [loading, setLoading] = useState(true);

  // Verificar se um ciclo já está fechado (baseado na data atual)
  const cicloFechado = useCallback((mes: number, ano: number): boolean => {
    const hoje = new Date();
    const ciclo = getCicloFinanceiro(mes, ano);
    return hoje > ciclo.fim;
  }, []);

  // Carregar transações reais e calcular comparativos
  const carregarComparativos = useCallback(async () => {
    if (!usuario || simulacao.length === 0) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Buscar todas as transações de 2026
      const { data: transacoes, error } = await supabase
        .from('lancamentos')
        .select('*')
        .eq('usuario_id', usuario.id)
        .gte('data', `${ANO_SIMULACAO}-01-01`)
        .lte('data', `${ANO_SIMULACAO}-12-31`);

      if (error) {
        console.error('Erro ao carregar transações:', error);
        setLoading(false);
        return;
      }

      // Converter para tipo Transacao
      const transacoesFormatadas: Transacao[] = (transacoes || []).map(t => ({
        id: String(t.id),
        data: new Date(t.data),
        valor: Number(t.valor),
        categoria: t.categoria,
        tipo: t.tipo as "despesa" | "receita" | "investimento",
        descricao: t.descricao || "",
        parcelas: t.parcelas,
        quemGastou: t.quem_gastou as "Marco" | "Bruna",
        ganhos: t.ganhos ? Number(t.ganhos) : undefined
      }));

      // Calcular comparativos para cada mês
      const novosComparativos: ComparativoCiclo[] = [];

      for (let mes = 1; mes <= 12; mes++) {
        const estaFechado = cicloFechado(mes, ANO_SIMULACAO);
        
        // Dados previstos (da simulação)
        const mesSimulacao = simulacao.find(m => m.mes === mes);
        let totalReceitasPrevisto = 0;
        let totalDespesasPrevisto = 0;
        let totalInvestimentosPrevisto = 0;

        if (mesSimulacao) {
          mesSimulacao.categorias.forEach(cat => {
            if (cat.categoriaTipo === 'receita') {
              totalReceitasPrevisto += cat.valorPrevisto;
            } else if (cat.categoriaTipo === 'despesa') {
              totalDespesasPrevisto += cat.valorPrevisto;
            } else if (cat.categoriaTipo === 'investimento') {
              totalInvestimentosPrevisto += cat.valorPrevisto;
            }
          });
        }

        // Dados realizados (das transações reais)
        let totalReceitasRealizado = 0;
        let totalDespesasRealizado = 0;
        let totalInvestimentosRealizado = 0;

        if (estaFechado && transacoesFormatadas.length > 0) {
          const ciclo = getCicloFinanceiro(mes, ANO_SIMULACAO);
          const transacoesCiclo = filtrarPorCiclo(transacoesFormatadas, ciclo);
          
          totalReceitasRealizado = calcularTotalReceitas(transacoesCiclo);
          totalDespesasRealizado = calcularTotalDespesas(transacoesCiclo);
          totalInvestimentosRealizado = calcularTotalInvestimentos(transacoesCiclo);
        }

        const saldoPrevisto = totalReceitasPrevisto - totalDespesasPrevisto - totalInvestimentosPrevisto;
        const saldoRealizado = totalReceitasRealizado - totalDespesasRealizado - totalInvestimentosRealizado;

        novosComparativos.push({
          mes,
          ano: ANO_SIMULACAO,
          cicloFechado: estaFechado,
          totalReceitasPrevisto,
          totalDespesasPrevisto,
          totalInvestimentosPrevisto,
          totalReceitasRealizado,
          totalDespesasRealizado,
          totalInvestimentosRealizado,
          saldoPrevisto,
          saldoRealizado,
          diferenca: saldoRealizado - saldoPrevisto
        });
      }

      setComparativos(novosComparativos);
    } catch (error) {
      console.error('Erro ao carregar comparativos:', error);
    } finally {
      setLoading(false);
    }
  }, [usuario, simulacao, cicloFechado]);

  // Obter apenas ciclos fechados
  const ciclosFechados = comparativos.filter(c => c.cicloFechado);

  // Verificar se há algum ciclo fechado
  const temCiclosFechados = ciclosFechados.length > 0;

  useEffect(() => {
    carregarComparativos();
  }, [carregarComparativos]);

  return {
    comparativos,
    ciclosFechados,
    temCiclosFechados,
    loading,
    recarregar: carregarComparativos
  };
}
