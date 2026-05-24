import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Transacao, CicloFinanceiro, Categoria } from "@/types";
import { filtrarPorCiclo, filtrarPorTipo, somarTransacoes, calcularGastosPorCategoria } from "@/utils/calculosFinanceiros";
import { addMonths } from "date-fns";

export interface DashboardInsight {
  emoji: string;
  texto: string;
  tipo: "positivo" | "negativo" | "dica";
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

interface CachedInsights {
  insights: DashboardInsight[];
  timestamp: number;
}

export function useDashboardInsights(
  transacoes: Transacao[],
  cicloAtual: CicloFinanceiro,
  categorias: Categoria[],
  totalReceitas: number,
  totalDespesas: number
) {
  const [insights, setInsights] = useState<DashboardInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = `insights-${cicloAtual?.inicio?.toISOString?.()}`;

  const fetchInsights = useCallback(
    async (force = false) => {
      if (!cicloAtual || !transacoes?.length) return;

      // Cache
      if (!force) {
        try {
          const raw = localStorage.getItem(cacheKey);
          if (raw) {
            const cached: CachedInsights = JSON.parse(raw);
            if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
              setInsights(cached.insights);
              return;
            }
          }
        } catch {}
      }

      setIsLoading(true);
      setError(null);
      try {
        // Ciclo anterior: 1 mês atrás
        const cicloAnterior: CicloFinanceiro = {
          inicio: addMonths(new Date(cicloAtual.inicio), -1),
          fim: addMonths(new Date(cicloAtual.fim), -1),
          nome: "Anterior",
        };

        const txAnt = filtrarPorCiclo(transacoes, cicloAnterior);
        const receitasAnt = somarTransacoes(filtrarPorTipo(txAnt, "receita"));
        const despesasAnt = somarTransacoes(filtrarPorTipo(txAnt, "despesa"));
        const catAnt = calcularGastosPorCategoria(txAnt, categorias);

        const catsPayload = categorias
          .filter((c) => c.tipo === "despesa")
          .map((c) => {
            const ant = catAnt.find((x) => x.nome === c.nome);
            return {
              nome: c.nome,
              atual: c.gastosAtuais || 0,
              anterior: ant?.gastosAtuais || 0,
              orcamento: c.orcamento || 0,
            };
          });

        const { data, error: invokeError } = await supabase.functions.invoke("dashboard-insights", {
          body: {
            cicloNome: cicloAtual.nome,
            totalReceitas,
            totalDespesas,
            totalReceitasAnterior: receitasAnt,
            totalDespesasAnterior: despesasAnt,
            categorias: catsPayload,
          },
        });

        if (invokeError) throw invokeError;
        if (data?.error) throw new Error(data.error);

        const result: DashboardInsight[] = data?.insights || [];
        setInsights(result);
        try {
          localStorage.setItem(cacheKey, JSON.stringify({ insights: result, timestamp: Date.now() }));
        } catch {}
      } catch (e: any) {
        console.error("[useDashboardInsights] erro:", e);
        setError(e?.message || "Erro ao gerar insights");
      } finally {
        setIsLoading(false);
      }
    },
    [cicloAtual, transacoes, categorias, totalReceitas, totalDespesas, cacheKey]
  );

  useEffect(() => {
    fetchInsights(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]);

  return { insights, isLoading, error, refresh: () => fetchInsights(true) };
}