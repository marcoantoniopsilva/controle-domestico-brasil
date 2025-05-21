
import { Categoria, CicloFinanceiro, Transacao } from "@/types";
import DashboardHeader from "./dashboard/DashboardHeader";
import SummaryCards from "./dashboard/SummaryCards";
import DashboardTabs from "./dashboard/DashboardTabs";

interface DashboardContentProps {
  transacoes: Transacao[];
  categorias: Categoria[];
  cicloAtual: CicloFinanceiro;
  onExcluirTransacao: (id: string) => Promise<void>;
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  orcamentoTotal: number;
  isLoading?: boolean;
  onCicloChange: (ciclo: CicloFinanceiro) => void;
  updateKey?: number;
  cacheKey?: string;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  transacoes,
  categorias,
  cicloAtual,
  onExcluirTransacao,
  totalReceitas,
  totalDespesas,
  saldo,
  orcamentoTotal,
  isLoading,
  onCicloChange,
  updateKey,
  cacheKey
}) => {
  // Removido o useEffect que causava re-renderização quando updateKey ou cacheKey mudavam
  
  // Separamos categorias por tipo
  const categoriasDespesa = categorias.filter(cat => cat.tipo === "despesa");
  
  // Calcular o total real de despesas (soma dos gastos atuais em todas as categorias de despesa)
  const totalDespesasCategoria = categoriasDespesa.reduce((acc, cat) => acc + cat.gastosAtuais, 0);
  // Calcular o saldo real com base nos totais das categorias
  const saldoReal = totalReceitas - totalDespesasCategoria;

  return (
    <div className="space-y-8">
      <DashboardHeader onCicloChange={onCicloChange} />
      
      <SummaryCards 
        totalReceitas={totalReceitas}
        totalDespesasCategoria={totalDespesasCategoria}
        saldoReal={saldoReal}
      />
      
      <DashboardTabs 
        transacoes={transacoes}
        categorias={categorias}
        cicloAtual={cicloAtual}
        onExcluirTransacao={onExcluirTransacao}
        totalDespesasCategoria={totalDespesasCategoria}
        orcamentoTotal={orcamentoTotal}
        cacheKey={cacheKey}
        updateKey={updateKey}
      />
      
      {isLoading && <div className="text-center py-6">Carregando dados...</div>}
    </div>
  );
};

export default DashboardContent;
