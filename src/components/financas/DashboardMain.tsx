
import React, { useState, useEffect } from "react";
import { CicloFinanceiro, Usuario, Transacao } from "@/types";
import { useCiclos } from "@/hooks/useCiclos";
import DashboardContent from "./DashboardContent";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Container } from "@/components/ui/container";

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
  
  // Garantir que temos as transações do Dashboard.tsx
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  
  // Obter dados do dashboard
  const { 
    transacoesFiltradas,
    categoriasAtualizadas: categorias,
    totalReceitas,
    totalDespesas,
    saldo
  } = useDashboardData(transacoes, cicloAtual);
  
  // Calcular orçamento total
  const orcamentoTotal = categorias?.reduce((acc, cat) => 
    cat.tipo === "despesa" ? acc + cat.orcamento : acc, 0) || 0;

  // Obter as transações do Dashboard.tsx via useEffect
  useEffect(() => {
    console.log('[DashboardMain] Ciclo atual modificado:', cicloAtual?.nome);
  }, [cicloAtual]);

  return (
    <main className="flex-1 py-8">
      <Container>
        <DashboardContent
          transacoes={transacoesFiltradas || []}
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
