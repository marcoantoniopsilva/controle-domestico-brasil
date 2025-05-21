
import { useState, useCallback } from "react";
import { toast } from "sonner";

// Versão fixa da aplicação - NUNCA muda automaticamente
export const APP_VERSION = `v2025-05-21-stable-no-auto-refresh`;

export function useVersionCheck(userId?: string) {
  // Manter estados simples sem qualquer lógica de atualização automática
  const [forceUpdate, setForceUpdate] = useState<number>(0);
  const [lastRefreshed, setLastRefreshed] = useState<number>(Date.now());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Função que faz APENAS atualização manual sob demanda do usuário
  const forceFullRefresh = useCallback(async (fetchDataFn?: () => Promise<void>) => {
    console.log("[useVersionCheck] Atualização MANUAL solicitada pelo usuário");
    
    // Prevenir múltiplos cliques
    if (isRefreshing) {
      console.log("[useVersionCheck] Atualização já em andamento, ignorando clique");
      return;
    }
    
    setIsRefreshing(true);
    
    try {
      // Apenas chamar fetchDataFn se fornecido
      if (fetchDataFn) {
        await fetchDataFn();
      }
      
      // NÃO incrementar forceUpdate para evitar loops de renderização
      // Apenas atualizar lastRefreshed para mostrar ao usuário
      setLastRefreshed(Date.now());
      toast.success("Dados atualizados com sucesso!");
    } catch (error) {
      console.error("[useVersionCheck] Erro ao atualizar dados:", error);
      toast.error("Erro ao atualizar dados. Tente novamente.");
    } finally {
      // Garantir que o estado de atualização é resetado
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  return {
    forceUpdate,
    lastRefreshed,
    setLastRefreshed,
    isRefreshing,
    forceFullRefresh,
    appVersion: APP_VERSION
  };
}
