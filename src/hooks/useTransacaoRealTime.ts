
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook for setting up real-time subscription to transaction changes - DISABLED
 */
export function useTransacaoRealTime(
  onDataChange: () => void
) {
  // Desativado completamente para evitar atualizações automáticas
  // que estavam causando o problema de piscar constantemente
  
  useEffect(() => {
    console.log("[useTransacaoRealTime] Real-time updates desativados para estabilizar o dashboard");
    
    // Não configurar nenhum canal ou listener
    return () => {
      // Nada para limpar
    };
  }, []);
}
