
import { useState, useEffect } from "react";
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

const Dashboard = () => {
  const { usuario } = useAuth();
  const { transacoes, isLoading, handleAddTransacao, handleExcluirTransacao, fetchTransacoes } = useTransacoes();
  const [cicloAtual, setCicloAtual] = useState<CicloFinanceiro>(calcularCicloAtual());
  const [lastRefreshed, setLastRefreshed] = useState<number>(Date.now());

  // Usar o hook atualizado para processar os dados do dashboard
  const {
    transacoesFiltradas,
    categoriasAtualizadas,
    totalReceitas,
    totalDespesas,
    saldo
  } = useDashboardData(transacoes, cicloAtual);

  // Recarregar transações quando o componente é montado ou quando o usuário muda
  useEffect(() => {
    if (usuario) {
      console.log("[Dashboard] Recarregando transações para o usuário:", usuario.id);
      fetchTransacoes();
    }
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

    // Verificar atualizações a cada 60 segundos
    const interval = setInterval(refreshData, 60000);
    
    // Também atualizar quando o usuário volta ao site/app
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && Date.now() - lastRefreshed > 30000) {
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
  }, [usuario, fetchTransacoes, lastRefreshed]);

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
              onAddTransacao={(transacao) => {
                const result = handleAddTransacao(transacao, usuario.id);
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
              onExcluirTransacao={(id) => {
                handleExcluirTransacao(id);
                // Força uma atualização após excluir uma transação
                setTimeout(() => fetchTransacoes(), 1000);
              }}
              totalReceitas={totalReceitas}
              totalDespesas={totalDespesas}
              saldo={saldo}
              orcamentoTotal={orcamentoTotal}
              isLoading={isLoading}
              onCicloChange={handleCicloChange}
            />
          </>
        )}
      </main>
      <div className="text-xs text-center p-2 text-gray-500">
        Última atualização: {new Date(lastRefreshed).toLocaleTimeString()}
        <button 
          onClick={() => {
            fetchTransacoes();
            setLastRefreshed(Date.now());
            toast.success("Dados atualizados com sucesso!");
          }} 
          className="ml-2 text-blue-500 hover:underline"
        >
          Atualizar agora
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
