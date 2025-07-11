
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
  transacoes: Transacao[];
}

const DashboardMain: React.FC<DashboardMainProps> = ({
  usuario,
  cicloAtual,
  onCicloChange,
  forceUpdate = 0,
  cacheKey = "",
  onExcluirTransacao,
  onEditarTransacao,
  onAddTransacao,
  transacoes = []
}) => {
  // Hooks
  const { ciclosDisponiveis } = useCiclos();
  const [isLoading, setIsLoading] = useState(false);
  
  // Obter dados do dashboard
  const { 
    transacoesFiltradas,
    categoriasAtualizadas: categorias,
    totalReceitas,
    totalDespesas,
    totalInvestimentos,
    saldo
  } = useDashboardData(transacoes, cicloAtual);
  
  // Calcular orçamento total - corrigir o erro de tipo
  const orcamentoTotal = categorias?.reduce((acc, cat) => {
    return cat.tipo === "despesa" ? acc + cat.orcamento : acc;
  }, 0) || 0;

  // Log for debugging
  useEffect(() => {
    console.log('[DashboardMain] Ciclo atual modificado:', cicloAtual?.nome);
    console.log('[DashboardMain] Número total de transações recebidas:', transacoes.length);
    console.log('[DashboardMain] Número de transações filtradas para o ciclo atual:', transacoesFiltradas.length);
    console.log('[DashboardMain] Total de investimentos:', totalInvestimentos);
  }, [cicloAtual, transacoes, transacoesFiltradas, totalInvestimentos]);

  return (
    <main className="flex-1 py-8">
      <Container>
        <DashboardContent
          transacoes={transacoesFiltradas || []}
          transacoesOriginais={transacoes}
          categorias={categorias || []}
          cicloAtual={cicloAtual}
          onExcluirTransacao={onExcluirTransacao}
          onEditarTransacao={onEditarTransacao}
          totalReceitas={totalReceitas}
          totalDespesas={totalDespesas}
          totalInvestimentos={totalInvestimentos}
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
