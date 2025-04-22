
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Categoria } from "@/types";
import { formatarMoeda } from "@/utils/financas";
import { cn } from "@/lib/utils"; // Import cn utility

interface ProgressoCategoriaProps {
  categoria: Categoria;
}

const ProgressoCategoria: React.FC<ProgressoCategoriaProps> = ({ categoria }) => {
  const percentual = categoria.orcamento > 0 
    ? Math.min(Math.round((categoria.gastosAtuais / categoria.orcamento) * 100), 100) 
    : 0;
  
  // Define CSS classes based on percentage
  const statusClass = percentual < 80 
    ? "bg-green-500" 
    : percentual < 100 
      ? "bg-blue-500" 
      : "bg-red-500";

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
        />
        <style jsx>{`
          :global(.h-2 [data-state="complete"]) {
            ${statusClass === "bg-green-500" ? "background-color: rgb(34, 197, 94);" : 
              statusClass === "bg-blue-500" ? "background-color: rgb(59, 130, 246);" : 
              "background-color: rgb(239, 68, 68);"}
          }
        `}</style>
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
