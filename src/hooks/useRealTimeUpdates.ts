
import { useEffect } from "react";

// Hook completamente desativado - não faz nada
export function useRealTimeUpdates(
  userId: string | undefined, 
  fetchDataFn: () => Promise<void>,
  setLastRefreshed: (time: number) => void
) {
  // Garantir que este hook não faz absolutamente nada
  useEffect(() => {
    console.log("[useRealTimeUpdates] DESABILITADO - Sistema de atualizações em tempo real completamente desativado");
    
    // Não configurar canais, listeners, ou timeouts
    return () => {
      // Nada para limpar
    };
  }, []);
}

// Removendo declaração global para evitar problemas
