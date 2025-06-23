
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transacao, Categoria } from "@/types";
import { TrendingUp } from "lucide-react";
import { processFinancialData, filterAndSortCycles } from "./dataProcessing";
import FinancialTable from "./FinancialTable";
import TableLegend from "./TableLegend";
import EmptyState from "./EmptyState";
import TransactionDetailModal from "./TransactionDetailModal";
import { useTransactionFiltering } from "./useTransactionFiltering";

interface GraficoComparativoMensalProps {
  transacoes: Transacao[];
  categorias: Categoria[];
}

const GraficoComparativoMensal = ({ transacoes, categorias }: GraficoComparativoMensalProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedCycle, setSelectedCycle] = useState<string>("");
  const [selectedValue, setSelectedValue] = useState<number>(0);
  
  console.log("[GraficoComparativo] Recebidas", transacoes.length, "transações para processamento");
  console.log("[GraficoComparativo] Transações de despesa disponíveis:", transacoes.filter(t => t.tipo === "despesa").length);
  
  // Hook para filtrar transações
  const { getTransactionsForCategoryAndCycle } = useTransactionFiltering(transacoes);
  
  // Processar dados financeiros
  const { dadosTabela, categoriasDespesa } = processFinancialData(transacoes, categorias);

  // Filtrar apenas categorias de despesa que têm dados para mostrar
  const categoriasComDados = categoriasDespesa.filter(cat => 
    dadosTabela.some(ciclo => (ciclo[cat.nome] as number) > 0)
  );

  // Filtrar e ordenar ciclos - agora mostra apenas ciclos com dados
  const { ciclosFiltrados } = filterAndSortCycles(dadosTabela);

  console.log("[GraficoComparativo] Categorias de despesa com dados:", categoriasComDados.map(c => c.nome));
  console.log("[GraficoComparativo] Ciclos com dados encontrados:", ciclosFiltrados.map(c => c.ciclo));
  
  // Log dos totais de cada ciclo para comparação
  ciclosFiltrados.forEach(ciclo => {
    const totalCiclo = categoriasDespesa.reduce((acc, cat) => acc + ((ciclo[cat.nome] as number) || 0), 0);
    console.log(`[GraficoComparativo] TOTAL do ciclo ${ciclo.ciclo}: R$ ${totalCiclo.toFixed(2)}`);
  });

  // Handler para abrir o modal com detalhes das transações
  const handleCellClick = (categoria: string, ciclo: string, valor: number) => {
    console.log(`[GraficoComparativo] Clique na célula: ${categoria} - ${ciclo} - R$ ${valor.toFixed(2)}`);
    setSelectedCategory(categoria);
    setSelectedCycle(ciclo);
    setSelectedValue(valor);
    setModalOpen(true);
  };

  // Obter transações filtradas para o modal
  const selectedTransactions = modalOpen 
    ? getTransactionsForCategoryAndCycle(selectedCategory, selectedCycle)
    : [];

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Evolução por Ciclo Financeiro
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Gastos por categoria nos ciclos financeiros (clique nos valores para ver detalhes)
          </p>
        </CardHeader>
        <CardContent>
          {categoriasComDados.length > 0 && ciclosFiltrados.length > 0 ? (
            <>
              <FinancialTable 
                categoriasDespesa={categoriasDespesa}
                ciclosFiltrados={ciclosFiltrados}
                onCellClick={handleCellClick}
              />
              <TableLegend />
            </>
          ) : (
            <EmptyState />
          )}
        </CardContent>
      </Card>

      <TransactionDetailModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        categoria={selectedCategory}
        ciclo={selectedCycle}
        transacoes={selectedTransactions}
        totalValue={selectedValue}
      />
    </>
  );
};

export default GraficoComparativoMensal;
