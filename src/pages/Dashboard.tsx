
import { useState, useEffect, useCallback } from "react";
import { calcularCicloAtual } from "@/utils/financas";
import DashboardContent from "@/components/financas/DashboardContent";
import { useTransacoes } from "@/hooks/useTransacoes";
import { useAuth } from "@/hooks/useAuth";
import { DashboardHeader } from "@/components/financas/DashboardHeader";
import { CicloFinanceiro } from "@/types";
import DashboardLoading from "@/components/financas/DashboardLoading";
import { useDashboardData } from "@/hooks/useDashboardData";
import NavBar from "@/components/layout/NavBar";
import { categorias } from "@/utils/financas";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

// Versão da aplicação para controle de cache - usar um valor único para cada deploy
const APP_VERSION = `v${Date.now()}`;

const Dashboard = () => {
  const { usuario } = useAuth();
  const { transacoes, isLoading, handleAddTransacao, handleExcluirTransacao, fetchTransacoes, lastUpdate } = useTransacoes();
  const [cicloAtual, setCicloAtual] = useState<CicloFinanceiro>(calcularCicloAtual());
  const [forceUpdate, setForceUpdate] = useState<number>(0);
  const [lastRefreshed, setLastRefreshed] = useState<number>(Date.now());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Criar uma chave de cache única que muda sempre que forceUpdate muda
  const cacheKey = `${APP_VERSION}-${forceUpdate}-${lastUpdate}`;

  // Usar o hook atualizado para processar os dados do dashboard
  const {
    transacoesFiltradas,
    categoriasAtualizadas,
    totalReceitas,
    totalDespesas,
    saldo
  } = useDashboardData(transacoes, cicloAtual);

  // Função para forçar atualização completa
  const forceFullRefresh = useCallback(async () => {
    console.log("[Dashboard] Forçando atualização completa da aplicação...");
    setIsRefreshing(true);
    
    try {
      // Atualizar versão no localStorage para forçar atualização em outros dispositivos
      localStorage.setItem('app_version', APP_VERSION);
      
      // Fazer uma série de atualizações para garantir dados frescos
      await fetchTransacoes(true);
      
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
      console.error("[Dashboard] Erro ao atualizar dados:", error);
      toast.error("Erro ao atualizar dados. Tente novamente.");
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchTransacoes]);

  // Verificar cache local e versão da aplicação
  useEffect(() => {
    const checkVersion = () => {
      const localVersion = localStorage.getItem('dashboard_version');
      if (!localVersion || localVersion !== APP_VERSION) {
        localStorage.setItem('dashboard_version', APP_VERSION);
        console.log("[Dashboard] Nova versão detectada:", APP_VERSION);
        
        // Limpar caches locais
        localStorage.removeItem('dashboard_data');
        sessionStorage.removeItem('dashboard_state');
        
        // Forçar atualização dos dados
        if (usuario) {
          forceFullRefresh();
        }
      }
    };
    
    checkVersion();
    
    // Adicionar listener para mensagens de atualização de outros tabs/janelas
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dashboard_version' && e.newValue !== APP_VERSION) {
        console.log("[Dashboard] Versão mudou em outra janela, atualizando...");
        window.location.reload();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [usuario, forceFullRefresh]);

  // Recarregar transações quando o componente é montado ou quando o usuário muda
  useEffect(() => {
    if (usuario) {
      console.log("[Dashboard] Recarregando transações para o usuário:", usuario.id);
      fetchTransacoes();
    }
  }, [usuario, fetchTransacoes, forceUpdate]);

  // Configurar canais de tempo real para atualizações do banco de dados
  useEffect(() => {
    if (!usuario) return;
    
    const channel = supabase
      .channel('public:lancamentos')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'lancamentos' }, 
        (payload) => {
          console.log("[Dashboard] Alteração detectada via tempo real:", payload);
          fetchTransacoes();
          setLastRefreshed(Date.now());
          toast.info("Novos dados disponíveis!");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [usuario, fetchTransacoes]);

  // Implementar verificação periódica para garantir dados atualizados
  useEffect(() => {
    // Função para atualizar dados
    const refreshData = async () => {
      if (usuario) {
        console.log("[Dashboard] Atualizando dados periodicamente...");
        await fetchTransacoes();
        setLastRefreshed(Date.now());
      }
    };

    // Verificar atualizações a cada 30 segundos
    const interval = setInterval(refreshData, 30000);
    
    // Também atualizar quando o usuário volta ao site/app
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("[Dashboard] Usuário retornou à página, atualizando dados...");
        refreshData();
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    // Limpar intervalos e listeners
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [usuario, fetchTransacoes]);

  // Handler para mudar o ciclo selecionado
  const handleCicloChange = (novoCiclo: CicloFinanceiro) => {
    console.log("[Dashboard] Mudando para ciclo:", novoCiclo.nome);
    
    // Garantir que as datas são objetos Date
    const cicloParaDefinir = {
      inicio: new Date(novoCiclo.inicio),
      fim: new Date(novoCiclo.fim),
      nome: novoCiclo.nome
    };
    
    setCicloAtual(cicloParaDefinir);
    toast.info(`Ciclo atualizado para: ${cicloParaDefinir.nome}`);
  };

  if (isLoading && !usuario) {
    return <DashboardLoading />;
  }

  // Calcular o valor total do orçamento (soma dos orçamentos das categorias de despesa)
  const orcamentoTotal = categorias
    .filter(cat => cat.tipo === "despesa")
    .reduce((acc, cat) => acc + cat.orcamento, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 container mx-auto px-4 py-8">
        {usuario && (
          <>
            <DashboardHeader 
              usuario={usuario}
              onAddTransacao={async (transacao) => {
                const result = await handleAddTransacao(transacao, usuario.id);
                // Força uma atualização após adicionar uma transação
                if (result) {
                  setTimeout(() => fetchTransacoes(), 1000);
                }
                return result;
              }}
            />
            
            <DashboardContent 
              transacoes={transacoesFiltradas}
              categorias={categoriasAtualizadas}
              cicloAtual={cicloAtual}
              onExcluirTransacao={async (id) => {
                await handleExcluirTransacao(id);
                // Força uma atualização após excluir uma transação
                setTimeout(() => fetchTransacoes(), 1000);
              }}
              totalReceitas={totalReceitas}
              totalDespesas={totalDespesas}
              saldo={saldo}
              orcamentoTotal={orcamentoTotal}
              isLoading={isLoading}
              onCicloChange={handleCicloChange}
              updateKey={forceUpdate} // Chave para forçar re-renderização
              cacheKey={cacheKey} // Nova propriedade para controle de cache
            />
          </>
        )}
      </main>
      <div className="text-xs text-center p-2 text-gray-500 flex items-center justify-center gap-2">
        <span>Versão: {APP_VERSION.substring(0, 10)} | Última atualização: {new Date(lastRefreshed).toLocaleTimeString()}</span>
        <Button 
          onClick={forceFullRefresh} 
          variant="ghost" 
          size="sm"
          disabled={isRefreshing}
          className="h-6 px-2 text-xs flex items-center gap-1"
        >
          <RefreshCcw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          Atualizar agora
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
