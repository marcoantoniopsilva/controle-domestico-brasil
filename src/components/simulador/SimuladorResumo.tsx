import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TotaisSimulacao } from "@/types/simulacao";
import { formatarMoeda } from "@/utils/financas";
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react";

interface SimuladorResumoProps {
  totais: TotaisSimulacao;
}

export function SimuladorResumo({ totais }: SimuladorResumoProps) {
  const cards = [
    {
      titulo: "Total Receitas Anuais",
      valor: totais.totalReceitas,
      icone: TrendingUp,
      cor: "text-emerald-600",
      bgCor: "bg-emerald-50"
    },
    {
      titulo: "Total Despesas Anuais",
      valor: totais.totalDespesas,
      icone: TrendingDown,
      cor: "text-rose-600",
      bgCor: "bg-rose-50"
    },
    {
      titulo: "Total Investimentos",
      valor: totais.totalInvestimentos,
      icone: PiggyBank,
      cor: "text-blue-600",
      bgCor: "bg-blue-50"
    },
    {
      titulo: "Saldo Líquido Anual",
      valor: totais.saldoLiquido,
      icone: Wallet,
      cor: totais.saldoLiquido >= 0 ? "text-emerald-600" : "text-rose-600",
      bgCor: totais.saldoLiquido >= 0 ? "bg-emerald-50" : "bg-rose-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.titulo} className="overflow-hidden">
          <CardHeader className={`pb-2 ${card.bgCor}`}>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <card.icone className={`h-4 w-4 ${card.cor}`} />
              {card.titulo}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className={`text-2xl font-bold ${card.cor}`}>
              {formatarMoeda(card.valor)}
            </p>
            {card.titulo === "Saldo Líquido Anual" && (
              <p className="text-xs text-muted-foreground mt-1">
                Média mensal: {formatarMoeda(totais.capacidadeInvestimento)}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
