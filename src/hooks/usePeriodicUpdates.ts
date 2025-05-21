
import { useEffect, useRef } from "react";

/**
 * Hook para realizar atualizações periódicas de dados com controle rigoroso de frequência
 */
export function usePeriodicUpdates(
  onUpdate: () => void,
  intervalMs: number = 3600000 // Aumentado para 60 minutos (3600000ms)
) {
  // Referência para controlar quando a última atualização ocorreu
  const lastUpdateRef = useRef<number>(Date.now());

  useEffect(() => {
    console.log(`[usePeriodicUpdates] Configurando atualização periódica a cada ${intervalMs}ms`);
    
    // Criar função de verificação com garantias anti-loop
    const checkForUpdates = () => {
      const now = Date.now();
      // Só atualiza se passou pelo menos o intervalo configurado
      if (now - lastUpdateRef.current >= intervalMs) {
        console.log("[usePeriodicUpdates] Executando verificação periódica programada");
        lastUpdateRef.current = now;
        onUpdate();
      } else {
        console.log("[usePeriodicUpdates] Ignorando verificação, muito recente desde a última");
      }
    };
    
    // Configurar intervalo com período muito maior
    const interval = setInterval(checkForUpdates, intervalMs);
      
    // Limpar intervalo ao desmontar
    return () => {
      clearInterval(interval);
    };
  }, [onUpdate, intervalMs]);
}
