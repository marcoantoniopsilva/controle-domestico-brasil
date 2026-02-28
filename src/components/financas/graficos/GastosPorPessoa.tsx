import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Transacao } from "@/types";
import { formatarMoeda } from "@/utils/financas";
import { Users } from "lucide-react";

interface GastosPorPessoaProps {
  transacoes: Transacao[];
}

const COLORS_PERSON = {
  Marco: "hsl(217, 91%, 60%)",
  Bruna: "hsl(330, 81%, 60%)",
};

const GastosPorPessoa = ({ transacoes }: GastosPorPessoaProps) => {
  const despesas = transacoes.filter(t => t.tipo === "despesa");

  const gastoMarco = despesas
    .filter(t => t.quemGastou === "Marco")
    .reduce((acc, t) => acc + Math.abs(t.valor), 0);

  const gastoBruna = despesas
    .filter(t => t.quemGastou === "Bruna")
    .reduce((acc, t) => acc + Math.abs(t.valor), 0);

  const total = gastoMarco + gastoBruna;

  const dados = [
    { name: "Marco", value: gastoMarco, color: COLORS_PERSON.Marco },
    { name: "Bruna", value: gastoBruna, color: COLORS_PERSON.Bruna },
  ].filter(d => d.value > 0);

  if (dados.length === 0) return null;

  const percentMarco = total > 0 ? ((gastoMarco / total) * 100).toFixed(0) : "0";
  const percentBruna = total > 0 ? ((gastoBruna / total) * 100).toFixed(0) : "0";

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-5 w-5 text-primary" />
          Gastos por Pessoa
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="h-52 w-52 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dados}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {dados.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatarMoeda(value)}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid hsl(var(--border))",
                    backgroundColor: "hsl(var(--card))",
                    fontSize: "13px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-muted-foreground">Total</span>
              <span className="text-sm font-bold">{formatarMoeda(total)}</span>
            </div>
          </div>

          <div className="flex-1 space-y-3 w-full">
            {/* Marco */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS_PERSON.Marco }} />
                  <span className="text-sm font-medium">Marco</span>
                </div>
                <span className="text-sm font-semibold">{formatarMoeda(gastoMarco)}</span>
              </div>
              <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${percentMarco}%`,
                    background: `linear-gradient(90deg, hsl(217, 91%, 65%), hsl(217, 91%, 50%))`,
                  }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{percentMarco}% do total</span>
            </div>

            {/* Bruna */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS_PERSON.Bruna }} />
                  <span className="text-sm font-medium">Bruna</span>
                </div>
                <span className="text-sm font-semibold">{formatarMoeda(gastoBruna)}</span>
              </div>
              <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${percentBruna}%`,
                    background: `linear-gradient(90deg, hsl(330, 81%, 65%), hsl(330, 81%, 50%))`,
                  }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{percentBruna}% do total</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GastosPorPessoa;
