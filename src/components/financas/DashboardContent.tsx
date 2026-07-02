
import React from "react";
import { Categoria, CicloFinanceiro, Transacao, Usuario } from "@/types";
import DashboardHeader from "./dashboard/DashboardHeader";
import DashboardTabs from "./dashboard/DashboardTabs";
import SummaryCards from "./dashboard/SummaryCards";
import { InsightsCard } from "./dashboard/InsightsCard";
import { useDashboardInsights } from "@/hooks/useDashboardInsights";

interface DashboardContentProps {
  usuario: Usuario;
  transacoesParaInsights: Transacao[];
  transacoes: Transacao[];
  transacoesOriginais?: Transacao[]; 
  categorias: Categoria[];
  cicloAtual: CicloFinanceiro;
  onExcluirTransacao: (id: string) => Promise<void>;
  onEditarTransacao?: (id: string, transacao: Omit<Transacao, "id">) => Promise<void>;
  totalReceitas: number;
  totalDespesas: number;
  totalInvestimentos?: number;
  saldo: number;
  orcamentoTotal: number;
  orcamentoReceitas?: number;
  isLoading: boolean;
  onCicloChange: (ciclo: CicloFinanceiro) => void;
  updateKey?: number;
  cacheKey?: string;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  usuario,
  transacoesParaInsights,
  transacoes,
  transacoesOriginais,
  categorias,
  cicloAtual,
  onExcluirTransacao,
  onEditarTransacao,
  totalReceitas,
  totalDespesas,
  totalInvestimentos = 0,
  saldo,
  orcamentoTotal,
  orcamentoReceitas = 0,
  isLoading,
  onCicloChange,
  updateKey,
  cacheKey
}) => {
  const { insights, isLoading: insightsLoading, error: insightsError, refresh } = useDashboardInsights(
    transacoesParaInsights,
    cicloAtual,
    categorias,
    totalReceitas,
    totalDespesas
  );

  return (
    <div className="space-y-6 md:space-y-8">
      <DashboardHeader onCicloChange={onCicloChange} />

      <SummaryCards
        totalReceitas={totalReceitas}
        totalDespesas={totalDespesas}
        totalInvestimentos={totalInvestimentos}
        saldo={saldo}
        orcamentoTotal={orcamentoTotal}
      />

      <InsightsCard
        insights={insights}
        isLoading={insightsLoading}
        error={insightsError}
        onRefresh={refresh}
      />

      <DashboardTabs
        transacoes={transacoes}
        transacoesOriginais={transacoesOriginais}
        categorias={categorias}
        cicloAtual={cicloAtual}
        onExcluirTransacao={onExcluirTransacao}
        onEditarTransacao={onEditarTransacao}
        totalDespesasCategoria={totalDespesas}
        totalReceitas={totalReceitas}
        orcamentoTotal={orcamentoTotal}
        updateKey={updateKey}
        cacheKey={cacheKey}
      />
    </div>
  );
};

export default DashboardContent;
