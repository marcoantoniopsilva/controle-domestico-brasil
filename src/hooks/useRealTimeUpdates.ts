
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
          // Usar um debounce para evitar múltiplas atualizações em sequência
          if (window._updateTimeout) {
            clearTimeout(window._updateTimeout);
          }
          
          window._updateTimeout = setTimeout(() => {
            fetchDataFn();
            setLastRefreshed(Date.now());
            toast.info("Novos dados disponíveis!");
          }, 2000); // Aguarda 2 segundos antes de atualizar
          
          // Avisar outras abas que houve atualização
          localStorage.setItem('data_updated_timestamp', Date.now().toString());
          localStorage.setItem('data_updated_by', sessionId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (window._updateTimeout) {
        clearTimeout(window._updateTimeout);
      }
    };
  }, [userId, fetchDataFn, setLastRefreshed]);

  // Implementar verificação quando o usuário volta ao site/app com menos frequência
  useEffect(() => {
    if (!userId) return;
    
    // Função para atualizar dados
    const refreshData = async () => {
      console.log("[useRealTimeUpdates] Atualizando dados...");
      await fetchDataFn();
      setLastRefreshed(Date.now());
    };
    
    // Ouvir por atualizações vindas de outras abas/dispositivos com debounce
    const handleStorageChange = (e: StorageEvent) => {
      const currentSessionId = localStorage.getItem('current_session_id');
      
      // Se a atualização veio de outra aba/dispositivo
      if (e.key === 'data_updated_timestamp' && e.newValue) {
        const updatedBy = localStorage.getItem('data_updated_by');
        if (updatedBy !== currentSessionId) {
          console.log("[useRealTimeUpdates] Dados atualizados em outra aba/dispositivo");
          
          // Usar debounce para evitar múltiplas atualizações
          if (window._storageTimeout) {
            clearTimeout(window._storageTimeout);
          }
          
          window._storageTimeout = setTimeout(() => {
            refreshData();
          }, 2000);
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
    
    // Verificar visibilidade com menos frequência
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Verificar quando foi a última atualização
        const lastUpdate = parseInt(localStorage.getItem('last_data_refresh') || '0');
        const now = Date.now();
        
        // Só atualiza se passou mais de 5 minutos desde a última atualização
        if (now - lastUpdate > 300000) {
          console.log("[useRealTimeUpdates] Usuário retornou à página após longo período, atualizando dados...");
          refreshData();
          localStorage.setItem('last_data_refresh', now.toString());
        } else {
          console.log("[useRealTimeUpdates] Usuário retornou à página, mas dados foram atualizados recentemente");
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
    
    // Registrar a primeira atualização
    localStorage.setItem('last_data_refresh', Date.now().toString());
    
    // Limpar intervalos e listeners
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (window._storageTimeout) {
        clearTimeout(window._storageTimeout);
      }
    };
  }, [userId, fetchDataFn, setLastRefreshed]);
}

// Declarar a tipagem para as propriedades globais do window
declare global {
  interface Window {
    _updateTimeout?: ReturnType<typeof setTimeout>;
    _storageTimeout?: ReturnType<typeof setTimeout>;
  }
}
