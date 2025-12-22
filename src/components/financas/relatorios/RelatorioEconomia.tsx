
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Transacao, CicloFinanceiro, Categoria } from "@/types";
import { formatarMoeda } from "@/utils/financas";
import { PiggyBank, TrendingDown, Award, Target, CheckCircle, XCircle } from "lucide-react";

interface RelatorioEconomiaProps {
  transacoes: Transacao[];
  categorias: Categoria[];
  cicloAtual: CicloFinanceiro;
  orcamentoTotal: number;
}

interface EconomiaCategoria {
  categoria: string;
  orcamento: number;
  gasto: number;
  economia: number;
  percentualUsado: number;
  status: "economizou" | "estourou" | "dentro";
}

const RelatorioEconomia = ({
  transacoes,
  categorias,
  cicloAtual,
  orcamentoTotal
}: RelatorioEconomiaProps) => {
  // Filtrar apenas despesas do ciclo atual
  const despesas = transacoes.filter(t => t.tipo === "despesa");
  const totalGasto = despesas.reduce((acc, t) => acc + t.valor, 0);
  
  // Calcular economia/estouro geral
  const economiaGeral = orcamentoTotal - totalGasto;
  const percentualGeral = orcamentoTotal > 0 ? (totalGasto / orcamentoTotal) * 100 : 0;

  // Calcular economia por categoria
  const categoriasDespesa = categorias.filter(c => c.tipo === "despesa" && c.orcamento > 0);
  
  const economiasPorCategoria: EconomiaCategoria[] = categoriasDespesa
    .map(cat => {
      const gasto = despesas
        .filter(t => t.categoria === cat.nome)
        .reduce((acc, t) => acc + t.valor, 0);
      
      const economia = cat.orcamento - gasto;
      const percentualUsado = cat.orcamento > 0 ? (gasto / cat.orcamento) * 100 : 0;
      
      let status: "economizou" | "estourou" | "dentro" = "dentro";
      if (percentualUsado < 80) status = "economizou";
      else if (percentualUsado > 100) status = "estourou";
      
      return {
        categoria: cat.nome,
        orcamento: cat.orcamento,
        gasto,
        economia,
        percentualUsado,
        status
      };
    })
    .sort((a, b) => b.economia - a.economia);

  // Estatísticas
  const categoriasEconomizaram = economiasPorCategoria.filter(e => e.status === "economizou");
  const categoriasEstouraram = economiasPorCategoria.filter(e => e.status === "estourou");
  const totalEconomizado = categoriasEconomizaram.reduce((acc, e) => acc + e.economia, 0);
  const totalEstourado = Math.abs(categoriasEstouraram.reduce((acc, e) => acc + e.economia, 0));

  // Calcular "nota" de economia (0-100)
  const notaEconomia = Math.max(0, Math.min(100, 100 - (percentualGeral - 100) * 2));

  const getStatusIcon = (status: "economizou" | "estourou" | "dentro") => {
    switch (status) {
      case "economizou": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "estourou": return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Target className="h-4 w-4 text-amber-500" />;
    }
  };

  const getStatusBadge = (status: "economizou" | "estourou" | "dentro") => {
    switch (status) {
      case "economizou": return <Badge variant="default" className="bg-green-500">Economizou</Badge>;
      case "estourou": return <Badge variant="destructive">Estourou</Badge>;
      default: return <Badge variant="secondary">Dentro</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PiggyBank className="h-5 w-5 text-primary" />
          Relatório de Economia
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Card principal de economia */}
        <div className={`p-6 rounded-lg ${economiaGeral >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {economiaGeral >= 0 ? (
                <TrendingDown className="h-6 w-6 text-green-600" />
              ) : (
                <TrendingDown className="h-6 w-6 text-red-600 rotate-180" />
              )}
              <span className={`font-medium ${economiaGeral >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {economiaGeral >= 0 ? 'Economia do Ciclo' : 'Estouro do Ciclo'}
              </span>
            </div>
            <Badge variant={economiaGeral >= 0 ? "default" : "destructive"} className="text-lg px-4 py-1">
              {formatarMoeda(Math.abs(economiaGeral))}
            </Badge>
          </div>
          
          <Progress 
            value={Math.min(percentualGeral, 100)} 
            className={`h-3 ${percentualGeral > 100 ? '[&>div]:bg-red-500' : ''}`}
          />
          
          <div className="flex justify-between mt-2 text-sm">
            <span className={economiaGeral >= 0 ? 'text-green-600' : 'text-red-600'}>
              {formatarMoeda(totalGasto)} gastos
            </span>
            <span className="text-muted-foreground">
              de {formatarMoeda(orcamentoTotal)} orçamento
            </span>
          </div>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <div className="text-sm text-green-700">Categorias Economizando</div>
            <div className="text-2xl font-bold text-green-600">{categoriasEconomizaram.length}</div>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <div className="text-sm text-red-700">Categorias Estouradas</div>
            <div className="text-2xl font-bold text-red-600">{categoriasEstouraram.length}</div>
          </div>
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <div className="text-sm text-green-700">Total Economizado</div>
            <div className="text-xl font-bold text-green-600">{formatarMoeda(totalEconomizado)}</div>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <div className="text-sm text-red-700">Total Estourado</div>
            <div className="text-xl font-bold text-red-600">{formatarMoeda(totalEstourado)}</div>
          </div>
        </div>

        {/* Nota de economia */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <span className="font-medium">Pontuação de Economia</span>
            </div>
            <div className="text-3xl font-bold text-primary">{notaEconomia.toFixed(0)}/100</div>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            {notaEconomia >= 80 && "Excelente! Você está economizando muito bem!"}
            {notaEconomia >= 60 && notaEconomia < 80 && "Bom! Você está no caminho certo."}
            {notaEconomia >= 40 && notaEconomia < 60 && "Atenção! Tente reduzir alguns gastos."}
            {notaEconomia < 40 && "Alerta! Revise seus gastos com urgência."}
          </div>
        </div>

        {/* Lista de categorias */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Economia por Categoria</div>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {economiasPorCategoria.map(e => (
              <div key={e.categoria} className="p-3 rounded-lg border">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(e.status)}
                    <span className="font-medium">{e.categoria}</span>
                  </div>
                  {getStatusBadge(e.status)}
                </div>
                
                <Progress 
                  value={Math.min(e.percentualUsado, 100)} 
                  className={`h-2 ${e.percentualUsado > 100 ? '[&>div]:bg-red-500' : e.percentualUsado < 80 ? '[&>div]:bg-green-500' : ''}`}
                />
                
                <div className="flex justify-between mt-2 text-sm">
                  <span className="text-muted-foreground">
                    {formatarMoeda(e.gasto)} de {formatarMoeda(e.orcamento)}
                  </span>
                  <span className={e.economia >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                    {e.economia >= 0 ? '+' : ''}{formatarMoeda(e.economia)}
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

export default RelatorioEconomia;
