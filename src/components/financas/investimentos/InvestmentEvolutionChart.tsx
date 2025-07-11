
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Transacao } from "@/types";
import { calcularEvolucaoInvestimentos, formatarMoedaInvestimento, coresInvestimentos } from "@/utils/investimentos";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface InvestmentEvolutionChartProps {
  transacoes: Transacao[];
}

const InvestmentEvolutionChart: React.FC<InvestmentEvolutionChartProps> = ({ transacoes }) => {
  const [periodo, setPeriodo] = useState<'semana' | 'mes' | 'semestre' | 'ano'>('mes');
  const [tipoGrafico, setTipoGrafico] = useState<'barras' | 'pizza'>('barras');

  const evolucaoData = calcularEvolucaoInvestimentos(transacoes, periodo);
  
  const chartConfig = {
    totalInvestido: { label: "Total Investido", color: "#3b82f6" },
    totalGanhos: { label: "Ganhos/Perdas", color: "#22c55e" },
    saldoTotal: { label: "Saldo Total", color: "#8b5cf6" }
  };

  const periodosMap = {
    semana: "Última Semana",
    mes: "Último Mês", 
    semestre: "Último Semestre",
    ano: "Último Ano"
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <CardTitle>Evolução dos Investimentos</CardTitle>
          <div className="flex space-x-2">
            <Select value={periodo} onValueChange={(value: any) => setPeriodo(value)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semana">Última Semana</SelectItem>
                <SelectItem value="mes">Último Mês</SelectItem>
                <SelectItem value="semestre">Último Semestre</SelectItem>
                <SelectItem value="ano">Último Ano</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={tipoGrafico} onValueChange={(value: any) => setTipoGrafico(value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="barras">Barras</SelectItem>
                <SelectItem value="pizza">Pizza</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {evolucaoData.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p>Nenhum investimento encontrado para o período selecionado</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-64">
            {tipoGrafico === 'barras' ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={evolucaoData}>
                  <XAxis 
                    dataKey="categoria" 
                    tick={{ fontSize: 12 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ChartTooltip 
                    content={
                      <ChartTooltipContent 
                        formatter={(value, name) => [
                          formatarMoedaInvestimento(Number(value)), 
                          name
                        ]}
                      />
                    }
                  />
                  <Bar 
                    dataKey="totalInvestido" 
                    name="Total Investido"
                    fill="var(--color-totalInvestido)" 
                  />
                  <Bar 
                    dataKey="totalGanhos" 
                    name="Ganhos/Perdas"
                    fill="var(--color-totalGanhos)" 
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={evolucaoData.filter(item => item.saldoTotal > 0)}
                    dataKey="saldoTotal"
                    nameKey="categoria"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({categoria, percentualGanho}) => `${categoria}: ${percentualGanho.toFixed(1)}%`}
                  >
                    {evolucaoData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={coresInvestimentos[entry.categoria as keyof typeof coresInvestimentos] || "#8884d8"} 
                      />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    content={
                      <ChartTooltipContent 
                        formatter={(value, name) => [
                          formatarMoedaInvestimento(Number(value)), 
                          "Saldo Total"
                        ]}
                      />
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartContainer>
        )}
        
        {evolucaoData.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Resumo - {periodosMap[periodo]}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              {evolucaoData.map((item, index) => (
                <div key={index} className="p-3 rounded-lg border bg-card">
                  <div className="font-medium">{item.categoria}</div>
                  <div className="text-muted-foreground">
                    Investido: {formatarMoedaInvestimento(item.totalInvestido)}
                  </div>
                  <div className={`font-medium ${item.totalGanhos >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Ganhos: {formatarMoedaInvestimento(item.totalGanhos)}
                  </div>
                  <div className={`text-sm ${item.percentualGanho >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.percentualGanho.toFixed(2)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InvestmentEvolutionChart;
