
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Transacao, Categoria } from "@/types";
import { formatarMoeda } from "@/utils/financas";
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TrendingUp } from "lucide-react";

interface GraficoComparativoMensalProps {
  transacoes: Transacao[];
  categorias: Categoria[];
}

const CORES_CATEGORIAS = [
  "#3B82F6", "#EF4444", "#10B981", "#F59E0B", 
  "#8B5CF6", "#EC4899", "#6366F1", "#14B8A6",
  "#D97706", "#84CC16", "#7C3AED", "#F43F5E"
];

const GraficoComparativoMensal = ({ transacoes, categorias }: GraficoComparativoMensalProps) => {
  // Gerar últimos 6 meses
  const hoje = new Date();
  const seiseMesesAtras = subMonths(hoje, 5);
  const meses = eachMonthOfInterval({
    start: seiseMesesAtras,
    end: hoje
  });

  // Preparar dados para o gráfico
  const dadosGrafico = meses.map(mes => {
    const inicioMes = startOfMonth(mes);
    const fimMes = endOfMonth(mes);
    
    // Filtrar transações do mês
    const transacoesMes = transacoes.filter(t => {
      const dataTransacao = new Date(t.data);
      return dataTransacao >= inicioMes && dataTransacao <= fimMes;
    });

    // Calcular total por categoria para este mês
    const dadosMes: any = {
      mes: format(mes, "MMM/yyyy", { locale: ptBR }),
      mesCompleto: format(mes, "MMMM 'de' yyyy", { locale: ptBR })
    };

    // Adicionar total por categoria
    categorias.forEach(categoria => {
      const totalCategoria = transacoesMes
        .filter(t => t.categoria === categoria.nome)
        .reduce((acc, t) => acc + Math.abs(t.valor), 0);
      
      dadosMes[categoria.nome] = totalCategoria;
    });

    return dadosMes;
  });

  // Filtrar apenas categorias que têm dados para mostrar
  const categoriasComDados = categorias.filter(cat => 
    dadosGrafico.some(mes => mes[cat.nome] > 0)
  );

  // Função para formatar tooltip
  const formatTooltip = (value: number, name: string) => [
    formatarMoeda(value),
    name
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Evolução Mensal por Categoria
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Comparação dos gastos de cada categoria nos últimos 6 meses
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dadosGrafico}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="mes" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tickFormatter={(value) => `R$ ${value}`}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={formatTooltip}
                labelFormatter={(label) => {
                  const item = dadosGrafico.find(d => d.mes === label);
                  return item ? item.mesCompleto : label;
                }}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px'
                }}
              />
              <Legend />
              
              {categoriasComDados.map((categoria, index) => (
                <Line
                  key={categoria.nome}
                  type="monotone"
                  dataKey={categoria.nome}
                  stroke={CORES_CATEGORIAS[index % CORES_CATEGORIAS.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Resumo das categorias */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categoriasComDados.map((categoria, index) => {
            const totalCategoria = dadosGrafico.reduce((acc, mes) => acc + mes[categoria.nome], 0);
            const mediaCategoria = totalCategoria / dadosGrafico.length;
            
            return (
              <div key={categoria.nome} className="bg-slate-50 p-3 rounded-lg border">
                <div className="flex items-center gap-2 mb-1">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: CORES_CATEGORIAS[index % CORES_CATEGORIAS.length] }}
                  />
                  <span className="text-sm font-medium">{categoria.nome}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  <div>Total: {formatarMoeda(totalCategoria)}</div>
                  <div>Média: {formatarMoeda(mediaCategoria)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default GraficoComparativoMensal;
