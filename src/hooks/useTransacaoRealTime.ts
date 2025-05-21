
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook for setting up real-time subscription to transaction changes - COMPLETAMENTE DESABILITADO
 * VERSÃO ESTÁVEL v2025-05-21-stable-NO-REFRESH - SEM ATUALIZAÇÕES AUTOMÁTICAS
 */
export function useTransacaoRealTime(
  onDataChange: () => void
) {
  // Garantir que este hook não faz absolutamente nada
  useEffect(() => {
    console.log("[useTransacaoRealTime] DESABILITADO - Real-time updates completamente desativados");
    console.log("[STABLE BUILD] Real-time updates completamente desativados");
    
    // Não configurar nenhum canal ou listener
    return () => {
      // Nada para limpar
    };
  }, []);
}
