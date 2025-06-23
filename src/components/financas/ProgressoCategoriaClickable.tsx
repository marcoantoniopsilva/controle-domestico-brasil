
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Categoria, CicloFinanceiro } from "@/types";
import { formatarMoeda } from "@/utils/financas";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

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
  const percentual = categoria.orcamento > 0 
    ? Math.min((categoria.gastosAtuais / categoria.orcamento) * 100, 100)
    : 0;
    
  const restante = categoria.orcamento - categoria.gastosAtuais;
  const isOverBudget = categoria.gastosAtuais > categoria.orcamento;
  
  // Determinar cor baseada no tipo e status
  const getProgressColor = () => {
    if (categoria.tipo === "receita") {
      return "bg-green-500";
    }
    
    if (isOverBudget) return "bg-red-500";
    if (percentual >= 80) return "bg-amber-500";
    return "bg-primary";
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

  return (
    <Card 
      className={`transition-all duration-200 ${
        categoria.gastosAtuais > 0 && onClick 
          ? 'cursor-pointer hover:shadow-md hover:scale-[1.02] border-primary/20' 
          : ''
      }`}
      onClick={handleClick}
      title={categoria.gastosAtuais > 0 ? "Clique para ver as transações" : undefined}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="truncate">{categoria.nome}</span>
          {getIcon()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">
            {categoria.tipo === "receita" ? "Recebido" : "Gasto"}
          </span>
          <span className="font-medium">
            {formatarMoeda(categoria.gastosAtuais)}
          </span>
        </div>
        
        {categoria.tipo === "despesa" && (
          <>
            <Progress 
              value={percentual} 
              className="h-2"
              style={{
                ['--progress-color' as string]: getProgressColor()
              }}
            />
            
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Orçamento</span>
              <span className="font-medium">{formatarMoeda(categoria.orcamento)}</span>
            </div>
            
            <div className="text-xs text-center">
              {isOverBudget ? (
                <span className="text-red-600 font-medium">
                  Excedido: {formatarMoeda(Math.abs(restante))}
                </span>
              ) : (
                <span className="text-muted-foreground">
                  Restante: {formatarMoeda(restante)}
                </span>
              )}
            </div>
          </>
        )}
        
        {categoria.tipo === "receita" && categoria.orcamento > 0 && (
          <>
            <Progress 
              value={percentual} 
              className="h-2"
              style={{
                ['--progress-color' as string]: getProgressColor()
              }}
            />
            
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Meta</span>
              <span className="font-medium">{formatarMoeda(categoria.orcamento)}</span>
            </div>
            
            <div className="text-xs text-center">
              <span className={`font-medium ${
                categoria.gastosAtuais >= categoria.orcamento ? 'text-green-600' : 'text-amber-600'
              }`}>
                {categoria.gastosAtuais >= categoria.orcamento ? 'Meta atingida!' : 
                 `Faltam: ${formatarMoeda(categoria.orcamento - categoria.gastosAtuais)}`}
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ProgressoCategoriaClickable;
