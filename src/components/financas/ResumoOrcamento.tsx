
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Categoria, CicloFinanceiro } from "@/types";
import { formatarMoeda } from "@/utils/financas";
import GraficoCategorias from "./GraficoCategorias";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingDown } from "lucide-react";

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

  // Identificar categorias com maior percentual do orçamento gasto
  const categoriasComMaiorGasto = categoriasDespesa
    .filter(cat => cat.orcamento > 0 && cat.gastosAtuais > 0)
    .sort((a, b) => (b.gastosAtuais / b.orcamento) - (a.gastosAtuais / a.orcamento))
    .slice(0, 3);

  // Sugestões de economia
  const sugestoesEconomia = restante < 0 
    ? categoriasComMaiorGasto
    : [];

  // Filtramos para o gráfico apenas categorias que têm gastos reais
  const dados = categoriasDespesa
    .filter(cat => cat.gastosAtuais > 0)
    .map(cat => ({
      name: cat.nome,
      value: cat.gastosAtuais
    }));

  // Definimos a classe de estilo baseada no percentual gasto
  const statusClass = percentualGasto < 80 
    ? "bg-green-500"
    : percentualGasto < 100 
      ? "bg-blue-500" 
      : "bg-red-500";

  console.log("[ResumoOrcamento] Total de despesas:", totalDespesas);
  console.log("[ResumoOrcamento] Total de orçamento:", totalOrcamento);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Resumo do Orçamento
        </CardTitle>
        <div className="text-sm text-muted-foreground mt-1">
          Ciclo: {cicloAtual.nome}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
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
              <span>Gastos: {formatarMoeda(totalDespesas)}</span>
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
          
          {sugestoesEconomia.length > 0 && (
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2 text-sm font-medium mb-2 text-amber-600">
                <TrendingDown className="h-4 w-4" />
                Sugestões de Economia
              </div>
              <ul className="space-y-2">
                {sugestoesEconomia.map(cat => {
                  const percentGasto = Math.round((cat.gastosAtuais / cat.orcamento) * 100);
                  const excedido = cat.gastosAtuais - cat.orcamento;
                  
                  return (
                    <li key={cat.nome} className="text-sm flex justify-between">
                      <span>{cat.nome}</span>
                      <span className="text-destructive">
                        {excedido > 0 
                          ? `+${formatarMoeda(excedido)}` 
                          : `${percentGasto}%`}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          
          <GraficoCategorias dados={dados} />
        </div>
      </CardContent>
    </Card>
  );
};

export default ResumoOrcamento;
