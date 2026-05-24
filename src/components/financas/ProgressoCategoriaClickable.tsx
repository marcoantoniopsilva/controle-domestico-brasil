import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Categoria, CicloFinanceiro } from "@/types";
import { formatarMoeda } from "@/utils/financas";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { getCategoryIcon } from "@/utils/categoryIcons";
import { getBudgetProgressColor } from "@/utils/budgetColors";

interface ProgressoCategoriaClickableProps {
  categoria: Categoria;
  cicloAtual: CicloFinanceiro;
  onClick?: (categoria: string, ciclo: string, valor: number) => void;
}

const ProgressoCategoriaClickable = ({ 
  categoria, 
  cicloAtual,
  onClick 
}: ProgressoCategoriaClickableProps) => {
  const percentualReal = categoria.orcamento > 0 
    ? Math.round((categoria.gastosAtuais / categoria.orcamento) * 100)
    : 0;
  const percentual = Math.min(percentualReal, 100);
    
  const restante = categoria.orcamento - categoria.gastosAtuais;
  const isOverBudget = categoria.gastosAtuais > categoria.orcamento;
  
  // Determinar cor baseada no tipo e status
  const getProgressColor = () => {
    if (categoria.tipo === "receita") {
      return "bg-green-500";
    }
    return getBudgetProgressColor(percentualReal);
  };
  
  const getIcon = () => {
    if (categoria.tipo === "receita") {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    }
    
    if (isOverBudget) {
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
    
    return <TrendingDown className="h-4 w-4 text-primary" />;
  };

  const handleClick = () => {
    if (categoria.gastosAtuais > 0 && onClick) {
      onClick(categoria.nome, cicloAtual.nome, categoria.gastosAtuais);
    }
  };

  const CategoryIcon = getCategoryIcon(categoria.nome);
  const hasBar = (categoria.tipo === "despesa") || (categoria.tipo === "receita" && categoria.orcamento > 0);
  const barColorClass = getProgressColor();

  return (
    <div
      className={`bg-card rounded-2xl shadow-card p-4 md:p-5 transition-all ${
        categoria.gastosAtuais > 0 && onClick
          ? "cursor-pointer hover:shadow-elevated hover:-translate-y-0.5"
          : ""
      }`}
      onClick={handleClick}
      title={categoria.gastosAtuais > 0 ? "Clique para ver as transações" : undefined}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <CategoryIcon className="h-4 w-4 text-foreground/70" />
          </div>
          <span className="truncate text-sm font-medium">{categoria.nome}</span>
        </div>
        {getIcon()}
      </div>

      <div className="flex items-baseline justify-between mb-2">
        <span className="text-lg font-semibold tabular-nums">
          {formatarMoeda(categoria.gastosAtuais)}
        </span>
        {categoria.tipo !== "investimento" && categoria.orcamento > 0 && (
          <span className="text-xs text-muted-foreground tabular-nums">
            / {formatarMoeda(categoria.orcamento)}
          </span>
        )}
      </div>

      {hasBar && categoria.orcamento > 0 && (
        <>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full ${barColorClass} transition-all rounded-full`}
              style={{ width: `${percentual}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-xs">
            <span className="text-muted-foreground">
              {percentualReal}% {categoria.tipo === "receita" ? "da meta" : "do orçamento"}
            </span>
            {categoria.tipo === "despesa" && (
              <span className={isOverBudget ? "text-destructive font-medium" : "text-muted-foreground"}>
                {isOverBudget
                  ? `Excedido ${formatarMoeda(Math.abs(restante))}`
                  : `Restam ${formatarMoeda(restante)}`}
              </span>
            )}
            {categoria.tipo === "receita" && (
              <span className={categoria.gastosAtuais >= categoria.orcamento ? "text-primary font-medium" : "text-amber-600"}>
                {categoria.gastosAtuais >= categoria.orcamento ? "Meta atingida" : `Faltam ${formatarMoeda(categoria.orcamento - categoria.gastosAtuais)}`}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ProgressoCategoriaClickable;
