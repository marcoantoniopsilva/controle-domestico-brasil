
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Categoria, CicloFinanceiro } from "@/types";
import { formatarMoeda } from "@/utils/financas";
import GraficoCategorias from "./GraficoCategorias";

interface ResumoOrcamentoProps {
  categorias: Categoria[];
  cicloAtual: CicloFinanceiro;
  totalDespesas: number;
}

const ResumoOrcamento: React.FC<ResumoOrcamentoProps> = ({ 
  categorias,
  cicloAtual,
  totalDespesas
}) => {
  // Filtramos apenas categorias de despesa para o orçamento
  const categoriasDespesa = categorias.filter(cat => cat.tipo === "despesa");
  
  // Calculamos o total do orçamento planejado
  const totalOrcamento = categoriasDespesa.reduce((acc, cat) => acc + cat.orcamento, 0);
  
  // Calculamos o percentual gasto em relação ao orçamento total (limitado a 100%)
  const percentualGasto = totalOrcamento > 0 
    ? Math.min(Math.round((totalDespesas / totalOrcamento) * 100), 100) 
    : 0;
    
  // Calculamos o valor restante (ou excedido)
  const restante = totalOrcamento - totalDespesas;

  // Filtramos para o gráfico apenas categorias que têm gastos reais
  const dados = categoriasDespesa
    .filter(cat => cat.gastosAtuais > 0)
    .map(cat => ({
      name: cat.nome,
      value: Math.abs(cat.gastosAtuais)
    }));

  // Definimos a classe de estilo baseada no percentual gasto
  const statusClass = percentualGasto < 80 
    ? "bg-green-500"
    : percentualGasto < 100 
      ? "bg-blue-500" 
      : "bg-red-500";

  // Debug
  console.log("[ResumoOrcamento] Total de despesas:", totalDespesas);
  console.log("[ResumoOrcamento] Total de orçamento:", totalOrcamento);
  console.log("[ResumoOrcamento] Percentual gasto:", percentualGasto);
  console.log("[ResumoOrcamento] Valor restante:", restante);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Resumo do Orçamento</CardTitle>
        <div className="text-sm text-muted-foreground mt-1">
          Ciclo: {cicloAtual.nome}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Progresso Geral do Orçamento</span>
              <span className="text-sm font-medium">{percentualGasto}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-200">
              <div
                className={`h-2 rounded-full transition-all ${statusClass}`}
                style={{ width: `${percentualGasto}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm">
              <span>Gasto: {formatarMoeda(totalDespesas)}</span>
              <span className="text-muted-foreground">
                Orçamento: {formatarMoeda(totalOrcamento)}
              </span>
            </div>
            <div className="mt-1 text-sm text-right">
              <span className={restante >= 0 ? "text-primary" : "text-destructive"}>
                {restante >= 0 
                  ? `Restante: ${formatarMoeda(restante)}` 
                  : `Excedido: ${formatarMoeda(Math.abs(restante))}`
                }
              </span>
            </div>
          </div>
          
          <GraficoCategorias dados={dados} />
        </div>
      </CardContent>
    </Card>
  );
};

export default ResumoOrcamento;
