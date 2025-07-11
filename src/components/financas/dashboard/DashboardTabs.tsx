
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Categoria, CicloFinanceiro, Transacao } from "@/types";
import ResumoOrcamento from "../ResumoOrcamento";
import ListaTransacoes from "../ListaTransacoes";
import GraficoGastosDiarios from "../GraficoGastosDiarios";
import ProgressoCategoriaClickable from "../ProgressoCategoriaClickable";
import RelatorioCartaoCredito from "../RelatorioCartaoCredito";
import GraficoComparativoMensal from "../GraficoComparativo/GraficoComparativoMensal";
import TransactionDetailModal from "../GraficoComparativo/TransactionDetailModal";
import InvestmentSummaryCards from "../investimentos/InvestmentSummaryCards";
import InvestmentEvolutionChart from "../investimentos/InvestmentEvolutionChart";
import InvestmentsList from "../investimentos/InvestmentsList";
import { useTransactionsByCategory } from "@/hooks/useTransactionsByCategory";

interface DashboardTabsProps {
  transacoes: Transacao[];
  transacoesOriginais?: Transacao[];
  categorias: Categoria[];
  cicloAtual: CicloFinanceiro;
  onExcluirTransacao: (id: string) => Promise<void>;
  onEditarTransacao?: (id: string, transacao: Omit<Transacao, "id">) => Promise<void>;
  totalDespesasCategoria: number;
  orcamentoTotal: number;
  cacheKey?: string;
  updateKey?: number;
}

const DashboardTabs = ({
  transacoes,
  transacoesOriginais,
  categorias,
  cicloAtual,
  onExcluirTransacao,
  onEditarTransacao,
  totalDespesasCategoria,
  orcamentoTotal
}: DashboardTabsProps) => {
  const [activeTab, setActiveTab] = useState("resumo");
  
  // Estado para o modal de detalhes das transações
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    categoria: string;
    ciclo: string;
    transacoes: Transacao[];
    totalValue: number;
  }>({
    isOpen: false,
    categoria: "",
    ciclo: "",
    transacoes: [],
    totalValue: 0
  });
  
  // Hook para filtrar transações por categoria
  const { getTransactionsForCategory } = useTransactionsByCategory(
    transacoesOriginais || transacoes, 
    cicloAtual
  );
  
  // Separamos categorias por tipo
  const categoriasDespesa = categorias.filter(cat => cat.tipo === "despesa");
  const categoriasReceita = categorias.filter(cat => cat.tipo === "receita");
  const categoriasInvestimento = categorias.filter(cat => cat.tipo === "investimento");

  // Handler para abrir o modal com detalhes das transações
  const handleCategoryClick = (categoria: string, ciclo: string, valor: number) => {
    console.log(`[DashboardTabs] Clique na categoria ${categoria} do ciclo ${ciclo} com valor ${valor}`);
    
    const transacoesCategoria = getTransactionsForCategory(categoria);
    
    setModalState({
      isOpen: true,
      categoria,
      ciclo,
      transacoes: transacoesCategoria,
      totalValue: valor
    });
  };

  // Handler para fechar o modal
  const handleCloseModal = () => {
    setModalState({
      isOpen: false,
      categoria: "",
      ciclo: "",
      transacoes: [],
      totalValue: 0
    });
  };

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full flex flex-wrap justify-start">
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="despesas">Despesas</TabsTrigger>
          <TabsTrigger value="receitas">Receitas</TabsTrigger>
          <TabsTrigger value="investimentos">Investimentos</TabsTrigger>
          <TabsTrigger value="transacoes">Transações</TabsTrigger>
          <TabsTrigger value="graficos">Gráficos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="resumo" className="space-y-4">
          <ResumoOrcamento 
            categorias={categorias} 
            cicloAtual={cicloAtual}
            totalDespesas={totalDespesasCategoria}
          />
          
          <RelatorioCartaoCredito
            transacoes={transacoes}
            categorias={categorias}
            cicloAtual={cicloAtual}
          />
          
          <ListaTransacoes 
            transacoes={transacoes.slice(0, 5)} 
            onExcluir={onExcluirTransacao}
            onEditar={onEditarTransacao}
          />
        </TabsContent>
        
        <TabsContent value="despesas">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categoriasDespesa.map((categoria) => (
              <ProgressoCategoriaClickable 
                key={categoria.nome}
                categoria={categoria}
                cicloAtual={cicloAtual}
                onClick={handleCategoryClick}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="receitas">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categoriasReceita.map((categoria) => (
              <ProgressoCategoriaClickable 
                key={categoria.nome}
                categoria={categoria}
                cicloAtual={cicloAtual}
                onClick={handleCategoryClick}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="investimentos" className="space-y-6">
          <InvestmentSummaryCards transacoes={transacoesOriginais || transacoes} />
          <InvestmentEvolutionChart transacoes={transacoesOriginais || transacoes} />
          <InvestmentsList 
            transacoes={transacoesOriginais || transacoes}
            onExcluir={onExcluirTransacao}
            onEditar={onEditarTransacao}
          />
        </TabsContent>
        
        <TabsContent value="transacoes">
          <ListaTransacoes 
            transacoes={transacoes} 
            onExcluir={onExcluirTransacao}
            onEditar={onEditarTransacao}
          />
        </TabsContent>
        
        <TabsContent value="graficos" className="space-y-6">
          <RelatorioCartaoCredito
            transacoes={transacoes}
            categorias={categorias}
            cicloAtual={cicloAtual}
          />
          
          <GraficoComparativoMensal
            transacoes={transacoesOriginais || transacoes}
            categorias={categorias}
          />
          
          <GraficoGastosDiarios 
            transacoes={transacoes} 
            ciclo={cicloAtual} 
            orcamentoTotal={orcamentoTotal}
          />
        </TabsContent>
      </Tabs>

      {/* Modal para mostrar detalhes das transações */}
      <TransactionDetailModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        categoria={modalState.categoria}
        ciclo={modalState.ciclo}
        transacoes={modalState.transacoes}
        totalValue={modalState.totalValue}
      />
    </>
  );
};

export default DashboardTabs;
