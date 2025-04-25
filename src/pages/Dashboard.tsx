
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

const Dashboard = () => {
  const { usuario } = useAuth();
  const { transacoes, isLoading, handleAddTransacao, handleExcluirTransacao, fetchTransacoes } = useTransacoes();
  const [cicloAtual, setCicloAtual] = useState<CicloFinanceiro>(calcularCicloAtual());

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

  // Log detalhado de todas as transações para diagnóstico
  useEffect(() => {
    if (transacoes.length > 0) {
      console.log("[Dashboard] Todas as transações carregadas:", transacoes.length);
      transacoes.forEach((t, idx) => {
        if (idx < 20) {
          console.log(`[Dashboard] Transação ${idx + 1}:`, 
            `ID: ${t.id}`,
            `Descrição: ${t.descricao || t.categoria}`,
            `Data: ${new Date(t.data).toISOString()}`,
            `Valor: ${t.valor}`);
        }
      });
    }
  }, [transacoes]);

  if (isLoading && !usuario) {
    return <DashboardLoading />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 container mx-auto px-4 py-8">
        {usuario && (
          <>
            <DashboardHeader 
              usuario={usuario}
              onAddTransacao={(transacao) => handleAddTransacao(transacao, usuario.id)}
            />
            
            <DashboardContent 
              transacoes={transacoesFiltradas}
              categorias={categoriasAtualizadas}
              cicloAtual={cicloAtual}
              onExcluirTransacao={handleExcluirTransacao}
              totalReceitas={totalReceitas}
              totalDespesas={totalDespesas}
              saldo={saldo}
              orcamentoTotal={categorias.reduce((acc, cat) => acc + cat.orcamento, 0)}
              isLoading={isLoading}
              onCicloChange={setCicloAtual}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
