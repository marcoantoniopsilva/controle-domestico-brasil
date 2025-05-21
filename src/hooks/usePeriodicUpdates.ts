
import { useEffect } from "react";

/**
 * Hook para realizar atualizações periódicas - COMPLETAMENTE DESABILITADO
 * VERSÃO ESTÁVEL v2025-05-21-stable-NO-REFRESH - SEM ATUALIZAÇÕES AUTOMÁTICAS
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
    console.log("[STABLE BUILD] Periodic updates completamente desativados");
    return () => {
      // Nada para limpar
    };
  }, []);
}
