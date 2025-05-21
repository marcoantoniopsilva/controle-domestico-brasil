
import { useEffect } from "react";

/**
 * Hook to track document visibility changes - DISABLED
 */
export function useVisibilityTracking(
  onBecomeVisible: () => void
) {
  // Completamente desativado para evitar atualizações automáticas
  
  useEffect(() => {
    console.log("[useVisibilityTracking] Tracking de visibilidade desativado para estabilizar o dashboard");
    
    // Não configurar nenhum event listener
    return () => {
      // Nada para limpar
    };
  }, []);
}
