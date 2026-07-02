import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Target, ArrowRight } from "lucide-react";
import { useMetas } from "@/hooks/useMetas";
import { formatarMoeda } from "@/utils/financas";
import { Link } from "react-router-dom";

export function MetasWidget() {
  const { metas, progressoPorMeta, loading } = useMetas();
  if (loading || metas.length === 0) return null;

  const top = [...metas]
    .sort((a, b) => {
      const pa = (progressoPorMeta.get(a.id) || 0) / a.valorAlvo;
      const pb = (progressoPorMeta.get(b.id) || 0) / b.valorAlvo;
      return pb - pa;
    })
    .slice(0, 3);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Target className="h-4 w-4" /> Minhas metas
        </CardTitle>
        <Button asChild variant="ghost" size="sm">
          <Link to="/metas">Ver todas <ArrowRight className="h-3 w-3 ml-1" /></Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {top.map((m) => {
          const acumulado = progressoPorMeta.get(m.id) || 0;
          const pct = Math.min(100, (acumulado / m.valorAlvo) * 100);
          return (
            <div key={m.id} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium truncate">{m.nome}</span>
                <span className="text-muted-foreground shrink-0 ml-2">
                  {formatarMoeda(acumulado)} / {formatarMoeda(m.valorAlvo)}
                </span>
              </div>
              <Progress value={pct} className="h-1.5" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}