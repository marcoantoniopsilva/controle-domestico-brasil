
import { formatarMoeda } from "@/utils/financas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, TrendingUp, TrendingDown } from "lucide-react";

interface SummaryCardsProps {
  totalReceitas: number;
  totalDespesasCategoria: number;
  saldoReal: number;
}

const SummaryCards = ({ totalReceitas, totalDespesasCategoria, saldoReal }: SummaryCardsProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Receitas do Ciclo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-primary">
            {formatarMoeda(totalReceitas)}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-destructive" />
            Despesas do Ciclo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-destructive">
            {formatarMoeda(totalDespesasCategoria)}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <PieChart className="h-5 w-5 text-slate-700" />
            Saldo do Ciclo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-3xl font-bold ${saldoReal >= 0 ? "text-primary" : "text-destructive"}`}>
            {formatarMoeda(saldoReal)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryCards;
