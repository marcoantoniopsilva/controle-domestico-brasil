
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
import PrevisaoFechamentoCiclo from "../relatorios/PrevisaoFechamentoCiclo";
import RelatorioParcelamentos from "../relatorios/RelatorioParcelamentos";
import TendenciasInsights from "../relatorios/TendenciasInsights";
import RelatorioEconomia from "../relatorios/RelatorioEconomia";
import ReceitasDespesas from "../relatorios/ReceitasDespesas";
import AnaliseRecorrencias from "../relatorios/AnaliseRecorrencias";
import { useTransactionsByCategory } from "@/hooks/useTransactionsByCategory";

interface DashboardTabsProps {
  transacoes: Transacao[];
  transacoesOriginais?: Transacao[];
  categorias: Categoria[];
  cicloAtual: CicloFinanceiro;
  onExcluirTransacao: (id: string) => Promise<void>;
  onEditarTransacao?: (id: string, transacao: Omit<Transacao, "id">) => Promise<void>;
  totalDespesasCategoria: number;
  totalReceitas: number;
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
  totalReceitas,
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
        <TabsList className="w-full h-auto flex flex-wrap justify-start gap-1 p-1">
          <TabsTrigger value="resumo" className="text-xs md:text-sm px-2 md:px-3 py-1.5">Resumo</TabsTrigger>
          <TabsTrigger value="despesas" className="text-xs md:text-sm px-2 md:px-3 py-1.5">Despesas</TabsTrigger>
          <TabsTrigger value="receitas" className="text-xs md:text-sm px-2 md:px-3 py-1.5">Receitas</TabsTrigger>
          <TabsTrigger value="investimentos" className="text-xs md:text-sm px-2 md:px-3 py-1.5">Investimentos</TabsTrigger>
          <TabsTrigger value="transacoes" className="text-xs md:text-sm px-2 md:px-3 py-1.5">Transações</TabsTrigger>
          <TabsTrigger value="graficos" className="text-xs md:text-sm px-2 md:px-3 py-1.5">Gráficos</TabsTrigger>
          <TabsTrigger value="relatorios" className="text-xs md:text-sm px-2 md:px-3 py-1.5">Relatórios</TabsTrigger>
        </TabsList>
        
        <TabsContent value="resumo" className="space-y-4">
          <ResumoOrcamento 
            categorias={categorias} 
            cicloAtual={cicloAtual}
            totalDespesas={totalDespesasCategoria}
            totalReceitas={totalReceitas}
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

        <TabsContent value="relatorios" className="space-y-4">
          <Accordion type="single" collapsible className="w-full space-y-2">
            <AccordionItem value="previsao" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                Previsão de Fechamento do Ciclo
              </AccordionTrigger>
              <AccordionContent>
                <PrevisaoFechamentoCiclo
                  transacoes={transacoes}
                  cicloAtual={cicloAtual}
                  orcamentoTotal={orcamentoTotal}
                />
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="receitas-despesas" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                Receitas vs Despesas
              </AccordionTrigger>
              <AccordionContent>
                <ReceitasDespesas
                  transacoes={transacoes}
                  cicloAtual={cicloAtual}
                />
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="economia" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                Relatório de Economia
              </AccordionTrigger>
              <AccordionContent>
                <RelatorioEconomia
                  transacoes={transacoes}
                  categorias={categorias}
                  cicloAtual={cicloAtual}
                  orcamentoTotal={orcamentoTotal}
                />
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="tendencias" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                Tendências e Insights
              </AccordionTrigger>
              <AccordionContent>
                <TendenciasInsights
                  transacoes={transacoesOriginais || transacoes}
                  categorias={categorias}
                  cicloAtual={cicloAtual}
                />
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="parcelamentos" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                Relatório de Parcelamentos
              </AccordionTrigger>
              <AccordionContent>
                <RelatorioParcelamentos
                  transacoes={transacoesOriginais || transacoes}
                />
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="recorrencias" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                Análise de Recorrências
              </AccordionTrigger>
              <AccordionContent>
                <AnaliseRecorrencias
                  transacoes={transacoesOriginais || transacoes}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
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
