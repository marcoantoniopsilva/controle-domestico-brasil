
import { useState } from "react";
import NavBar from "@/components/layout/NavBar";
import { calcularCicloAtual } from "@/utils/financas";
import DashboardContent from "@/components/financas/DashboardContent";
import { useTransacoes } from "@/hooks/useTransacoes";
import { useAuth } from "@/hooks/useAuth";
import { DashboardHeader } from "@/components/financas/DashboardHeader";
import { CicloFinanceiro } from "@/types";

const Dashboard = () => {
  const { usuario } = useAuth();
  const { transacoes, isLoading, handleAddTransacao, handleExcluirTransacao } = useTransacoes();
  const [cicloAtual, setCicloAtual] = useState<CicloFinanceiro>(calcularCicloAtual());

  const handleCicloChange = (novoCiclo: CicloFinanceiro) => {
    setCicloAtual(novoCiclo);
  };

  if (isLoading && !usuario) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-1 flex items-center justify-center">
          <p>Carregando...</p>
        </main>
      </div>
    );
  }

  const transacoesCicloAtual = transacoes.filter(t => {
    const data = new Date(t.data);
    return data >= cicloAtual.inicio && data <= cicloAtual.fim;
  }).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  
  const totalReceitas = transacoesCicloAtual
    .filter(t => t.valor > 0)
    .reduce((acc, t) => acc + t.valor, 0);
    
  const totalDespesas = transacoesCicloAtual
    .filter(t => t.valor < 0)
    .reduce((acc, t) => acc + Math.abs(t.valor), 0);
    
  const saldo = totalReceitas - totalDespesas;

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
              transacoes={transacoesCicloAtual}
              categorias={categorias}
              cicloAtual={cicloAtual}
              onExcluirTransacao={handleExcluirTransacao}
              totalReceitas={totalReceitas}
              totalDespesas={totalDespesas}
              saldo={saldo}
              orcamentoTotal={categorias.reduce((acc, cat) => acc + cat.orcamento, 0)}
              isLoading={isLoading}
              onCicloChange={handleCicloChange}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
