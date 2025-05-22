
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
  const { ciclos } = useCiclos();
  const { 
    transacoes,
    categorias,
    totalReceitas,
    totalDespesas,
    saldo,
    orcamentoTotal,
    isLoading,
    setFiltro,
  } = useDashboardData(usuario, cicloAtual, forceUpdate, cacheKey);

  // Atualizar filtro quando o ciclo muda
  useEffect(() => {
    setFiltro({
      dataInicio: cicloAtual.inicio,
      dataFim: cicloAtual.fim
    });
  }, [cicloAtual, setFiltro]);

  return (
    <main className="flex-1 py-8">
      <Container>
        <DashboardContent
          transacoes={transacoes}
          categorias={categorias}
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
