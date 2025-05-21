
import { useEffect } from "react";

/**
 * Hook para realizar atualizações periódicas - COMPLETAMENTE DESABILITADO
 */
export function usePeriodicUpdates(
  onUpdate: () => void,
  intervalMs: number = 3600000 
) {
  // Hook completamente desativado - nunca chama a função onUpdate
  console.log("[usePeriodicUpdates] DESABILITADO - Atualizações periódicas completamente desativadas");
  
  // Nenhum interval é configurado
  useEffect(() => {
    // Não configurar nenhum interval
    return () => {
      // Nada para limpar
    };
  }, []);
}
