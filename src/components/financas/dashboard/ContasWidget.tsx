import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, ChevronRight } from "lucide-react";
import { useContas } from "@/hooks/useContas";
import { useTransacoes } from "@/hooks/useTransacoes";
import { calcularSaldoConta, calcularSaldoTotal } from "@/utils/saldoContas";
import { formatarMoeda } from "@/utils/financas";
import { useNavigate } from "react-router-dom";

export function ContasWidget() {
  const { contas, loading } = useContas();
  const { transacoes } = useTransacoes();
  const navigate = useNavigate();

  if (loading) return null;
  if (contas.length === 0) return null;

  const ativas = contas.filter((c) => c.ativo);
  const saldoTotal = calcularSaldoTotal(contas, transacoes);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Wallet className="h-4 w-4" /> Saldo em contas
            </CardTitle>
            <CardDescription className="text-xs">
              Saldo real consolidado
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/contas")}>
            Ver todas <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className={`text-2xl font-bold ${saldoTotal < 0 ? "text-destructive" : ""}`}>
          {formatarMoeda(saldoTotal)}
        </p>
        <div className="space-y-1.5">
          {ativas.slice(0, 4).map((c) => {
            const saldo = calcularSaldoConta(c, transacoes);
            return (
              <div key={c.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="inline-block w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.cor }} />
                  <span className="truncate">{c.nome}</span>
                </div>
                <span className={`font-medium ${saldo < 0 ? "text-destructive" : ""}`}>
                  {formatarMoeda(saldo)}
                </span>
              </div>
            );
          })}
          {ativas.length > 4 && (
            <p className="text-xs text-muted-foreground pt-1">+{ativas.length - 4} outras contas</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
