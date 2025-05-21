
import { useEffect } from "react";

/**
 * Hook to track document visibility changes - COMPLETAMENTE DESABILITADO
 * VERSÃO ESTÁVEL v2025-05-21-stable-NO-REFRESH - SEM ATUALIZAÇÕES AUTOMÁTICAS
 */
export function useVisibilityTracking(
  onBecomeVisible: () => void
) {
  // Hook completamente desativado - nunca chama a função onBecomeVisible
  console.log("[useVisibilityTracking] DESABILITADO - Tracking de visibilidade completamente desativado");
  
  // Nenhum event listener é configurado
  useEffect(() => {
    // Não configurar nenhum event listener
    console.log("[STABLE BUILD] Visibility tracking completamente desativado");
    return () => {
      // Nada para limpar
    };
  }, []);
}
