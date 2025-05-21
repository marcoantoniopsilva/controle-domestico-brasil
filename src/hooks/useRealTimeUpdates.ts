
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useRealTimeUpdates(
  userId: string | undefined, 
  fetchDataFn: () => Promise<void>,
  setLastRefreshed: (time: number) => void
) {
  // Configurar canais de tempo real para atualizações do banco de dados
  useEffect(() => {
    if (!userId) return;
    
    const channel = supabase
      .channel('public:lancamentos')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'lancamentos' }, 
        (payload) => {
          console.log("[useRealTimeUpdates] Alteração detectada via tempo real:", payload);
          fetchDataFn();
          setLastRefreshed(Date.now());
          toast.info("Novos dados disponíveis!");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchDataFn, setLastRefreshed]);

  // Implementar verificação periódica para garantir dados atualizados
  useEffect(() => {
    // Função para atualizar dados
    const refreshData = async () => {
      if (userId) {
        console.log("[useRealTimeUpdates] Atualizando dados periodicamente...");
        await fetchDataFn();
        setLastRefreshed(Date.now());
      }
    };

    // Verificar atualizações a cada 30 segundos
    const interval = setInterval(refreshData, 30000);
    
    // Também atualizar quando o usuário volta ao site/app
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("[useRealTimeUpdates] Usuário retornou à página, atualizando dados...");
        refreshData();
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    // Limpar intervalos e listeners
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [userId, fetchDataFn, setLastRefreshed]);
}
