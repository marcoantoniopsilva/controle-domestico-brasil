
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook for setting up real-time subscription to transaction changes
 */
export function useTransacaoRealTime(
  onDataChange: () => void
) {
  useEffect(() => {
    // Configurar canal de tempo real para atualizações de transações
    const channel = supabase
      .channel('custom-lancamentos-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'lancamentos' }, 
        () => {
          console.log("[useTransacaoRealTime] Alteração detectada na tabela lancamentos");
          onDataChange();
        }
      )
      .subscribe();
    
    // Limpar inscrição ao desmontar
    return () => {
      supabase.removeChannel(channel);
    };
  }, [onDataChange]);
}
