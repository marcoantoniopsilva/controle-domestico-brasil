
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Categoria } from "@/types";
import { formatarMoeda } from "@/utils/financas";
import { getBudgetProgressColor } from "@/utils/budgetColors";
import { AlertTriangle } from "lucide-react";

interface ProgressoCategoriaProps {
  categoria: Categoria;
}

const ProgressoCategoria: React.FC<ProgressoCategoriaProps> = ({ categoria }) => {
  // Para categorias de receita, não usamos o conceito de "percentual" pois não há um limite/orçamento
  const ehReceita = categoria.tipo === "receita";
  
  // Para despesas, calculamos o percentual gasto do orçamento
  const percentualReal = !ehReceita && categoria.orcamento > 0 
    ? Math.round((categoria.gastosAtuais / categoria.orcamento) * 100) 
    : 0;
  const percentualBarra = Math.min(percentualReal, 100);
  const isOverBudget = percentualReal >= 100;
  
  // Cores dinâmicas baseadas no percentual gasto
  const barColor = getBudgetProgressColor(percentualReal);
  
  // Para despesas, calculamos o restante do orçamento
  const restante = !ehReceita ? categoria.orcamento - categoria.gastosAtuais : 0;

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex justify-between items-center">
          <span className="truncate flex items-center gap-1">
            {categoria.nome}
            {!ehReceita && isOverBudget && <AlertTriangle className="h-3.5 w-3.5 text-red-500" />}
          </span>
          {!ehReceita && (
            <span className={`font-normal text-xs ${isOverBudget ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
              {percentualReal}%
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!ehReceita ? (
          // Visualização para categorias de despesa
          <>
            <div className="h-2 w-full rounded-full bg-slate-200">
              <div
                className={`h-2 rounded-full transition-all ${barColor}`}
                style={{ width: `${percentual}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm">
              <span>{formatarMoeda(categoria.gastosAtuais)}</span>
              <span className="text-muted-foreground">
                {formatarMoeda(categoria.orcamento)}
              </span>
            </div>
            <div className="mt-1 text-xs text-right">
              <span className={restante >= 0 ? "text-primary" : "text-destructive"}>
                {restante >= 0 
                  ? `Restante: ${formatarMoeda(restante)}` 
                  : `Excedido: ${formatarMoeda(Math.abs(restante))}`
                }
              </span>
            </div>
          </>
        ) : (
          // Visualização para categorias de receita
          <div className="py-2">
            <div className="flex justify-between text-sm">
              <span>Total recebido:</span>
              <span className="font-semibold text-primary">
                {formatarMoeda(categoria.gastosAtuais)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProgressoCategoria;
