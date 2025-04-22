import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Transacao, CicloFinanceiro } from "@/types";
import { format, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { calcularLimiteDiario, formatarMoeda } from "@/utils/financas";

interface GraficoGastosDiariosProps {
  transacoes: Transacao[];
  ciclo: CicloFinanceiro;
  orcamentoTotal: number;
}

const COLOR_NORMAL = "#3B82F6";
const COLOR_EXCESS = "#EF4444";
const COLOR_LIMIT = "#10B981";

const GraficoGastosDiarios: React.FC<GraficoGastosDiariosProps> = ({
  transacoes,
  ciclo,
  orcamentoTotal
}) => {
  const limiteDiario = calcularLimiteDiario(ciclo, orcamentoTotal);

  // dias do ciclo
  const hoje = new Date();
  const dias = eachDayOfInterval({
    start: ciclo.inicio,
    end: hoje > ciclo.fim ? ciclo.fim : hoje
  });

  const dadosDiarios = dias.map(dia => {
    const gastosNoDia = transacoes
      .filter(t => {
        const dataTransacao = new Date(t.data);
        return format(dataTransacao, 'yyyy-MM-dd') === format(dia, 'yyyy-MM-dd') && t.valor < 0;
      })
      .reduce((acc, t) => acc + Math.abs(t.valor), 0);

    return {
      data: format(dia, 'dd/MM'),
      gastos: gastosNoDia,
      limite: limiteDiario,
      excedido: gastosNoDia > limiteDiario,
    };
  });

  const formatTooltip = (value: number) => formatarMoeda(value);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Gastos Diários</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dadosDiarios} barGap={0}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="data"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => value}
              />
              <YAxis
                tickFormatter={(value) => `R$ ${value}`}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={formatTooltip}
                labelFormatter={(label) => `Dia: ${label}`}
              />
              <Bar
                dataKey="gastos"
                name="Gastos"
                radius={[4, 4, 0, 0]}
                fill={COLOR_NORMAL}
                fillOpacity={0.9}
              >
                {dadosDiarios.map((entry, index) => (
                  <Cell
                    key={`bar-cell-${index}`}
                    fill={entry.excedido ? COLOR_EXCESS : COLOR_NORMAL}
                  />
                ))}
              </Bar>
              <Bar
                dataKey="limite"
                name="Limite Diário"
                fill={COLOR_LIMIT}
                fillOpacity={0.3}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default GraficoGastosDiarios;
