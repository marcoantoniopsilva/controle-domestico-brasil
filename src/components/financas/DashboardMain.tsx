
import React, { useEffect, useState } from "react";
import { Container } from "@/components/ui/container";
import { CicloFinanceiro, Usuario, Transacao } from "@/types";
import { useCiclos } from "@/hooks/useCiclos";
import DashboardContent from "./DashboardContent";
import { useDashboardData } from "@/hooks/useDashboardData";

interface DashboardMainProps {
  usuario: Usuario;
  cicloAtual: CicloFinanceiro;
  onCicloChange: (ciclo: CicloFinanceiro) => void;
  forceUpdate?: number;
  cacheKey?: string;
  onExcluirTransacao: (id: string) => Promise<void>;
  onEditarTransacao?: (id: string, transacao: Omit<Transacao, "id">) => Promise<void>;
  onAddTransacao?: (transacao: Omit<Transacao, "id">) => Promise<boolean>;
}

const DashboardMain: React.FC<DashboardMainProps> = ({
  usuario,
  cicloAtual,
  onCicloChange,
  forceUpdate = 0,
  cacheKey = "",
  onExcluirTransacao,
  onEditarTransacao,
  onAddTransacao
}) => {
  // Hooks
  const { ciclosDisponiveis } = useCiclos();
  const [isLoading, setIsLoading] = useState(false);
  
  // Get transaction data
  const { 
    transacoesFiltradas: transacoes,
    categoriasAtualizadas: categorias,
    totalReceitas,
    totalDespesas,
    saldo
  } = useDashboardData(transacoes || [], cicloAtual);
  
  // Calculate budget total
  const orcamentoTotal = categorias?.reduce((acc, cat) => 
    cat.tipo === "despesa" ? acc + cat.orcamento : acc, 0) || 0;

  return (
    <main className="flex-1 py-8">
      <Container>
        <DashboardContent
          transacoes={transacoes || []}
          categorias={categorias || []}
          cicloAtual={cicloAtual}
          onExcluirTransacao={onExcluirTransacao}
          onEditarTransacao={onEditarTransacao}
          totalReceitas={totalReceitas}
          totalDespesas={totalDespesas}
          saldo={saldo}
          orcamentoTotal={orcamentoTotal}
          isLoading={isLoading}
          onCicloChange={onCicloChange}
          updateKey={forceUpdate}
          cacheKey={cacheKey}
        />
      </Container>
    </main>
  );
};

export default DashboardMain;
