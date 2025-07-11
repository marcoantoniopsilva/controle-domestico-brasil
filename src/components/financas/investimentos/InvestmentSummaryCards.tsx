
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transacao } from "@/types";
import { formatarMoedaInvestimento } from "@/utils/investimentos";
import { TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";

interface InvestmentSummaryCardsProps {
  transacoes: Transacao[];
}

const InvestmentSummaryCards: React.FC<InvestmentSummaryCardsProps> = ({ transacoes }) => {
  const investimentos = transacoes.filter(t => t.tipo === 'investimento');
  
  const totalInvestido = investimentos.reduce((acc, inv) => acc + Math.abs(inv.valor), 0);
  const totalGanhos = investimentos.reduce((acc, inv) => acc + (inv.ganhos || 0), 0);
  const saldoTotal = totalInvestido + totalGanhos;
  const percentualGanho = totalInvestido > 0 ? (totalGanhos / totalInvestido) * 100 : 0;

  const cards = [
    {
      title: "Total Investido",
      value: formatarMoedaInvestimento(totalInvestido),
      icon: DollarSign,
      color: "text-blue-600"
    },
    {
      title: "Ganhos/Perdas",
      value: formatarMoedaInvestimento(totalGanhos),
      icon: totalGanhos >= 0 ? TrendingUp : TrendingDown,
      color: totalGanhos >= 0 ? "text-green-600" : "text-red-600"
    },
    {
      title: "Saldo Total",
      value: formatarMoedaInvestimento(saldoTotal),
      icon: PieChart,
      color: "text-purple-600"
    },
    {
      title: "Rentabilidade",
      value: `${percentualGanho.toFixed(2)}%`,
      icon: percentualGanho >= 0 ? TrendingUp : TrendingDown,
      color: percentualGanho >= 0 ? "text-green-600" : "text-red-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.color}`}>
                {card.value}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default InvestmentSummaryCards;
