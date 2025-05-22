
import { useState, useEffect } from "react";
import { calcularCicloAtual } from "@/utils/financas";
import { useAuth } from "@/hooks/useAuth";
import { CicloFinanceiro, Transacao } from "@/types";
import DashboardLoading from "@/components/financas/DashboardLoading";
import NavBar from "@/components/layout/NavBar";
import DashboardMain from "@/components/financas/DashboardMain";
import DashboardFooter from "@/components/financas/DashboardFooter";
import { APP_VERSION, useVersionCheck } from "@/hooks/useVersionCheck";
import { useTransacoes } from "@/hooks/useTransacoes";
import { useRealTimeUpdates } from "@/hooks/useRealTimeUpdates";
import { DashboardHeader } from "@/components/financas/DashboardHeader";
import { toast } from "sonner";

const Dashboard = () => {
  const { usuario } = useAuth();
  const [cicloAtual, setCicloAtual] = useState<CicloFinanceiro>(calcularCicloAtual());
  const { 
    transacoes, 
    fetchTransacoes, 
    lastUpdate,
    adicionarTransacao,
    excluirTransacao,
    editarTransacao,
    isLoading
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
      
      // Mostrar toast de carregamento
      toast.info("Carregando suas transações...");
      
      // Carregar dados
      fetchTransacoes(true).then(() => {
        toast.success("Transações carregadas com sucesso!");
      }).catch((error) => {
        toast.error("Erro ao carregar transações: " + error.message);
      });
    }
  }, [usuario, fetchTransacoes]); // Dependências necessárias

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
    
    // Também recarregar dados quando muda o ciclo
    toast.info(`Atualizando dados para o ciclo ${novoCiclo.nome}...`);
    fetchTransacoes(true);
  };

  // Handler para excluir transação
  const handleExcluirTransacao = async (id: string) => {
    toast.info("Excluindo transação...");
    try {
      await excluirTransacao(id);
      toast.success("Transação excluída com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao excluir: " + error.message);
    }
  };
  
  // Handler para editar transação
  const handleEditarTransacao = async (id: string, transacao: any) => {
    toast.info("Salvando alterações...");
    try {
      await editarTransacao(id, transacao);
      toast.success("Transação atualizada com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao atualizar: " + error.message);
    }
  };
  
  // Handler para adicionar transação
  const handleAdicionarTransacao = async (transacao: Omit<Transacao, "id">) => {
    toast.info("Adicionando transação...");
    try {
      const resultado = await adicionarTransacao(transacao);
      if (resultado) {
        toast.success("Transação adicionada com sucesso!");
      }
      return resultado;
    } catch (error: any) {
      toast.error("Erro ao adicionar: " + error.message);
      return false;
    }
  };

  if (!usuario) {
    return <DashboardLoading />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <div className="container mx-auto px-4 py-6">
        <DashboardHeader 
          usuario={usuario} 
          onAddTransacao={handleAdicionarTransacao}
        />
      </div>
      
      <DashboardMain
        usuario={usuario}
        cicloAtual={cicloAtual}
        onCicloChange={handleCicloChange}
        forceUpdate={forceUpdate}
        cacheKey={cacheKey}
        onExcluirTransacao={handleExcluirTransacao}
        onEditarTransacao={handleEditarTransacao}
        onAddTransacao={handleAdicionarTransacao}
      />
      
      <DashboardFooter
        appVersion={`${APP_VERSION}-NOCACHE`}
        lastRefreshed={lastRefreshed}
        isRefreshing={isRefreshing || isLoading}
        onRefresh={() => {
          console.log("[STABLE BUILD] Atualização manual solicitada pelo usuário");
          toast.info("Atualizando dados...");
          forceFullRefresh(() => 
            fetchTransacoes(true).then(() => {
              toast.success("Dados atualizados com sucesso!");
            })
          );
        }}
      />
    </div>
  );
};

export default Dashboard;
