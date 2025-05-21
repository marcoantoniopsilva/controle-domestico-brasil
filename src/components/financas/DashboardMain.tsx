
import React, { useEffect } from "react";
import { Usuario, CicloFinanceiro } from "@/types";
import { DashboardHeader } from "@/components/financas/DashboardHeader";
import DashboardContent from "@/components/financas/DashboardContent";
import { useTransacoes } from "@/hooks/useTransacoes";
import { useDashboardData } from "@/hooks/useDashboardData";
import { categorias } from "@/utils/financas";

interface DashboardMainProps {
  usuario: Usuario;
  cicloAtual: CicloFinanceiro;
  onCicloChange: (ciclo: CicloFinanceiro) => void;
  forceUpdate: number;
  cacheKey: string;
}

const DashboardMain: React.FC<DashboardMainProps> = ({
  usuario,
  cicloAtual,
  onCicloChange,
  forceUpdate,
  cacheKey
}) => {
  // Usar versão simplificada do hook de transações sem atualizações automáticas
  const { transacoes, isLoading, handleAddTransacao, handleExcluirTransacao, fetchTransacoes } = useTransacoes();

  // Usar o hook atualizado para processar os dados do dashboard
  const {
    transacoesFiltradas,
    categoriasAtualizadas,
    totalReceitas,
    totalDespesas,
    saldo
  } = useDashboardData(transacoes, cicloAtual);

  // Carregar transações apenas UMA vez quando o componente é montado
  // Otimizado para evitar múltiplos fetchs - array de deps vazio
  useEffect(() => {
    if (usuario) {
      console.log("[DashboardMain] Carregando transações iniciais para o usuário:", usuario.id);
      fetchTransacoes();
    }
  }, []); // Apenas no mount inicial para evitar loops

  // Calcular o valor total do orçamento (soma dos orçamentos das categorias de despesa)
  const orcamentoTotal = categorias
    .filter(cat => cat.tipo === "despesa")
    .reduce((acc, cat) => acc + cat.orcamento, 0);

  return (
    <main className="flex-1 container mx-auto px-4 py-8">
      <DashboardHeader 
        usuario={usuario}
        onAddTransacao={async (transacao) => {
          const result = await handleAddTransacao(transacao, usuario.id);
          // Forçar uma atualização após adicionar uma transação
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
        onCicloChange={onCicloChange}
        updateKey={forceUpdate}
        cacheKey={cacheKey}
      />
    </main>
  );
};

export default DashboardMain;
