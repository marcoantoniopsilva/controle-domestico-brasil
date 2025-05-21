
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useRealTimeUpdates(
  userId: string | undefined, 
  fetchDataFn: () => Promise<void>,
  setLastRefreshed: (time: number) => void
) {
  // Referências para controlar estado e debounce
  const updateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const storageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());
  const updateCountRef = useRef<number>(0);
  const isProcessingRef = useRef<boolean>(false);
  
  // Configurar canais de tempo real para atualizações do banco de dados
  useEffect(() => {
    if (!userId) return;
    
    console.log("[useRealTimeUpdates] Configurando canal de tempo real");
    
    // Criar um ID único para esta sessão/instância do app
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('current_session_id', sessionId);
    
    // Debounce function with strict rate limiting
    const debouncedDataUpdate = () => {
      // Se já estiver processando uma atualização, não iniciar outra
      if (isProcessingRef.current) {
        console.log("[useRealTimeUpdates] Já existe uma atualização em andamento, ignorando");
        return;
      }
      
      // Verificar tempo desde a última atualização - mínimo 60 segundos entre atualizações
      const now = Date.now();
      if (now - lastUpdateRef.current < 60000) {
        console.log("[useRealTimeUpdates] Ignorando atualização, muito recente desde a última");
        return;
      }
      
      // Limpando timeouts existentes para não acumular
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
        updateTimeoutRef.current = null;
      }
      
      // Configurar flag para indicar processamento
      isProcessingRef.current = true;
      
      // Usar um debounce longo para evitar múltiplas atualizações em sequência
      updateTimeoutRef.current = setTimeout(async () => {
        try {
          console.log("[useRealTimeUpdates] Atualizando dados após debounce");
          await fetchDataFn();
          setLastRefreshed(Date.now());
          lastUpdateRef.current = Date.now();
          
          // Só mostrar toast se realmente houve uma atualização recente
          updateCountRef.current++;
          if (updateCountRef.current <= 2) { // Limitar notificações para evitar spam
            toast.info("Dados atualizados");
          }
        } catch (error) {
          console.error("[useRealTimeUpdates] Erro ao atualizar dados:", error);
        } finally {
          // Limpar flag de processamento após conclusão
          isProcessingRef.current = false;
          updateTimeoutRef.current = null;
        }
      }, 10000); // Delay de 10 segundos antes de atualizar
    };
    
    // Ouvir apenas eventos relevantes e com controle de frequência
    const channel = supabase
      .channel('public:lancamentos')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'lancamentos' }, 
        () => {
          console.log("[useRealTimeUpdates] Alteração detectada na tabela lancamentos");
          debouncedDataUpdate();
        }
      )
      .subscribe((status) => {
        console.log(`[useRealTimeUpdates] Status da subscrição: ${status}`);
      });

    return () => {
      console.log("[useRealTimeUpdates] Limpando canal de tempo real");
      supabase.removeChannel(channel);
      
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
        updateTimeoutRef.current = null;
      }
    };
  }, [userId, fetchDataFn, setLastRefreshed]);

  // Implementar verificação quando o usuário volta ao site/app com muito menos frequência
  useEffect(() => {
    if (!userId) return;
    
    // Função para atualizar dados
    const refreshData = async () => {
      // Verificar se já está processando uma atualização
      if (isProcessingRef.current) {
        console.log("[useRealTimeUpdates] Já existe uma atualização em andamento, ignorando");
        return;
      }
      
      // Verificar tempo desde a última atualização
      const now = Date.now();
      if (now - lastUpdateRef.current < 300000) { // 5 minutos mínimo entre atualizações
        console.log("[useRealTimeUpdates] Ignorando atualização, muito recente");
        return;
      }
      
      try {
        isProcessingRef.current = true;
        console.log("[useRealTimeUpdates] Atualizando dados...");
        await fetchDataFn();
        setLastRefreshed(Date.now());
        lastUpdateRef.current = Date.now();
      } catch (error) {
        console.error("[useRealTimeUpdates] Erro ao atualizar dados:", error);
      } finally {
        isProcessingRef.current = false;
      }
    };
    
    // Ouvir por atualizações vindas de outras abas/dispositivos com debounce
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key || !e.newValue) return;
      
      const currentSessionId = localStorage.getItem('current_session_id');
      
      // Se a atualização veio de outra aba/dispositivo
      if (e.key === 'data_updated_timestamp') {
        const updatedBy = localStorage.getItem('data_updated_by');
        if (updatedBy && updatedBy !== currentSessionId) {
          console.log("[useRealTimeUpdates] Dados atualizados em outra aba/dispositivo");
          
          // Usar debounce para evitar múltiplas atualizações
          if (storageTimeoutRef.current) {
            clearTimeout(storageTimeoutRef.current);
            storageTimeoutRef.current = null;
          }
          
          storageTimeoutRef.current = setTimeout(() => {
            refreshData();
            storageTimeoutRef.current = null;
          }, 15000); // 15 segundos de debounce
        }
      }
    };
    
    // Verificar visibilidade com muito menos frequência
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Verificar quando foi a última atualização
        const lastUpdate = parseInt(localStorage.getItem('last_data_refresh') || '0');
        const now = Date.now();
        
        // Só atualiza se passou mais de 15 minutos desde a última atualização
        if (now - lastUpdate > 900000) { // 15 minutos
          console.log("[useRealTimeUpdates] Usuário retornou à página após longo período");
          refreshData();
          localStorage.setItem('last_data_refresh', now.toString());
        }
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("storage", handleStorageChange);
    
    // Registrar a primeira atualização sem recarregar os dados
    localStorage.setItem('last_data_refresh', Date.now().toString());
    
    // Limpar listeners
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("storage", handleStorageChange);
      
      if (storageTimeoutRef.current) {
        clearTimeout(storageTimeoutRef.current);
        storageTimeoutRef.current = null;
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
