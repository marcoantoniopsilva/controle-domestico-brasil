
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Categoria, CicloFinanceiro } from "@/types";
import { formatarMoeda } from "@/utils/financas";
import GraficoCategorias from "./GraficoCategorias";

interface ResumoOrcamentoProps {
  categorias: Categoria[];
  cicloAtual: CicloFinanceiro;
  totalDespesas: number; // Adicionando totalDespesas como prop
}

const ResumoOrcamento: React.FC<ResumoOrcamentoProps> = ({ 
  categorias,
  cicloAtual,
  totalDespesas
}) => {
  // Filtramos apenas categorias de despesa para o orçamento
  const categoriasDespesa = categorias.filter(cat => cat.tipo === "despesa");
  
  const totalOrcamento = categoriasDespesa.reduce((acc, cat) => acc + cat.orcamento, 0);
  // Usamos o totalDespesas passado como prop em vez de recalcular
  
  const percentualGasto = totalOrcamento > 0 
    ? Math.min(Math.round((totalDespesas / totalOrcamento) * 100), 100) 
    : 0;
  const restante = totalOrcamento - totalDespesas;

  const dados = categoriasDespesa
    .filter(cat => cat.gastosAtuais > 0)
    .map(cat => ({
      name: cat.nome,
      value: Math.abs(cat.gastosAtuais)
    }));

  const statusClass = percentualGasto < 80 
    ? "bg-green-500"
    : percentualGasto < 100 
      ? "bg-blue-500" 
      : "bg-red-500";

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
