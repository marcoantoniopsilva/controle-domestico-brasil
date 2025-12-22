
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Transacao, CicloFinanceiro, Categoria } from "@/types";
import { formatarMoeda } from "@/utils/financas";
import { format, subMonths, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TrendingUp, TrendingDown, Minus, Lightbulb, ArrowUp, ArrowDown } from "lucide-react";

interface TendenciasInsightsProps {
  transacoes: Transacao[];
  categorias: Categoria[];
  cicloAtual: CicloFinanceiro;
}

interface TendenciaCategoria {
  categoria: string;
  gastoAtual: number;
  gastoAnterior: number;
  variacao: number;
  variacaoPercentual: number;
  tendencia: "up" | "down" | "stable";
}

const TendenciasInsights = ({
  transacoes,
  categorias,
  cicloAtual
}: TendenciasInsightsProps) => {
  // Calcular período anterior (mesmo número de dias antes do ciclo atual)
  const cicloAnteriorInicio = subMonths(cicloAtual.inicio, 1);
  const cicloAnteriorFim = subMonths(cicloAtual.fim, 1);

  // Filtrar transações por ciclo
  const transacoesCicloAtual = transacoes.filter(t => {
    const dataTransacao = new Date(t.data);
    return t.tipo === "despesa" && isWithinInterval(dataTransacao, {
      start: cicloAtual.inicio,
      end: cicloAtual.fim
    });
  });

  const transacoesCicloAnterior = transacoes.filter(t => {
    const dataTransacao = new Date(t.data);
    return t.tipo === "despesa" && isWithinInterval(dataTransacao, {
      start: cicloAnteriorInicio,
      end: cicloAnteriorFim
    });
  });

  // Calcular tendências por categoria
  const categoriasDespesa = categorias.filter(c => c.tipo === "despesa");
  
  const tendencias: TendenciaCategoria[] = categoriasDespesa
    .map(cat => {
      const gastoAtual = transacoesCicloAtual
        .filter(t => t.categoria === cat.nome)
        .reduce((acc, t) => acc + t.valor, 0);
      
      const gastoAnterior = transacoesCicloAnterior
        .filter(t => t.categoria === cat.nome)
        .reduce((acc, t) => acc + t.valor, 0);
      
      const variacao = gastoAtual - gastoAnterior;
      const variacaoPercentual = gastoAnterior > 0 
        ? ((gastoAtual - gastoAnterior) / gastoAnterior) * 100 
        : gastoAtual > 0 ? 100 : 0;
      
      let tendencia: "up" | "down" | "stable" = "stable";
      if (variacaoPercentual > 10) tendencia = "up";
      else if (variacaoPercentual < -10) tendencia = "down";
      
      return {
        categoria: cat.nome,
        gastoAtual,
        gastoAnterior,
        variacao,
        variacaoPercentual,
        tendencia
      };
    })
    .filter(t => t.gastoAtual > 0 || t.gastoAnterior > 0)
    .sort((a, b) => Math.abs(b.variacaoPercentual) - Math.abs(a.variacaoPercentual));

  // Estatísticas gerais
  const totalAtual = transacoesCicloAtual.reduce((acc, t) => acc + t.valor, 0);
  const totalAnterior = transacoesCicloAnterior.reduce((acc, t) => acc + t.valor, 0);
  const variacaoTotal = totalAtual - totalAnterior;
  const variacaoTotalPercentual = totalAnterior > 0 
    ? ((totalAtual - totalAnterior) / totalAnterior) * 100 
    : 0;

  // Categorias que mais aumentaram e reduziram
  const maioresAumentos = tendencias.filter(t => t.tendencia === "up").slice(0, 3);
  const maioresReducoes = tendencias.filter(t => t.tendencia === "down").slice(0, 3);

  // Gerar insights automáticos
  const insights: string[] = [];
  
  if (variacaoTotalPercentual > 15) {
    insights.push(`⚠️ Seus gastos aumentaram ${variacaoTotalPercentual.toFixed(0)}% em relação ao ciclo anterior.`);
  } else if (variacaoTotalPercentual < -15) {
    insights.push(`🎉 Parabéns! Você reduziu seus gastos em ${Math.abs(variacaoTotalPercentual).toFixed(0)}%.`);
  }
  
  if (maioresAumentos.length > 0) {
    const maiorAumento = maioresAumentos[0];
    insights.push(`📈 Maior aumento: ${maiorAumento.categoria} (+${maiorAumento.variacaoPercentual.toFixed(0)}%)`);
  }
  
  if (maioresReducoes.length > 0) {
    const maiorReducao = maioresReducoes[0];
    insights.push(`📉 Maior economia: ${maiorReducao.categoria} (${maiorReducao.variacaoPercentual.toFixed(0)}%)`);
  }

  const getTendenciaIcon = (tendencia: "up" | "down" | "stable") => {
    switch (tendencia) {
      case "up": return <TrendingUp className="h-4 w-4 text-red-500" />;
      case "down": return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTendenciaCor = (tendencia: "up" | "down" | "stable") => {
    switch (tendencia) {
      case "up": return "text-red-600";
      case "down": return "text-green-600";
      default: return "text-muted-foreground";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          Tendências e Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Comparação geral */}
        <div className="p-4 rounded-lg bg-muted/50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Comparação com ciclo anterior</span>
            <Badge variant={variacaoTotal > 0 ? "destructive" : "default"}>
              {variacaoTotal > 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
              {variacaoTotalPercentual.toFixed(1)}%
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground">Ciclo Atual</div>
              <div className="text-xl font-bold">{formatarMoeda(totalAtual)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Ciclo Anterior</div>
              <div className="text-xl font-bold text-muted-foreground">{formatarMoeda(totalAnterior)}</div>
            </div>
          </div>
        </div>

        {/* Insights automáticos */}
        {insights.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Insights</div>
            <div className="space-y-2">
              {insights.map((insight, index) => (
                <div key={index} className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
                  {insight}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Maiores aumentos */}
        {maioresAumentos.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-red-500" />
              Categorias com Aumento
            </div>
            <div className="space-y-2">
              {maioresAumentos.map(t => (
                <div key={t.categoria} className="flex justify-between items-center p-3 rounded-lg border">
                  <div>
                    <div className="font-medium">{t.categoria}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatarMoeda(t.gastoAnterior)} → {formatarMoeda(t.gastoAtual)}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="destructive">+{t.variacaoPercentual.toFixed(0)}%</Badge>
                    <div className="text-xs text-red-600 mt-1">+{formatarMoeda(t.variacao)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Maiores reduções */}
        {maioresReducoes.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-green-500" />
              Categorias com Redução
            </div>
            <div className="space-y-2">
              {maioresReducoes.map(t => (
                <div key={t.categoria} className="flex justify-between items-center p-3 rounded-lg border">
                  <div>
                    <div className="font-medium">{t.categoria}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatarMoeda(t.gastoAnterior)} → {formatarMoeda(t.gastoAtual)}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="default">{t.variacaoPercentual.toFixed(0)}%</Badge>
                    <div className="text-xs text-green-600 mt-1">{formatarMoeda(t.variacao)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lista completa de tendências */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Todas as Categorias</div>
          <div className="max-h-64 overflow-y-auto space-y-1">
            {tendencias.map(t => (
              <div key={t.categoria} className="flex justify-between items-center py-2 px-3 rounded hover:bg-muted/50">
                <div className="flex items-center gap-2">
                  {getTendenciaIcon(t.tendencia)}
                  <span className="text-sm">{t.categoria}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm">{formatarMoeda(t.gastoAtual)}</span>
                  <span className={`text-xs ${getTendenciaCor(t.tendencia)}`}>
                    {t.variacaoPercentual > 0 ? "+" : ""}{t.variacaoPercentual.toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TendenciasInsights;
