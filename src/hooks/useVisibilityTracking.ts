
import { useEffect } from "react";

/**
 * Hook to track document visibility changes and perform actions when the document
 * becomes visible again
 */
export function useVisibilityTracking(
  onBecomeVisible: () => void
) {
  useEffect(() => {
    // Verificar atualizações quando o documento fica visível novamente
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("[useVisibilityTracking] Documento visível novamente, verificando atualizações...");
        onBecomeVisible();
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    // Limpar listener ao desmontar
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [onBecomeVisible]);
}
