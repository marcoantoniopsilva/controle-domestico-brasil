
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
    
    // Criar um ID único para esta sessão/instância do app
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('current_session_id', sessionId);
    
    const channel = supabase
      .channel('public:lancamentos')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'lancamentos' }, 
        (payload) => {
          console.log("[useRealTimeUpdates] Alteração detectada via tempo real:", payload);
          fetchDataFn();
          setLastRefreshed(Date.now());
          toast.info("Novos dados disponíveis!");
          
          // Avisar outras abas que houve atualização
          localStorage.setItem('data_updated_timestamp', Date.now().toString());
          localStorage.setItem('data_updated_by', sessionId);
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
    
    // Ouvir por atualizações vindas de outras abas/dispositivos
    const handleStorageChange = (e: StorageEvent) => {
      const currentSessionId = localStorage.getItem('current_session_id');
      
      // Se a atualização veio de outra aba/dispositivo
      if (e.key === 'data_updated_timestamp' && e.newValue) {
        const updatedBy = localStorage.getItem('data_updated_by');
        if (updatedBy !== currentSessionId) {
          console.log("[useRealTimeUpdates] Dados atualizados em outra aba/dispositivo");
          refreshData();
        }
      }
      
      // Verificar se há uma nova versão disponível
      if (e.key === 'app_version' && e.newValue) {
        const currentVersion = localStorage.getItem('app_version');
        if (e.newValue !== currentVersion) {
          console.log("[useRealTimeUpdates] Nova versão detectada via localStorage");
          toast.info("Nova versão disponível, atualizando...");
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("storage", handleStorageChange);
    
    // Verificar conexão de rede
    const handleOnline = () => {
      console.log("[useRealTimeUpdates] Conexão de rede restaurada, atualizando dados...");
      refreshData();
      toast.success("Conexão com internet restaurada!");
    };
    
    const handleOffline = () => {
      console.log("[useRealTimeUpdates] Conexão de rede perdida");
      toast.error("Conexão com internet perdida. Alguns recursos podem não funcionar.");
    };
    
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    // Limpar intervalos e listeners
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [userId, fetchDataFn, setLastRefreshed]);
}
