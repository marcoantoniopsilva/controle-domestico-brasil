
import { useEffect } from "react";

// Hook completamente desativado
export function useRealTimeUpdates(
  userId: string | undefined, 
  fetchDataFn: () => Promise<void>,
  setLastRefreshed: (time: number) => void
) {
  useEffect(() => {
    console.log("[useRealTimeUpdates] Sistema de atualizações em tempo real completamente desativado");
    
    // Não configurar canais, listeners, ou timeouts
    return () => {
      // Nada para limpar
    };
  }, []);
}

// Removendo declaração global para evitar problemas
