
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Versão da aplicação para controle de cache - usar um valor único para cada deploy
export const APP_VERSION = `v${Date.now()}`;

export function useVersionCheck(userId?: string) {
  const [forceUpdate, setForceUpdate] = useState<number>(0);
  const [lastRefreshed, setLastRefreshed] = useState<number>(Date.now());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  // Estado para controlar a última verificação
  const lastCheckRef = useRef<number>(Date.now());

  // Função para forçar atualização completa
  const forceFullRefresh = useCallback(async (fetchDataFn?: () => Promise<void>) => {
    // Evitar múltiplas atualizações em sequência
    const now = Date.now();
    if (now - lastCheckRef.current < 30000) { // 30 segundos entre atualizações
      console.log("[useVersionCheck] Ignorando atualização, muito recente desde a última");
      return;
    }
    
    console.log("[useVersionCheck] Forçando atualização completa da aplicação...");
    setIsRefreshing(true);
    lastCheckRef.current = now;
    
    try {
      // Atualizar versão no localStorage para forçar atualização em outros dispositivos
      localStorage.setItem('app_version', APP_VERSION);
      
      // Também salvar timestamp da última atualização
      localStorage.setItem('last_refresh_time', Date.now().toString());
      
      // Broadcast para outros tabs/janelas abertas com atraso para evitar loops
      setTimeout(() => {
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'app_version',
          newValue: APP_VERSION,
          storageArea: localStorage
        }));
      }, 1000);
      
      // Fazer uma série de atualizações para garantir dados frescos
      if (fetchDataFn) {
        await fetchDataFn();
      }
      
      // Incrementar forceUpdate para forçar re-renderização de componentes
      setForceUpdate(prev => prev + 1);
      setLastRefreshed(Date.now());
      
      toast.success("Dados atualizados com sucesso!");
    } catch (error) {
      console.error("[useVersionCheck] Erro ao atualizar dados:", error);
      toast.error("Erro ao atualizar dados. Tente novamente.");
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Verificar cache local e versão da aplicação - com muito menos frequência
  useEffect(() => {
    const checkVersion = () => {
      const localVersion = localStorage.getItem('dashboard_version');
      if (!localVersion || localVersion !== APP_VERSION) {
        localStorage.setItem('dashboard_version', APP_VERSION);
        console.log("[useVersionCheck] Nova versão detectada:", APP_VERSION);
        
        // Limpar TODOS os caches locais
        for (let key in localStorage) {
          if (key.includes('cache_') || key.includes('_data') || key.includes('_state')) {
            localStorage.removeItem(key);
          }
        }
        
        // Forçar atualização dos dados
        if (userId) {
          forceFullRefresh();
        }
      }
    };
    
    checkVersion();
    
    // Adicionar listener para mensagens de atualização de outros tabs/janelas
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'app_version' && e.newValue !== APP_VERSION) {
        // Verificamos o último refresh para evitar loops
        const lastRefresh = parseInt(localStorage.getItem('last_storage_refresh') || '0');
        const now = Date.now();
        
        if (now - lastRefresh > 60000) { // 1 minuto entre refreshes
          console.log("[useVersionCheck] Versão mudou em outra janela, atualizando...");
          localStorage.setItem('last_storage_refresh', now.toString());
          toast.info("Nova versão disponível, atualizando...");
          // Forçar hard refresh para garantir que o novo código seja carregado
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        }
      }
      
      // Também reagir a mudanças de última atualização - com debounce
      if (e.key === 'last_refresh_time' && e.newValue) {
        const now = Date.now();
        const lastStorageCheck = parseInt(localStorage.getItem('last_storage_check') || '0');
        
        // Só processa se passou mais de 30 segundos da última verificação
        if (now - lastStorageCheck > 30000) {
          console.log("[useVersionCheck] Dados atualizados em outra janela");
          localStorage.setItem('last_storage_check', now.toString());
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Verificar periodicamente por atualizações (a cada 30 minutos)
    const intervalCheck = setInterval(() => {
      const cacheTime = parseInt(localStorage.getItem('last_app_check') || '0');
      const now = Date.now();
      
      // Só verifica a cada 30 minutos para não sobrecarregar
      if (now - cacheTime > 1800000) {
        localStorage.setItem('last_app_check', now.toString());
        
        console.log("[useVersionCheck] Verificação periódica de versão (a cada 30 minutos)");
      }
    }, 1800000); // 30 minutos
    
    return () => {
      clearInterval(intervalCheck);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [userId, forceFullRefresh]);

  return {
    forceUpdate,
    lastRefreshed,
    setLastRefreshed,
    isRefreshing,
    forceFullRefresh,
    appVersion: APP_VERSION
  };
}
