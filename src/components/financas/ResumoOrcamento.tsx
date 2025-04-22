
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Categoria } from "@/types";
import { formatarMoeda } from "@/utils/financas";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface ResumoOrcamentoProps {
  categorias: Categoria[];
}

const ResumoOrcamento: React.FC<ResumoOrcamentoProps> = ({ categorias }) => {
  const totalOrcamento = categorias.reduce((acc, cat) => acc + cat.orcamento, 0);
  const totalGasto = categorias.reduce((acc, cat) => acc + cat.gastosAtuais, 0);

  const percentualGasto = totalOrcamento > 0 
    ? Math.min(Math.round((totalGasto / totalOrcamento) * 100), 100) 
    : 0;

  const statusClass = percentualGasto < 80 
    ? "bg-green-500"
    : percentualGasto < 100 
      ? "bg-blue-500" 
      : "bg-red-500";

  const restante = totalOrcamento - totalGasto;

  // Dados para o gráfico de pizza
  const dados = categorias
    .filter(cat => cat.gastosAtuais > 0)
    .map(cat => ({
      name: cat.nome,
      value: Math.abs(cat.gastosAtuais)
    }));

  const CORES = [
    "#10B981", "#3B82F6", "#EC4899", "#8B5CF6", 
    "#F59E0B", "#6366F1", "#EF4444", "#14B8A6",
    "#D97706", "#84CC16", "#7C3AED", "#F43F5E"
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Resumo do Orçamento</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Progresso Geral do Orçamento</span>
              <span className="text-sm font-medium">{percentualGasto}%</span>
            </div>
            <div className={`h-2 w-full rounded-full ${statusClass}`}>
              <div
                className="h-2 rounded-full transition-all"
                style={{ width: `${percentualGasto}%`, backgroundColor: "rgba(255,255,255,0.70)" }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm">
              <span>Gasto: {formatarMoeda(totalGasto)}</span>
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
          
          {dados.length > 0 && (
            <div className="h-80 mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dados}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dados.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatarMoeda(Number(value))} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ResumoOrcamento;
