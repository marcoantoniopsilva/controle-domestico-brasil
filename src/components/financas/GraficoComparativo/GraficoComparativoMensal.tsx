
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transacao, Categoria } from "@/types";
import { TrendingUp } from "lucide-react";
import { processFinancialData, filterAndSortCycles } from "./dataProcessing";
import FinancialTable from "./FinancialTable";
import TableLegend from "./TableLegend";
import EmptyState from "./EmptyState";

interface GraficoComparativoMensalProps {
  transacoes: Transacao[];
  categorias: Categoria[];
}

const GraficoComparativoMensal = ({ transacoes, categorias }: GraficoComparativoMensalProps) => {
  // Processar dados financeiros
  const { dadosTabela, categoriasDespesa } = processFinancialData(transacoes, categorias);

  // Filtrar apenas categorias de despesa que têm dados para mostrar
  const categoriasComDados = categoriasDespesa.filter(cat => 
    dadosTabela.some(ciclo => (ciclo[cat.nome] as number) > 0)
  );

  // Filtrar e ordenar ciclos
  const { ciclosFiltrados } = filterAndSortCycles(dadosTabela);

  console.log("[GraficoComparativo] Categorias de despesa com dados:", categoriasComDados.map(c => c.nome));
  console.log("[GraficoComparativo] Ciclos filtrados e ordenados:", ciclosFiltrados.map(c => c.ciclo));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Evolução por Ciclo Financeiro
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Gastos por categoria nos ciclos financeiros (a partir de março 2025)
        </p>
      </CardHeader>
      <CardContent>
        {categoriasComDados.length > 0 && ciclosFiltrados.length > 0 ? (
          <>
            <FinancialTable 
              categoriasDespesa={categoriasDespesa}
              ciclosFiltrados={ciclosFiltrados}
            />
            <TableLegend />
          </>
        ) : (
          <EmptyState />
        )}
      </CardContent>
    </Card>
  );
};

export default GraficoComparativoMensal;
