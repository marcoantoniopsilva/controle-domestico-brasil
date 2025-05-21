
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Versão da aplicação para controle de cache - usar um valor único para cada deploy
export const APP_VERSION = `v${Date.now()}`;

export function useVersionCheck(userId?: string) {
  const [forceUpdate, setForceUpdate] = useState<number>(0);
  const [lastRefreshed, setLastRefreshed] = useState<number>(Date.now());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Função para forçar atualização completa
  const forceFullRefresh = useCallback(async (fetchDataFn?: () => Promise<void>) => {
    console.log("[useVersionCheck] Forçando atualização completa da aplicação...");
    setIsRefreshing(true);
    
    try {
      // Atualizar versão no localStorage para forçar atualização em outros dispositivos
      localStorage.setItem('app_version', APP_VERSION);
      
      // Fazer uma série de atualizações para garantir dados frescos
      if (fetchDataFn) {
        await fetchDataFn();
      }
      
      // Incrementar forceUpdate para forçar re-renderização de componentes
      setForceUpdate(prev => prev + 1);
      setLastRefreshed(Date.now());
      
      // Verificar se existem novas versões da aplicação (bundle)
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          for (const registration of registrations) {
            registration.update();
          }
        });
      }
      
      toast.success("Dados atualizados com sucesso!");
    } catch (error) {
      console.error("[useVersionCheck] Erro ao atualizar dados:", error);
      toast.error("Erro ao atualizar dados. Tente novamente.");
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Verificar cache local e versão da aplicação
  useEffect(() => {
    const checkVersion = () => {
      const localVersion = localStorage.getItem('dashboard_version');
      if (!localVersion || localVersion !== APP_VERSION) {
        localStorage.setItem('dashboard_version', APP_VERSION);
        console.log("[useVersionCheck] Nova versão detectada:", APP_VERSION);
        
        // Limpar caches locais
        localStorage.removeItem('dashboard_data');
        sessionStorage.removeItem('dashboard_state');
        
        // Forçar atualização dos dados
        if (userId) {
          forceFullRefresh();
        }
      }
    };
    
    checkVersion();
    
    // Adicionar listener para mensagens de atualização de outros tabs/janelas
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dashboard_version' && e.newValue !== APP_VERSION) {
        console.log("[useVersionCheck] Versão mudou em outra janela, atualizando...");
        window.location.reload();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [userId, forceFullRefresh]);

  return {
    forceUpdate,
    lastRefreshed,
    setLastRefreshed, // Export the setter function
    isRefreshing,
    forceFullRefresh,
    appVersion: APP_VERSION
  };
}
