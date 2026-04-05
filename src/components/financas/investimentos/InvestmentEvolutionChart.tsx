
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transacao } from "@/types";
import { formatarMoedaInvestimento, coresInvestimentos } from "@/utils/investimentos";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface InvestmentEvolutionChartProps {
  transacoes: Transacao[];
}

const InvestmentEvolutionChart: React.FC<InvestmentEvolutionChartProps> = ({ transacoes }) => {
  const investimentos = transacoes.filter(t => t.tipo === 'investimento');

  // Agrupar por categoria - mostra distribuição atual
  const porCategoria = investimentos.reduce((acc, inv) => {
    acc[inv.categoria] = (acc[inv.categoria] || 0) + Math.abs(inv.valor);
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(porCategoria)
    .filter(([, valor]) => valor > 0)
    .map(([categoria, valor]) => ({ categoria, valor }));

  const chartConfig = {
    valor: { label: "Valor", color: "#3b82f6" },
  };

  if (chartData.length === 0) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Distribuição dos Investimentos</CardTitle>
      </CardHeader>
      <CardContent className="overflow-hidden">
        <ChartContainer
          config={chartConfig}
          className="h-64 overflow-hidden [&_.recharts-pie-label-line]:pointer-events-none [&_.recharts-pie-label-text]:pointer-events-none"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="valor"
                nameKey="categoria"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ categoria, valor }) => `${categoria}: ${formatarMoedaInvestimento(valor)}`}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={coresInvestimentos[entry.categoria as keyof typeof coresInvestimentos] || "#8884d8"} 
                  />
                ))}
              </Pie>
              <ChartTooltip 
                content={
                  <ChartTooltipContent 
                    formatter={(value) => [
                      formatarMoedaInvestimento(Number(value)), 
                      "Valor Atual"
                    ]}
                  />
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default InvestmentEvolutionChart;
