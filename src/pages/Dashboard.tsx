
import { useState, useEffect } from "react";
import { calcularCicloAtual } from "@/utils/financas";
import { useAuth } from "@/hooks/useAuth";
import { CicloFinanceiro } from "@/types";
import DashboardLoading from "@/components/financas/DashboardLoading";
import NavBar from "@/components/layout/NavBar";
import DashboardMain from "@/components/financas/DashboardMain";
import DashboardFooter from "@/components/financas/DashboardFooter";
import { APP_VERSION, useVersionCheck } from "@/hooks/useVersionCheck";
import { useTransacoes } from "@/hooks/useTransacoes";
import { useRealTimeUpdates } from "@/hooks/useRealTimeUpdates";

const Dashboard = () => {
  const { usuario } = useAuth();
  const [cicloAtual, setCicloAtual] = useState<CicloFinanceiro>(calcularCicloAtual());
  const { transacoes, fetchTransacoes, lastUpdate } = useTransacoes();
  
  // Usar o hook de verificação de versão - sem atualizações automáticas
  const { 
    forceUpdate, 
    lastRefreshed, 
    setLastRefreshed,
    isRefreshing, 
    forceFullRefresh, 
    appVersion 
  } = useVersionCheck(usuario?.id);

  // Usar o hook de atualizações em tempo real - completamente desativado
  useRealTimeUpdates(
    usuario?.id,
    fetchTransacoes,
    setLastRefreshed
  );

  // Criar uma chave de cache única que muda apenas quando forçada manualmente
  const cacheKey = `${appVersion}-${lastUpdate}`;
  
  // Desativando completamente a verificação automática de versão
  // Removido o useEffect que verificava novas versões

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
