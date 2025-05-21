
import { useEffect } from "react";

/**
 * Hook para realizar atualizações periódicas de dados
 */
export function usePeriodicUpdates(
  onUpdate: () => void,
  intervalMs: number = 1800000 // Aumentado para 30 minutos (1800000ms)
) {
  useEffect(() => {
    console.log(`[usePeriodicUpdates] Configurando atualização periódica a cada ${intervalMs}ms`);
    
    // Atualizar periodicamente para garantir sincronização
    const interval = setInterval(() => {
      console.log("[usePeriodicUpdates] Verificação periódica de atualizações...");
      onUpdate();
    }, intervalMs);
      
    // Limpar intervalo ao desmontar
    return () => {
      clearInterval(interval);
    };
  }, [onUpdate, intervalMs]);
}
