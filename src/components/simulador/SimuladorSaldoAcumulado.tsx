import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { SaldoMensal, MESES_ABREV } from "@/types/simulacao";
import { formatarMoeda } from "@/utils/financas";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface SimuladorSaldoAcumuladoProps {
  saldosMensais: SaldoMensal[];
}

export function SimuladorSaldoAcumulado({ saldosMensais }: SimuladorSaldoAcumuladoProps) {
  const getCorSaldo = (valor: number) => {
    if (valor > 0) return "text-emerald-600";
    if (valor < 0) return "text-rose-600";
    return "text-muted-foreground";
  };

  const getBgSaldo = (valor: number) => {
    if (valor > 0) return "bg-emerald-50 dark:bg-emerald-950/30";
    if (valor < 0) return "bg-rose-50 dark:bg-rose-950/30";
    return "bg-muted/50";
  };

  const getIcone = (valor: number) => {
    if (valor > 0) return <TrendingUp className="h-4 w-4 text-emerald-600" />;
    if (valor < 0) return <TrendingDown className="h-4 w-4 text-rose-600" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Saldo Projetado Acumulado
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Visualize como seu saldo evolui ao longo do ano, considerando a transferência do saldo de cada mês para o próximo.
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full">
          <div className="min-w-[800px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Mês</TableHead>
                  <TableHead className="text-right">Receitas</TableHead>
                  <TableHead className="text-right">Despesas</TableHead>
                  <TableHead className="text-right">Investimentos</TableHead>
                  <TableHead className="text-right">Saldo do Mês</TableHead>
                  <TableHead className="text-right font-bold">Saldo Acumulado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {saldosMensais.map((saldo) => (
                  <TableRow key={saldo.mes}>
                    <TableCell className="font-medium">
                      {MESES_ABREV[saldo.mes - 1]}
                    </TableCell>
                    <TableCell className="text-right text-emerald-600">
                      {formatarMoeda(saldo.receitas)}
                    </TableCell>
                    <TableCell className="text-right text-rose-600">
                      {formatarMoeda(saldo.despesas)}
                    </TableCell>
                    <TableCell className="text-right text-blue-600">
                      {formatarMoeda(saldo.investimentos)}
                    </TableCell>
                    <TableCell className={`text-right ${getCorSaldo(saldo.saldoMes)}`}>
                      <div className="flex items-center justify-end gap-1">
                        {getIcone(saldo.saldoMes)}
                        {formatarMoeda(saldo.saldoMes)}
                      </div>
                    </TableCell>
                    <TableCell className={`text-right font-bold ${getBgSaldo(saldo.saldoAcumulado)} ${getCorSaldo(saldo.saldoAcumulado)}`}>
                      <div className="flex items-center justify-end gap-1 py-1 px-2 rounded">
                        {getIcone(saldo.saldoAcumulado)}
                        {formatarMoeda(saldo.saldoAcumulado)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
