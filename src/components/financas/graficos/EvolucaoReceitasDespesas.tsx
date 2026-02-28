import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Transacao } from "@/types";
import { formatarMoeda } from "@/utils/financas";
import { TrendingUp } from "lucide-react";
import { gerarCiclosFinanceiros } from "@/utils/ciclosFinanceiros";
import { filtrarPorCiclo, calcularTotalReceitas, calcularTotalDespesas } from "@/utils/calculosFinanceiros";

interface EvolucaoReceitasDespesasProps {
  transacoes: Transacao[];
}

const EvolucaoReceitasDespesas = ({ transacoes }: EvolucaoReceitasDespesasProps) => {
  const hoje = new Date();
  const ciclos = gerarCiclosFinanceiros(transacoes)
    .filter(c => c.temTransacoes && c.fim < hoje) // apenas ciclos já encerrados
    .sort((a, b) => a.inicio.getTime() - b.inicio.getTime())
    .slice(-8);

  if (ciclos.length < 2) return null;

  const dados = ciclos.map(ciclo => {
    const transacoesCiclo = filtrarPorCiclo(transacoes, ciclo);
    return {
      ciclo: ciclo.nome.split(" ")[0], // abreviado
      Receitas: calcularTotalReceitas(transacoesCiclo),
      Despesas: calcularTotalDespesas(transacoesCiclo),
    };
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-5 w-5 text-primary" />
          Evolução Receitas vs Despesas
        </CardTitle>
        <p className="text-xs text-muted-foreground">Últimos ciclos financeiros</p>
      </CardHeader>
      <CardContent>
        <div className="h-72 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dados}>
              <defs>
                <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 72%, 40%)" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="hsl(142, 72%, 40%)" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis
                dataKey="ciclo"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={55}
              />
              <Tooltip
                formatter={(value: number, name: string) => [formatarMoeda(value), name]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid hsl(var(--border))",
                  backgroundColor: "hsl(var(--card))",
                  fontSize: "13px",
                }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: "13px" }}
              />
              <Area
                type="monotone"
                dataKey="Receitas"
                stroke="hsl(142, 72%, 40%)"
                strokeWidth={2.5}
                fill="url(#colorReceitas)"
                dot={{ r: 4, fill: "hsl(142, 72%, 40%)", strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
              <Area
                type="monotone"
                dataKey="Despesas"
                stroke="hsl(0, 84%, 60%)"
                strokeWidth={2.5}
                fill="url(#colorDespesas)"
                dot={{ r: 4, fill: "hsl(0, 84%, 60%)", strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default EvolucaoReceitasDespesas;
