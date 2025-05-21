import { useState, useEffect } from "react";
import { calcularCicloAtual } from "@/utils/financas";
import { useAuth } from "@/hooks/useAuth";
import { CicloFinanceiro } from "@/types";
import DashboardLoading from "@/components/financas/DashboardLoading";
import NavBar from "@/components/layout/NavBar";
import DashboardMain from "@/components/financas/DashboardMain";
import DashboardFooter from "@/components/financas/DashboardFooter";
import { APP_VERSION } from "@/hooks/useVersionCheck";
import { useTransacoes } from "@/hooks/useTransacoes";
import { useRealTimeUpdates } from "@/hooks/useRealTimeUpdates";

const Dashboard = () => {
  const { usuario } = useAuth();
  const [cicloAtual, setCicloAtual] = useState<CicloFinanceiro>(calcularCicloAtual());
  const { transacoes, fetchTransacoes, lastUpdate } = useTransacoes();
  
  // Usar o hook de verificação de versão
  const { 
    forceUpdate, 
    lastRefreshed, 
    setLastRefreshed, // Get the setter function from the hook
    isRefreshing, 
    forceFullRefresh, 
    appVersion 
  } = useVersionCheck(usuario?.id);

  // Usar o hook de atualizações em tempo real
  useRealTimeUpdates(
    usuario?.id,
    fetchTransacoes,
    setLastRefreshed // Now we pass the setter function that we got from useVersionCheck
  );

  // Criar uma chave de cache única que muda sempre que forceUpdate muda
  const cacheKey = `${appVersion}-${forceUpdate}-${lastUpdate}`;
  
  // Verificar atualizações quando o componente é montado
  useEffect(() => {
    if (usuario?.id) {
      // Verificar se há uma nova versão disponível ao montar o componente
      const currentVersion = localStorage.getItem('app_version');
      const deployVersion = APP_VERSION;
      
      if (currentVersion !== deployVersion) {
        console.log('[Dashboard] Nova versão detectada:', deployVersion);
        localStorage.setItem('app_version', deployVersion);
        
        // Forçar recarregamento da página após pequeno delay para garantir que o usuário veja a mensagem
        setTimeout(() => {
          console.log('[Dashboard] Recarregando página para atualizar versão');
          window.location.reload();
        }, 1500);
      }
    }
  }, [usuario?.id]);

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
  };

  if (!usuario) {
    return <DashboardLoading />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <DashboardMain
        usuario={usuario}
        cicloAtual={cicloAtual}
        onCicloChange={handleCicloChange}
        forceUpdate={forceUpdate}
        cacheKey={cacheKey}
      />
      
      <DashboardFooter
        appVersion={APP_VERSION}
        lastRefreshed={lastRefreshed}
        isRefreshing={isRefreshing}
        onRefresh={() => forceFullRefresh(fetchTransacoes)}
      />
    </div>
  );
};

export default Dashboard;
