
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
      
      // Também salvar timestamp da última atualização
      localStorage.setItem('last_refresh_time', Date.now().toString());
      
      // Broadcast para outros tabs/janelas abertas
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'app_version',
        newValue: APP_VERSION,
        storageArea: localStorage
      }));
      
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
        
        // Limpar TODOS os caches locais
        for (let key in localStorage) {
          if (key.includes('cache_') || key.includes('_data') || key.includes('_state')) {
            localStorage.removeItem(key);
          }
        }
        sessionStorage.clear(); // Limpar todo o session storage
        
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
        console.log("[useVersionCheck] Versão mudou em outra janela, atualizando...");
        toast.info("Nova versão disponível, atualizando...");
        // Forçar hard refresh para garantir que o novo código seja carregado
        window.location.reload();
      }
      
      // Também reagir a mudanças de última atualização
      if (e.key === 'last_refresh_time') {
        console.log("[useVersionCheck] Dados atualizados em outra janela");
        // Apenas atualizar os dados
        forceFullRefresh();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Verificar periodicamente por atualizações (a cada 60 segundos)
    const intervalCheck = setInterval(() => {
      const cacheTime = parseInt(localStorage.getItem('last_app_check') || '0');
      const now = Date.now();
      
      // Só verifica a cada minuto para não sobrecarregar
      if (now - cacheTime > 60000) {
        localStorage.setItem('last_app_check', now.toString());
        
        // Força revalidação da versão do app
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.getRegistrations().then(registrations => {
            for (const registration of registrations) {
              registration.update();
            }
          });
        }
        
        // Se estiver online, verifica atualizações
        if (navigator.onLine) {
          fetch(`/version.json?t=${Date.now()}`, { 
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache' }
          })
            .then(response => {
              // Se a resposta for 404, é porque o arquivo não existe ainda
              if (response.status === 404) {
                return { version: APP_VERSION };
              }
              return response.json();
            })
            .then(data => {
              if (data.version && data.version !== APP_VERSION) {
                console.log("[useVersionCheck] Nova versão detectada via API:", data.version);
                window.location.reload();
              }
            })
            .catch(err => {
              console.log("[useVersionCheck] Erro ao verificar versão:", err);
              // Não fazer nada se falhar
            });
        }
      }
    }, 60000);
    
    return () => {
      clearInterval(intervalCheck);
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
