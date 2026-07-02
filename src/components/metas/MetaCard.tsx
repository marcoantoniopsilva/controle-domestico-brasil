import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { MetaFinanceira } from "@/types";
import { formatarMoeda } from "@/utils/financas";
import { Pencil, Trash2, Plus, Target } from "lucide-react";

function parseLocalDate(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function mesesRestantes(prazo: string | null): number | null {
  if (!prazo) return null;
  const hoje = new Date();
  const alvo = parseLocalDate(prazo);
  const diff =
    (alvo.getFullYear() - hoje.getFullYear()) * 12 +
    (alvo.getMonth() - hoje.getMonth());
  return Math.max(diff, 0);
}

interface Props {
  meta: MetaFinanceira;
  acumulado: number;
  onAportar: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function MetaCard({ meta, acumulado, onAportar, onEdit, onDelete }: Props) {
  const pct = Math.min(100, (acumulado / meta.valorAlvo) * 100);
  const restante = Math.max(0, meta.valorAlvo - acumulado);
  const meses = mesesRestantes(meta.prazo);
  const aporteSugerido = meses && meses > 0 ? restante / meses : null;
  const concluida = pct >= 100;
  const atrasada =
    !concluida && meta.prazo && parseLocalDate(meta.prazo).getTime() < Date.now();

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: meta.cor + "22", color: meta.cor }}
            >
              <Target className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold truncate">{meta.nome}</p>
              <p className="text-xs text-muted-foreground capitalize">{meta.tipo}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="font-medium">{formatarMoeda(acumulado)}</span>
            <span className="text-muted-foreground">de {formatarMoeda(meta.valorAlvo)}</span>
          </div>
          <Progress value={pct} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{pct.toFixed(0)}%</span>
            <span>Faltam {formatarMoeda(restante)}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {concluida && <Badge className="bg-green-600 hover:bg-green-600">Concluída 🎉</Badge>}
          {atrasada && <Badge variant="destructive">Atrasada</Badge>}
          {meta.prazo && !concluida && (
            <span className="text-muted-foreground">
              Prazo: {parseLocalDate(meta.prazo).toLocaleDateString("pt-BR")}
            </span>
          )}
          {aporteSugerido != null && !concluida && (
            <span className="text-muted-foreground">
              · Sugestão: {formatarMoeda(aporteSugerido)}/mês
            </span>
          )}
        </div>

        <Button className="w-full" onClick={onAportar} disabled={concluida}>
          <Plus className="h-4 w-4 mr-1" /> Aportar
        </Button>
      </CardContent>
    </Card>
  );
}