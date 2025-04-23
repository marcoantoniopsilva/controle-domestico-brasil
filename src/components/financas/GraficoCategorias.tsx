
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { formatarMoeda } from "@/utils/financas";
import { Categoria } from "@/types";

interface GraficoCategoriasProps {
  dados: Array<{
    name: string;
    value: number;
  }>;
}

const CORES = [
  "#10B981", "#3B82F6", "#EC4899", "#8B5CF6", 
  "#F59E0B", "#6366F1", "#EF4444", "#14B8A6",
  "#D97706", "#84CC16", "#7C3AED", "#F43F5E"
];

const GraficoCategorias: React.FC<GraficoCategoriasProps> = ({ dados }) => {
  if (dados.length === 0) return null;

  return (
    <div className="h-80 mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={dados}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {dados.map((_, index) => (
              <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatarMoeda(Number(value))} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraficoCategorias;
