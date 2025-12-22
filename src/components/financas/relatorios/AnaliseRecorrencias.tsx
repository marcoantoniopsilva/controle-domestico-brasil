
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Transacao } from "@/types";
import { formatarMoeda } from "@/utils/financas";
import { format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { RefreshCw, Calendar, TrendingUp, AlertCircle } from "lucide-react";

interface AnaliseRecorrenciasProps {
  transacoes: Transacao[];
}

interface DespesaRecorrente {
  descricao: string;
  categoria: string;
  valorMedio: number;
  ocorrencias: number;
  mesesConsecutivos: number;
  ultimaData: Date;
  valores: number[];
  variacao: number;
}

const AnaliseRecorrencias = ({ transacoes }: AnaliseRecorrenciasProps) => {
  // Filtrar apenas despesas dos últimos 6 meses
  const hoje = new Date();
  const seisMesesAtras = subMonths(hoje, 6);
  
  const despesas = transacoes.filter(t => 
    t.tipo === "despesa" && 
    new Date(t.data) >= seisMesesAtras &&
    !t.isParcela // Ignorar parcelas para não duplicar
  );

  // Agrupar por descrição/categoria para encontrar recorrências
  const gruposDescricao = despesas.reduce((acc, t) => {
    // Usar descrição ou categoria como chave
    const chave = t.descricao?.toLowerCase().trim() || t.categoria.toLowerCase();
    
    if (!acc[chave]) {
      acc[chave] = {
        descricao: t.descricao || t.categoria,
        categoria: t.categoria,
        transacoes: []
      };
    }
    
    acc[chave].transacoes.push(t);
    return acc;
  }, {} as Record<string, { descricao: string; categoria: string; transacoes: Transacao[] }>);

  // Identificar despesas recorrentes (aparecem em pelo menos 3 meses diferentes)
  const despesasRecorrentes: DespesaRecorrente[] = Object.values(gruposDescricao)
    .filter(grupo => {
      // Verificar quantos meses diferentes aparecem
      const mesesUnicos = new Set(
        grupo.transacoes.map(t => format(new Date(t.data), "yyyy-MM"))
      );
      return mesesUnicos.size >= 2; // Aparece em pelo menos 2 meses
    })
    .map(grupo => {
      const valores = grupo.transacoes.map(t => t.valor);
      const valorMedio = valores.reduce((a, b) => a + b, 0) / valores.length;
      
      // Calcular meses consecutivos
      const mesesUnicos = [...new Set(
        grupo.transacoes.map(t => format(new Date(t.data), "yyyy-MM"))
      )].sort();
      
      // Calcular variação (diferença entre maior e menor valor)
      const maiorValor = Math.max(...valores);
      const menorValor = Math.min(...valores);
      const variacao = valorMedio > 0 ? ((maiorValor - menorValor) / valorMedio) * 100 : 0;
      
      const datasOrdenadas = grupo.transacoes
        .map(t => new Date(t.data))
        .sort((a, b) => b.getTime() - a.getTime());
      
      return {
        descricao: grupo.descricao,
        categoria: grupo.categoria,
        valorMedio,
        ocorrencias: grupo.transacoes.length,
        mesesConsecutivos: mesesUnicos.length,
        ultimaData: datasOrdenadas[0],
        valores,
        variacao
      };
    })
    .sort((a, b) => b.valorMedio - a.valorMedio);

  // Calcular totais
  const totalRecorrente = despesasRecorrentes.reduce((acc, d) => acc + d.valorMedio, 0);
  const totalDespesas = despesas.reduce((acc, t) => acc + t.valor, 0) / 6; // Média mensal
  const percentualRecorrente = totalDespesas > 0 ? (totalRecorrente / totalDespesas) * 100 : 0;

  // Identificar categorias com mais recorrências
  const recorrenciasPorCategoria = despesasRecorrentes.reduce((acc, d) => {
    if (!acc[d.categoria]) acc[d.categoria] = { total: 0, quantidade: 0 };
    acc[d.categoria].total += d.valorMedio;
    acc[d.categoria].quantidade += 1;
    return acc;
  }, {} as Record<string, { total: number; quantidade: number }>);

  // Despesas com alta variação (podem ser otimizadas)
  const altaVariacao = despesasRecorrentes.filter(d => d.variacao > 30);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-primary" />
          Análise de Recorrências
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resumo */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="text-sm text-muted-foreground">Despesas Recorrentes</div>
            <div className="text-2xl font-bold">{despesasRecorrentes.length}</div>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="text-sm text-muted-foreground">Total Mensal Recorrente</div>
            <div className="text-2xl font-bold text-primary">{formatarMoeda(totalRecorrente)}</div>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="text-sm text-muted-foreground">% do Total</div>
            <div className="text-2xl font-bold">{percentualRecorrente.toFixed(0)}%</div>
          </div>
        </div>

        {/* Alerta de otimização */}
        {altaVariacao.length > 0 && (
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <div className="flex items-center gap-2 text-amber-700 font-medium">
              <AlertCircle className="h-4 w-4" />
              {altaVariacao.length} despesa(s) com alta variação de valor
            </div>
            <div className="text-sm text-amber-600 mt-1">
              Essas despesas variam muito - podem ser oportunidades de economia
            </div>
          </div>
        )}

        {/* Categorias com mais recorrências */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Recorrências por Categoria</div>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(recorrenciasPorCategoria)
              .sort((a, b) => b[1].total - a[1].total)
              .slice(0, 6)
              .map(([categoria, dados]) => (
                <div key={categoria} className="p-3 rounded-lg border">
                  <div className="text-sm font-medium truncate">{categoria}</div>
                  <div className="flex justify-between items-center mt-1">
                    <Badge variant="outline">{dados.quantidade}</Badge>
                    <span className="text-sm font-medium text-primary">{formatarMoeda(dados.total)}/mês</span>
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        {/* Lista de despesas recorrentes */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Despesas Identificadas</div>
          
          {despesasRecorrentes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma despesa recorrente identificada nos últimos 6 meses
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {despesasRecorrentes.map((d, index) => (
                <div key={index} className="p-4 rounded-lg border space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{d.descricao}</div>
                      <div className="text-xs text-muted-foreground">{d.categoria}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">{formatarMoeda(d.valorMedio)}</div>
                      <div className="text-xs text-muted-foreground">/mês (média)</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {d.mesesConsecutivos} meses
                    </Badge>
                    <Badge variant="secondary">
                      {d.ocorrencias} ocorrências
                    </Badge>
                    {d.variacao > 30 && (
                      <Badge variant="outline" className="text-amber-600 border-amber-300">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Alta variação ({d.variacao.toFixed(0)}%)
                      </Badge>
                    )}
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Última: {format(d.ultimaData, "dd/MM/yyyy", { locale: ptBR })} | 
                    Valores: {d.valores.map(v => formatarMoeda(v)).join(", ")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dica */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="text-sm font-medium text-primary">💡 Dica de Economia</div>
          <div className="text-sm text-muted-foreground mt-1">
            Despesas recorrentes representam {percentualRecorrente.toFixed(0)}% do seu gasto mensal. 
            Revisar esses gastos pode gerar economia significativa no longo prazo.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnaliseRecorrencias;
