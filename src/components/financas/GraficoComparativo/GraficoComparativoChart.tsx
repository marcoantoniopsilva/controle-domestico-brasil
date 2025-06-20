
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Categoria } from "@/types";
import { formatarMoeda } from "@/utils/financas";
import { CORES_CATEGORIAS } from "./constants";
import { DadosCiclo } from "./types";

interface GraficoComparativoChartProps {
  dadosGrafico: DadosCiclo[];
  categoriasComDados: Categoria[];
}

const GraficoComparativoChart = ({ dadosGrafico, categoriasComDados }: GraficoComparativoChartProps) => {
  // Função para formatar tooltip
  const formatTooltip = (value: number, name: string) => [
    formatarMoeda(value),
    name
  ];

  return (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={dadosGrafico}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="ciclo" 
            tick={{ fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            tickFormatter={(value) => `R$ ${value.toLocaleString()}`}
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            formatter={formatTooltip}
            labelFormatter={(label) => {
              const item = dadosGrafico.find(d => d.ciclo === label);
              return item ? item.cicloCompleto : label;
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
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraficoComparativoChart;
