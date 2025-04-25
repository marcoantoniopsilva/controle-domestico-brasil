
import { useState, useEffect } from "react";
import NavBar from "@/components/layout/NavBar";
import { calcularCicloAtual, categorias } from "@/utils/financas";
import DashboardContent from "@/components/financas/DashboardContent";
import { useTransacoes } from "@/hooks/useTransacoes";
import { useAuth } from "@/hooks/useAuth";
import { DashboardHeader } from "@/components/financas/DashboardHeader";
import { CicloFinanceiro } from "@/types";
import { useParcelasFuturas } from "@/hooks/useParcelasFuturas";

const Dashboard = () => {
  const { usuario } = useAuth();
  const { transacoes, isLoading, handleAddTransacao, handleExcluirTransacao, fetchTransacoes } = useTransacoes();
  const [cicloAtual, setCicloAtual] = useState<CicloFinanceiro>(calcularCicloAtual());
  
  // Obter as parcelas futuras projetadas
  const parcelasFuturas = useParcelasFuturas(transacoes, cicloAtual);

  const handleCicloChange = (novoCiclo: CicloFinanceiro) => {
    setCicloAtual(novoCiclo);
  };

  // Recarregar transações quando o componente é montado ou quando o usuário muda
  useEffect(() => {
    if (usuario) {
      fetchTransacoes();
    }
  }, [usuario]);

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

  // Filtrar transações do ciclo atual + parcelas projetadas para este ciclo
  const transacoesCicloAtual = [
    ...transacoes.filter(t => {
      const data = new Date(t.data);
      return data >= cicloAtual.inicio && data <= cicloAtual.fim;
    }),
    ...parcelasFuturas.filter(t => {
      const data = new Date(t.data);
      return data >= cicloAtual.inicio && data <= cicloAtual.fim;
    })
  ].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  
  console.log("Transações no ciclo atual:", transacoesCicloAtual);
  console.log("Total de transações carregadas:", transacoes.length);
  console.log("Total de parcelas futuras:", parcelasFuturas.length);
  console.log("Ciclo atual:", cicloAtual);
  
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
