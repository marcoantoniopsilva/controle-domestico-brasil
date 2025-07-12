
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
  
  // Calcular orçamento total corretamente - CORRIGINDO O PROBLEMA DO ORÇAMENTO
  const orcamentoTotal = categorias ? categorias
    .filter(cat => cat.tipo === "despesa")
    .reduce((acc, cat) => {
      console.log(`[DashboardMain] Categoria ${cat.nome}: orçamento R$ ${cat.orcamento}`);
      return acc + (cat.orcamento || 0);
    }, 0) : 0;

  console.log(`[DashboardMain] ORÇAMENTO TOTAL CALCULADO: R$ ${orcamentoTotal}`);

  // Log for debugging
  useEffect(() => {
    console.log('[DashboardMain] Ciclo atual modificado:', cicloAtual?.nome);
    console.log('[DashboardMain] Número total de transações recebidas:', transacoes.length);
    console.log('[DashboardMain] Número de transações filtradas para o ciclo atual:', transacoesFiltradas.length);
    console.log('[DashboardMain] Total de receitas:', totalReceitas);
    console.log('[DashboardMain] Total de despesas:', totalDespesas);
    console.log('[DashboardMain] Total de investimentos:', totalInvestimentos);
    console.log('[DashboardMain] Saldo calculado:', saldo);
    console.log('[DashboardMain] Orçamento total:', orcamentoTotal);
    
    // Log das categorias e seus gastos
    if (categorias) {
      const categoriasDespesa = categorias.filter(cat => cat.tipo === "despesa");
      console.log('[DashboardMain] Categorias de despesa e gastos:');
      categoriasDespesa.forEach(cat => {
        console.log(`  - ${cat.nome}: orçamento R$ ${cat.orcamento}, gastos R$ ${cat.gastosAtuais || 0}`);
      });
    }
  }, [cicloAtual, transacoes, transacoesFiltradas, totalReceitas, totalDespesas, totalInvestimentos, saldo, orcamentoTotal, categorias]);

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
