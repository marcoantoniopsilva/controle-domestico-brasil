
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Transacao, Categoria, CicloFinanceiro } from "@/types";
import { formatarMoeda } from "@/utils/financas";
import { CreditCard, TrendingUp, TrendingDown, Target } from "lucide-react";

interface RelatorioCartaoCreditoProps {
  transacoes: Transacao[];
  categorias: Categoria[];
  cicloAtual: CicloFinanceiro;
  showTitle?: boolean;
}

const RelatorioCartaoCredito = ({ 
  transacoes, 
  categorias, 
  cicloAtual,
  showTitle = true 
}: RelatorioCartaoCreditoProps) => {
  // Filtrar apenas despesas do cartão (excluir "Despesas fixas no dinheiro")
  const despesasCartao = transacoes.filter(t => 
    t.tipo === "despesa" && 
    t.categoria !== "Despesas fixas no dinheiro"
  );

  // Calcular total gasto no cartão
  const totalGastoCartao = despesasCartao.reduce((acc, t) => acc + Math.abs(t.valor), 0);

  // Calcular meta (soma dos orçamentos de todas as categorias de despesa exceto dinheiro)
  const metaCiclo = categorias
    .filter(cat => cat.tipo === "despesa" && cat.nome !== "Despesas fixas no dinheiro")
    .reduce((acc, cat) => acc + cat.orcamento, 0);

  // Calcular percentual gasto
  const percentualGasto = metaCiclo > 0 ? Math.min((totalGastoCartao / metaCiclo) * 100, 100) : 0;
  
  // Verificar se está dentro ou fora da meta
  const dentroMeta = totalGastoCartao <= metaCiclo;
  const diferenca = Math.abs(totalGastoCartao - metaCiclo);

  // Agrupar gastos por categoria
  const gastosPorCategoria = categorias
    .filter(cat => cat.tipo === "despesa" && cat.nome !== "Despesas fixas no dinheiro")
    .map(cat => {
      const gastosCategoria = despesasCartao
        .filter(t => t.categoria === cat.nome)
        .reduce((acc, t) => acc + Math.abs(t.valor), 0);
      
      return {
        nome: cat.nome,
        gastos: gastosCategoria,
        orcamento: cat.orcamento,
        percentual: cat.orcamento > 0 ? (gastosCategoria / cat.orcamento) * 100 : 0
      };
    })
    .filter(cat => cat.gastos > 0)
    .sort((a, b) => b.gastos - a.gastos);

  return (
    <Card className="w-full">
      {showTitle && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Relatório Cartão de Crédito - {cicloAtual.nome}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-6">
          {/* Resumo Geral */}
          <div className="bg-slate-50 p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Meta vs Realizado</span>
              </div>
              {dentroMeta ? (
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingDown className="h-4 w-4" />
                  <span className="text-sm font-medium">Dentro da Meta</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">Acima da Meta</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso</span>
                <span className="font-medium">{percentualGasto.toFixed(1)}%</span>
              </div>
              <Progress 
                value={percentualGasto} 
                className="h-2"
              />
              <div className="flex justify-between text-sm mt-2">
                <span>Gasto: {formatarMoeda(totalGastoCartao)}</span>
                <span>Meta: {formatarMoeda(metaCiclo)}</span>
              </div>
              <div className="text-center text-sm font-medium pt-2">
                {dentroMeta ? (
                  <span className="text-green-600">
                    Restante: {formatarMoeda(diferenca)}
                  </span>
                ) : (
                  <span className="text-red-600">
                    Excedido: {formatarMoeda(diferenca)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Detalhamento por Categoria */}
          {gastosPorCategoria.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">Gastos por Categoria</h4>
              <div className="space-y-3">
                {gastosPorCategoria.map(cat => (
                  <div key={cat.nome} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-sm">{cat.nome}</span>
                        <span className="text-sm text-muted-foreground">
                          {cat.percentual.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-2">
                        <span>{formatarMoeda(cat.gastos)}</span>
                        <span>de {formatarMoeda(cat.orcamento)}</span>
                      </div>
                      <Progress 
                        value={Math.min(cat.percentual, 100)} 
                        className="h-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RelatorioCartaoCredito;
