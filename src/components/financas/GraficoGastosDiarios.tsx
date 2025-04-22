
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Transacao, CicloFinanceiro } from "@/types";
import { format, eachDayOfInterval, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { calcularLimiteDiario, formatarMoeda } from "@/utils/financas";

interface GraficoGastosDiariosProps {
  transacoes: Transacao[];
  ciclo: CicloFinanceiro;
  orcamentoTotal: number;
}

const GraficoGastosDiarios: React.FC<GraficoGastosDiariosProps> = ({ 
  transacoes, 
  ciclo,
  orcamentoTotal
}) => {
  const limiteDiario = calcularLimiteDiario(ciclo, orcamentoTotal);
  
  // Gerar array com todos os dias do ciclo
  const dias = eachDayOfInterval({ 
    start: ciclo.inicio, 
    end: new Date() > ciclo.fim ? ciclo.fim : new Date() 
  });
  
  // Calcular gastos por dia
  const dadosDiarios = dias.map(dia => {
    const gastosNoDia = transacoes
      .filter(t => {
        const dataTransacao = new Date(t.data);
        return format(dataTransacao, 'yyyy-MM-dd') === format(dia, 'yyyy-MM-dd') && t.valor < 0;
      })
      .reduce((acc, t) => acc + Math.abs(t.valor), 0);
    
    const statusColor = gastosNoDia > limiteDiario ? "#EF4444" : "#3B82F6";
    
    return {
      data: format(dia, 'dd/MM'),
      gastos: gastosNoDia,
      limite: limiteDiario,
      statusColor
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
                fill={(entry: any) => entry.statusColor} 
              />
              <Bar 
                dataKey="limite" 
                name="Limite Diário" 
                fill="#10B981" 
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
