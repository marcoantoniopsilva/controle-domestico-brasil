import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Categoria, CicloFinanceiro, Transacao } from "@/types";
import { formatarMoeda } from "@/utils/financas";
import DashboardHeader from "./dashboard/DashboardHeader";
import DashboardTabs from "./dashboard/DashboardTabs";
import SummaryCards from "./dashboard/SummaryCards";

interface DashboardContentProps {
  transacoes: Transacao[];
  transacoesOriginais?: Transacao[]; // Adicionar prop para transações não filtradas
  categorias: Categoria[];
  cicloAtual: CicloFinanceiro;
  onExcluirTransacao: (id: string) => Promise<void>;
  onEditarTransacao?: (id: string, transacao: Omit<Transacao, "id">) => Promise<void>;
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  orcamentoTotal: number;
  isLoading: boolean;
  onCicloChange: (ciclo: CicloFinanceiro) => void;
  updateKey?: number;
  cacheKey?: string;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  transacoes,
  transacoesOriginais,
  categorias,
  cicloAtual,
  onExcluirTransacao,
  onEditarTransacao,
  totalReceitas,
  totalDespesas,
  saldo,
  orcamentoTotal,
  isLoading,
  onCicloChange,
  updateKey,
  cacheKey
}) => {
  return (
    <div className="space-y-6">
      <DashboardHeader onCicloChange={onCicloChange} />
      
      <SummaryCards
        totalReceitas={totalReceitas}
        totalDespesas={totalDespesas}
        saldo={saldo}
        orcamentoTotal={orcamentoTotal}
      />
      
      <DashboardTabs
        transacoes={transacoes}
        transacoesOriginais={transacoesOriginais} // Repassar transações originais
        categorias={categorias}
        cicloAtual={cicloAtual}
        onExcluirTransacao={onExcluirTransacao}
        onEditarTransacao={onEditarTransacao}
        totalDespesasCategoria={totalDespesas}
        orcamentoTotal={orcamentoTotal}
        updateKey={updateKey}
        cacheKey={cacheKey}
      />
    </div>
  );
};

export default DashboardContent;
