
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
  const { 
    transacoes, 
    fetchTransacoes, 
    lastUpdate,
    adicionarTransacao,
    excluirTransacao,
    editarTransacao
  } = useTransacoes();
  
  // VERSÃO ESTÁVEL - Sem atualizações automáticas
  const { 
    forceUpdate, 
    lastRefreshed, 
    setLastRefreshed,
    isRefreshing, 
    forceFullRefresh, 
    appVersion 
  } = useVersionCheck(usuario?.id);

  // Hooks de atualização automática estão completamente desativados
  useRealTimeUpdates(
    usuario?.id,
    fetchTransacoes,
    setLastRefreshed
  );

  // Criar uma chave de cache única que muda apenas quando forçada manualmente
  const cacheKey = `${APP_VERSION}-${lastUpdate}-nocache`;
  
  // Carregamento inicial de dados - apenas UMA vez
  useEffect(() => {
    if (usuario && usuario.id) {
      console.log("[Dashboard] Carregamento inicial de dados para o usuário:", usuario.id);
      console.log("[STABLE BUILD] Carregando dados apenas UMA vez na montagem inicial");
      fetchTransacoes();
    }
  }, []); // Array de deps vazio para garantir que só executa no mount inicial

  // Handler para mudar o ciclo selecionado - simplificado
  const handleCicloChange = (novoCiclo: CicloFinanceiro) => {
    console.log("[Dashboard] Mudando para ciclo:", novoCiclo.nome);
    console.log("[STABLE BUILD] Atualização manual solicitada pelo usuário");
    
    // Garantir que as datas são objetos Date
    const cicloParaDefinir = {
      inicio: new Date(novoCiclo.inicio),
      fim: new Date(novoCiclo.fim),
      nome: novoCiclo.nome
    };
    
    setCicloAtual(cicloParaDefinir);
  };

  // Handler para excluir transação
  const handleExcluirTransacao = async (id: string) => {
    await excluirTransacao(id);
  };
  
  // Handler para editar transação
  const handleEditarTransacao = async (id: string, transacao: any) => {
    await editarTransacao(id, transacao);
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
        onExcluirTransacao={handleExcluirTransacao}
        onEditarTransacao={handleEditarTransacao}
        onAddTransacao={adicionarTransacao}
      />
      
      <DashboardFooter
        appVersion={`${APP_VERSION}-NOCACHE`}
        lastRefreshed={lastRefreshed}
        isRefreshing={isRefreshing}
        onRefresh={() => {
          console.log("[STABLE BUILD] Atualização manual solicitada pelo usuário");
          forceFullRefresh(fetchTransacoes);
        }}
      />
    </div>
  );
};

export default Dashboard;
