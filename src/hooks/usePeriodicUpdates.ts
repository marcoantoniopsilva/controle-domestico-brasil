
import { useEffect } from "react";

/**
 * Hook para realizar atualizações periódicas - DESATIVADO
 */
export function usePeriodicUpdates(
  onUpdate: () => void,
  intervalMs: number = 3600000 
) {
  // Completamente desativado para evitar atualizações automáticas
  
  useEffect(() => {
    console.log("[usePeriodicUpdates] Atualizações periódicas desativadas para estabilizar o dashboard");
    
    // Não configurar nenhum interval
    return () => {
      // Nada para limpar
    };
  }, []);
}
