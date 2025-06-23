
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Categoria } from "@/types";
import { DadosCiclo } from "./types";

interface FinancialTableProps {
  categoriasDespesa: Categoria[];
  ciclosFiltrados: DadosCiclo[];
  onCellClick?: (categoria: string, ciclo: string, valor: number) => void;
}

const FinancialTable = ({ categoriasDespesa, ciclosFiltrados, onCellClick }: FinancialTableProps) => {
  // Função para determinar a cor da célula
  const getCellColor = (valor: number, orcamento: number) => {
    if (valor === 0) return "bg-gray-50 text-gray-400";
    if (valor <= orcamento) return "bg-green-50 text-green-800 border-green-200";
    return "bg-red-50 text-red-800 border-red-200";
  };

  // Função para formatar valor em moeda
  const formatarMoeda = (valor: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[200px] font-semibold">Categoria</TableHead>
            <TableHead className="min-w-[100px] text-center font-semibold">Orçamento</TableHead>
            {ciclosFiltrados.map(ciclo => (
              <TableHead key={ciclo.ciclo} className="min-w-[120px] text-center font-semibold">
                {ciclo.ciclo}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {categoriasDespesa.map(categoria => {
            return (
              <TableRow key={categoria.nome}>
                <TableCell className="font-medium">{categoria.nome}</TableCell>
                <TableCell className="text-center text-sm text-muted-foreground">
                  {formatarMoeda(categoria.orcamento)}
                </TableCell>
                {ciclosFiltrados.map(ciclo => {
                  const valor = (ciclo[categoria.nome] as number) || 0;
                  const colorClass = getCellColor(valor, categoria.orcamento);
                  
                  return (
                    <TableCell 
                      key={`${categoria.nome}-${ciclo.ciclo}`}
                      className={`text-center text-sm font-medium border ${colorClass} ${
                        valor > 0 && onCellClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
                      }`}
                      onClick={() => {
                        if (valor > 0 && onCellClick) {
                          onCellClick(categoria.nome, ciclo.ciclo, valor);
                        }
                      }}
                      title={valor > 0 ? "Clique para ver as transações" : undefined}
                    >
                      {valor > 0 ? formatarMoeda(valor) : "-"}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default FinancialTable;
