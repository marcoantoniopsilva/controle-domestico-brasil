
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
  console.log("[GraficoComparativo] Recebidas", transacoes.length, "transações para processamento");
  console.log("[GraficoComparativo] Transações de despesa disponíveis:", transacoes.filter(t => t.tipo === "despesa").length);
  
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Evolução por Ciclo Financeiro
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Gastos por categoria nos ciclos financeiros (apenas ciclos com dados)
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
