
import { useState, useEffect, useCallback } from "react";
import { Transacao } from "@/types";
import { useTransacaoFetch } from "./useTransacaoFetch";
import { useTransacaoCRUD } from "./useTransacaoCRUD";
import { useTransacaoRealTime } from "./useTransacaoRealTime";
import { useVisibilityTracking } from "./useVisibilityTracking";
import { usePeriodicUpdates } from "./usePeriodicUpdates";
import { checkAppVersion } from "@/utils/versionUtils";

export function useTransacoes() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  
  // Importar hooks menores
  const { fetchTransacoes: fetchApi } = useTransacaoFetch();
  const { handleAddTransacao, handleExcluirTransacao } = useTransacaoCRUD();

  // Função para buscar e atualizar transações
  const fetchTransacoes = useCallback(async (showToast: boolean = false) => {
    setIsLoading(true);
    const { data } = await fetchApi(showToast);
    setTransacoes(data || []);
    setLastUpdate(Date.now());
    setIsLoading(false);
  }, [fetchApi]);

  // Verificar versão e buscar dados na montagem do componente
  useEffect(() => {
    const needsReload = checkAppVersion();
    
    // Forçar recarregamento completo da página apenas uma vez após atualização
    if (needsReload) {
      console.log("[useTransacoes] Recarregando página para atualizar bundle...");
      window.location.reload();
      return;
    }
    
    fetchTransacoes();
  }, [fetchTransacoes]);

  // Monitorar alterações em tempo real
  useTransacaoRealTime(fetchTransacoes);
  
  // Monitorar visibilidade do documento
  useVisibilityTracking(fetchTransacoes);
  
  // Configurar atualizações periódicas
  usePeriodicUpdates(fetchTransacoes);

  return {
    transacoes,
    isLoading,
    handleAddTransacao,
    handleExcluirTransacao,
    fetchTransacoes,
    lastUpdate
  };
}
