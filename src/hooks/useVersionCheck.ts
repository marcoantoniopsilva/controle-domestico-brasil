
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";

// Versão da aplicação para controle de cache - usando um valor fixo para evitar mudanças constantes
export const APP_VERSION = `v2025-05-21-stable`;

export function useVersionCheck(userId?: string) {
  const [forceUpdate, setForceUpdate] = useState<number>(0);
  const [lastRefreshed, setLastRefreshed] = useState<number>(Date.now());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  // Estado para controlar a última verificação
  const lastCheckRef = useRef<number>(Date.now());
  const isProcessingRef = useRef<boolean>(false);

  // Função para forçar atualização completa
  const forceFullRefresh = useCallback(async (fetchDataFn?: () => Promise<void>) => {
    // Evitar atualizações simultâneas
    if (isProcessingRef.current) {
      console.log("[useVersionCheck] Já existe uma atualização em andamento, ignorando");
      return;
    }
    
    // Evitar múltiplas atualizações em sequência
    const now = Date.now();
    if (now - lastCheckRef.current < 180000) { // 3 minutos entre atualizações
      console.log("[useVersionCheck] Ignorando atualização, muito recente desde a última");
      return;
    }
    
    console.log("[useVersionCheck] Forçando atualização completa da aplicação...");
    setIsRefreshing(true);
    lastCheckRef.current = now;
    isProcessingRef.current = true;
    
    try {
      // Atualizar versão no localStorage (mantendo a mesma para evitar recarregamentos)
      localStorage.setItem('app_version', APP_VERSION);
      
      // Também salvar timestamp da última atualização
      localStorage.setItem('last_refresh_time', Date.now().toString());
      
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
      isProcessingRef.current = false;
    }
  }, []);

  // Verificar cache local e versão da aplicação - com muito menos frequência
  useEffect(() => {
    // Verificar versão apenas uma vez durante o ciclo de vida do componente
    const localVersion = localStorage.getItem('dashboard_version');
    if (!localVersion || localVersion !== APP_VERSION) {
      localStorage.setItem('dashboard_version', APP_VERSION);
      console.log("[useVersionCheck] Nova versão detectada:", APP_VERSION);
      
      // Limpar caches relevantes apenas na primeira carga
      for (let key in localStorage) {
        if (key.includes('cache_') || key.includes('_data')) {
          localStorage.removeItem(key);
        }
      }
    }
    
    // Adicionar listener para mensagens de atualização de outros tabs/janelas
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'app_version' && e.newValue !== APP_VERSION) {
        // Verificamos o último refresh para evitar loops
        const lastRefresh = parseInt(localStorage.getItem('last_storage_refresh') || '0');
        const now = Date.now();
        
        if (now - lastRefresh > 300000) { // 5 minutos entre refreshes
          console.log("[useVersionCheck] Versão mudou em outra janela");
          localStorage.setItem('last_storage_refresh', now.toString());
          toast.info("Nova versão disponível");
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [userId]);

  return {
    forceUpdate,
    lastRefreshed,
    setLastRefreshed,
    isRefreshing,
    forceFullRefresh,
    appVersion: APP_VERSION
  };
}
