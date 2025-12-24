import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { ComparativoCiclo, MESES_NOMES } from "@/types/simulacao";
import { formatarMoeda } from "@/utils/financas";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ComparativoRealizadoProps {
  comparativos: ComparativoCiclo[];
}

export function ComparativoRealizado({ comparativos }: ComparativoRealizadoProps) {
  const ciclosFechados = comparativos.filter(c => c.cicloFechado);

  if (ciclosFechados.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comparativo: Previsto vs Realizado</CardTitle>
          <CardDescription>
            Ainda não há ciclos fechados em 2026 para comparar.
            O comparativo aparecerá após o fechamento do primeiro ciclo financeiro.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Calcular totais
  const totais = ciclosFechados.reduce(
    (acc, ciclo) => ({
      receitasPrevisto: acc.receitasPrevisto + ciclo.totalReceitasPrevisto,
      receitasRealizado: acc.receitasRealizado + ciclo.totalReceitasRealizado,
      despesasPrevisto: acc.despesasPrevisto + ciclo.totalDespesasPrevisto,
      despesasRealizado: acc.despesasRealizado + ciclo.totalDespesasRealizado,
      saldoPrevisto: acc.saldoPrevisto + ciclo.saldoPrevisto,
      saldoRealizado: acc.saldoRealizado + ciclo.saldoRealizado,
      diferenca: acc.diferenca + ciclo.diferenca
    }),
    {
      receitasPrevisto: 0,
      receitasRealizado: 0,
      despesasPrevisto: 0,
      despesasRealizado: 0,
      saldoPrevisto: 0,
      saldoRealizado: 0,
      diferenca: 0
    }
  );

  const renderDiferenca = (diferenca: number) => {
    if (diferenca > 0) {
      return (
        <div className="flex items-center gap-1 text-emerald-600">
          <TrendingUp className="h-4 w-4" />
          <span>+{formatarMoeda(diferenca)}</span>
        </div>
      );
    } else if (diferenca < 0) {
      return (
        <div className="flex items-center gap-1 text-rose-600">
          <TrendingDown className="h-4 w-4" />
          <span>{formatarMoeda(diferenca)}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 text-muted-foreground">
        <Minus className="h-4 w-4" />
        <span>{formatarMoeda(0)}</span>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparativo: Previsto vs Realizado</CardTitle>
        <CardDescription>
          Comparação entre os valores simulados e os resultados reais dos ciclos fechados de 2026.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ciclo</TableHead>
              <TableHead className="text-right">Receitas Previstas</TableHead>
              <TableHead className="text-right">Receitas Realizadas</TableHead>
              <TableHead className="text-right">Despesas Previstas</TableHead>
              <TableHead className="text-right">Despesas Realizadas</TableHead>
              <TableHead className="text-right">Saldo Previsto</TableHead>
              <TableHead className="text-right">Saldo Realizado</TableHead>
              <TableHead className="text-right">Diferença</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ciclosFechados.map(ciclo => (
              <TableRow key={ciclo.mes}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {MESES_NOMES[ciclo.mes - 1]}
                    <Badge variant="secondary" className="text-xs">Fechado</Badge>
                  </div>
                </TableCell>
                <TableCell className="text-right text-emerald-600">
                  {formatarMoeda(ciclo.totalReceitasPrevisto)}
                </TableCell>
                <TableCell className="text-right text-emerald-600">
                  {formatarMoeda(ciclo.totalReceitasRealizado)}
                </TableCell>
                <TableCell className="text-right text-rose-600">
                  {formatarMoeda(ciclo.totalDespesasPrevisto)}
                </TableCell>
                <TableCell className="text-right text-rose-600">
                  {formatarMoeda(ciclo.totalDespesasRealizado)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatarMoeda(ciclo.saldoPrevisto)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatarMoeda(ciclo.saldoRealizado)}
                </TableCell>
                <TableCell className="text-right">
                  {renderDiferenca(ciclo.diferenca)}
                </TableCell>
              </TableRow>
            ))}

            {/* Linha de totais */}
            <TableRow className="bg-muted/50 font-bold">
              <TableCell>Total</TableCell>
              <TableCell className="text-right text-emerald-600">
                {formatarMoeda(totais.receitasPrevisto)}
              </TableCell>
              <TableCell className="text-right text-emerald-600">
                {formatarMoeda(totais.receitasRealizado)}
              </TableCell>
              <TableCell className="text-right text-rose-600">
                {formatarMoeda(totais.despesasPrevisto)}
              </TableCell>
              <TableCell className="text-right text-rose-600">
                {formatarMoeda(totais.despesasRealizado)}
              </TableCell>
              <TableCell className="text-right">
                {formatarMoeda(totais.saldoPrevisto)}
              </TableCell>
              <TableCell className="text-right">
                {formatarMoeda(totais.saldoRealizado)}
              </TableCell>
              <TableCell className="text-right">
                {renderDiferenca(totais.diferenca)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
