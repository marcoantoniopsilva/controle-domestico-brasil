
import { useState, useCallback } from "react";
import { toast } from "sonner";

// Versão fixa da aplicação para evitar mudanças constantes
export const APP_VERSION = `v2025-05-21-stable`;

export function useVersionCheck(userId?: string) {
  const [forceUpdate, setForceUpdate] = useState<number>(0);
  const [lastRefreshed, setLastRefreshed] = useState<number>(Date.now());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Função simplificada para atualização manual apenas
  const forceFullRefresh = useCallback(async (fetchDataFn?: () => Promise<void>) => {
    console.log("[useVersionCheck] Executando atualização manual");
    setIsRefreshing(true);
    
    try {
      if (fetchDataFn) {
        await fetchDataFn();
      }
      
      setLastRefreshed(Date.now());
      toast.success("Dados atualizados com sucesso!");
    } catch (error) {
      console.error("[useVersionCheck] Erro ao atualizar dados:", error);
      toast.error("Erro ao atualizar dados. Tente novamente.");
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  return {
    forceUpdate,
    lastRefreshed,
    setLastRefreshed,
    isRefreshing,
    forceFullRefresh,
    appVersion: APP_VERSION
  };
}
