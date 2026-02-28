import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transacao, Categoria } from "@/types";
import { formatarMoeda } from "@/utils/financas";
import { LayoutGrid } from "lucide-react";

interface DistribuicaoCategoriasProps {
  transacoes: Transacao[];
  categorias: Categoria[];
}

const PALETTE = [
  "hsl(142, 72%, 40%)",   // primary green
  "hsl(217, 91%, 60%)",   // blue
  "hsl(330, 81%, 60%)",   // pink
  "hsl(262, 83%, 58%)",   // purple
  "hsl(38, 92%, 50%)",    // amber
  "hsl(0, 84%, 60%)",     // red
  "hsl(173, 80%, 40%)",   // teal
  "hsl(25, 95%, 53%)",    // orange
  "hsl(47, 96%, 53%)",    // yellow
  "hsl(199, 89%, 48%)",   // sky
];

const DistribuicaoCategorias = ({ transacoes, categorias }: DistribuicaoCategoriasProps) => {
  const despesas = transacoes.filter(t => t.tipo === "despesa");
  const totalDespesas = despesas.reduce((acc, t) => acc + Math.abs(t.valor), 0);

  const categoriasDespesa = categorias
    .filter(c => c.tipo === "despesa")
    .map((cat, idx) => {
      const gasto = despesas
        .filter(t => t.categoria === cat.nome)
        .reduce((acc, t) => acc + Math.abs(t.valor), 0);
      return {
        nome: cat.nome,
        gasto,
        orcamento: cat.orcamento,
        percentual: totalDespesas > 0 ? (gasto / totalDespesas) * 100 : 0,
        color: PALETTE[idx % PALETTE.length],
      };
    })
    .filter(c => c.gasto > 0)
    .sort((a, b) => b.gasto - a.gasto);

  if (categoriasDespesa.length === 0) return null;

  const maxGasto = Math.max(...categoriasDespesa.map(c => c.gasto));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <LayoutGrid className="h-5 w-5 text-primary" />
          Distribuição de Gastos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Treemap-style blocks */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1.5 mb-6">
          {categoriasDespesa.map((cat) => {
            const intensity = Math.max(0.35, cat.gasto / maxGasto);
            return (
              <div
                key={cat.nome}
                className="relative rounded-lg p-2 flex flex-col justify-end overflow-hidden transition-transform hover:scale-105"
                style={{
                  backgroundColor: cat.color,
                  opacity: intensity,
                  minHeight: `${Math.max(60, cat.percentual * 2.5)}px`,
                }}
              >
                <span className="text-[10px] font-semibold text-white leading-tight drop-shadow-sm">
                  {cat.nome}
                </span>
                <span className="text-[10px] text-white/80 drop-shadow-sm">
                  {cat.percentual.toFixed(0)}%
                </span>
              </div>
            );
          })}
        </div>

        {/* Ranked list */}
        <div className="space-y-2.5">
          {categoriasDespesa.slice(0, 6).map((cat, idx) => {
            const barWidth = maxGasto > 0 ? (cat.gasto / maxGasto) * 100 : 0;
            const overBudget = cat.orcamento > 0 && cat.gasto > cat.orcamento;
            return (
              <div key={cat.nome} className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground w-5">{idx + 1}º</span>
                    <span className="text-sm font-medium">{cat.nome}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{formatarMoeda(cat.gasto)}</span>
                    {overBudget && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium">
                        Excedeu
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${barWidth}%`,
                      background: `linear-gradient(90deg, ${cat.color}, ${cat.color}dd)`,
                    }}
                  />
                </div>
                {cat.orcamento > 0 && (
                  <div className="text-[11px] text-muted-foreground">
                    {formatarMoeda(cat.gasto)} de {formatarMoeda(cat.orcamento)} orçado
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default DistribuicaoCategorias;
