
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

  // Hooks de atualização automática estão completamente desativados
  // mas mantemos a chamada para compatibilidade com a estrutura do código
  useRealTimeUpdates(
    usuario?.id,
    fetchTransacoes,
    setLastRefreshed
  );

  // Criar uma chave de cache única que muda apenas quando forçada manualmente
  const cacheKey = `${appVersion}-${lastUpdate}`;
  
  // Carregamento inicial de dados - apenas UMA vez
  // Usamos useEffect vazio para garantir que isso aconteça só no mount inicial
  useEffect(() => {
    if (usuario && usuario.id) {
      console.log("[Dashboard] Carregamento inicial de dados para o usuário:", usuario.id);
      fetchTransacoes();
    }
  }, []); // Array de deps vazio para garantir que só executa no mount inicial

  // Handler para mudar o ciclo selecionado - simplificado
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
