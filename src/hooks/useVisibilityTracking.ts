
import { useEffect } from "react";

/**
 * Hook to track document visibility changes - COMPLETAMENTE DESABILITADO
 */
export function useVisibilityTracking(
  onBecomeVisible: () => void
) {
  // Hook completamente desativado - nunca chama a função onBecomeVisible
  console.log("[useVisibilityTracking] DESABILITADO - Tracking de visibilidade completamente desativado");
  
  // Nenhum event listener é configurado
  useEffect(() => {
    // Não configurar nenhum event listener
    return () => {
      // Nada para limpar
    };
  }, []);
}
