
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatarMoeda } from "@/utils/financas";
import { TrendingUp, TrendingDown, DollarSign, PiggyBank } from "lucide-react";

interface SummaryCardsProps {
  totalReceitas: number;
  totalDespesas: number;
  totalInvestimentos?: number;
  saldo: number;
  orcamentoTotal: number;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalReceitas,
  totalDespesas,
  totalInvestimentos = 0,
  saldo,
  orcamentoTotal
}) => {
  return (
    <div className="grid gap-2 md:gap-4 grid-cols-2 lg:grid-cols-4">
      <Card className="p-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 md:p-6 pb-1 md:pb-2">
          <CardTitle className="text-xs md:text-sm font-medium">Receitas</CardTitle>
          <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
        </CardHeader>
        <CardContent className="p-3 md:p-6 pt-0">
          <div className="text-lg md:text-2xl font-bold text-green-600">
            {formatarMoeda(totalReceitas)}
          </div>
        </CardContent>
      </Card>

      <Card className="p-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 md:p-6 pb-1 md:pb-2">
          <CardTitle className="text-xs md:text-sm font-medium">Despesas</CardTitle>
          <TrendingDown className="h-3 w-3 md:h-4 md:w-4 text-red-600" />
        </CardHeader>
        <CardContent className="p-3 md:p-6 pt-0">
          <div className="text-lg md:text-2xl font-bold text-red-600">
            {formatarMoeda(totalDespesas)}
          </div>
          <p className="text-[10px] md:text-xs text-muted-foreground truncate">
            de {formatarMoeda(orcamentoTotal)} orçado
          </p>
        </CardContent>
      </Card>

      <Card className="p-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 md:p-6 pb-1 md:pb-2">
          <CardTitle className="text-xs md:text-sm font-medium">Investimentos</CardTitle>
          <PiggyBank className="h-3 w-3 md:h-4 md:w-4 text-blue-600" />
        </CardHeader>
        <CardContent className="p-3 md:p-6 pt-0">
          <div className="text-lg md:text-2xl font-bold text-blue-600">
            {formatarMoeda(totalInvestimentos)}
          </div>
        </CardContent>
      </Card>

      <Card className="p-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 md:p-6 pb-1 md:pb-2">
          <CardTitle className="text-xs md:text-sm font-medium">Saldo</CardTitle>
          <DollarSign className={`h-3 w-3 md:h-4 md:w-4 ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`} />
        </CardHeader>
        <CardContent className="p-3 md:p-6 pt-0">
          <div className={`text-lg md:text-2xl font-bold ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatarMoeda(saldo)}
          </div>
          <p className="text-[10px] md:text-xs text-muted-foreground">
            Receitas - Despesas
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryCards;
