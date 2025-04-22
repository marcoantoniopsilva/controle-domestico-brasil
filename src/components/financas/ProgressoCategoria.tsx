
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Categoria } from "@/types";
import { formatarMoeda } from "@/utils/financas";

interface ProgressoCategoriaProps {
  categoria: Categoria;
}

const ProgressoCategoria: React.FC<ProgressoCategoriaProps> = ({ categoria }) => {
  const percentual = categoria.orcamento > 0 
    ? Math.min(Math.round((categoria.gastosAtuais / categoria.orcamento) * 100), 100) 
    : 0;
  
  const statusClass = percentual < 80 
    ? "progress-green" 
    : percentual < 100 
      ? "progress-blue" 
      : "progress-red";

  const restante = categoria.orcamento - categoria.gastosAtuais;
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex justify-between items-center">
          <span className="truncate">{categoria.nome}</span>
          <span className="font-normal text-muted-foreground text-xs">
            {percentual}%
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Progress 
          value={percentual} 
          className="h-2" 
          indicatorClassName={statusClass}
        />
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
      </CardContent>
    </Card>
  );
};

export default ProgressoCategoria;
