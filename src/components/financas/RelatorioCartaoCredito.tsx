
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Transacao, Categoria, CicloFinanceiro } from "@/types";
import { formatarMoeda } from "@/utils/financas";
import { CreditCard, TrendingUp, TrendingDown, Target, Calendar } from "lucide-react";
import { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCartoes } from "@/hooks/useCartoes";
import { CartaoIcone } from "@/utils/cardIcons";
import { getFaturaPeriodo, isDateInFatura } from "@/utils/faturas";

interface RelatorioCartaoCreditoProps {
  transacoes: Transacao[];
  categorias: Categoria[];
  cicloAtual: CicloFinanceiro;
  showTitle?: boolean;
}

const TODOS = "__todos__";

const RelatorioCartaoCredito = ({ 
  transacoes, 
  categorias, 
  cicloAtual,
  showTitle = true 
}: RelatorioCartaoCreditoProps) => {
  const { cartoes } = useCartoes();
  const cartoesAtivos = cartoes.filter((c) => c.ativo);
  const [selecaoId, setSelecaoId] = useState<string>(TODOS);

  const cartaoSelecionado = useMemo(
    () => cartoes.find((c) => c.id === selecaoId) || null,
    [cartoes, selecaoId]
  );

  const fatura = useMemo(() => {
    if (!cartaoSelecionado) return null;
    return getFaturaPeriodo(cartaoSelecionado.diaFechamento, cartaoSelecionado.diaVencimento, new Date());
  }, [cartaoSelecionado]);

  // Filtrar apenas despesas do cartão (excluir "Despesas fixas no dinheiro")
  const despesasCartao = useMemo(() => {
    const base = transacoes.filter(
      (t) => t.tipo === "despesa" && t.categoria !== "Despesas fixas no dinheiro"
    );
    if (selecaoId === TODOS) return base;
    return base.filter((t) => t.cartaoId === selecaoId && fatura && isDateInFatura(t.data, fatura));
  }, [transacoes, selecaoId, fatura]);

  // Calcular total gasto no cartão
  const totalGastoCartao = despesasCartao.reduce((acc, t) => acc + Math.abs(t.valor), 0);

  // Meta: por cartão usa meta_mensal; "todos" usa soma das metas dos cartões ou,
  // se nenhum cartão tem meta, mantém a soma de orçamentos das categorias como antes.
  const metaCiclo = useMemo(() => {
    if (cartaoSelecionado) {
      return cartaoSelecionado.metaMensal && cartaoSelecionado.metaMensal > 0
        ? cartaoSelecionado.metaMensal
        : 0;
    }
    const somaMetasCartoes = cartoesAtivos.reduce(
      (acc, c) => acc + (c.metaMensal || 0),
      0
    );
    if (somaMetasCartoes > 0) return somaMetasCartoes;
    return categorias
      .filter((cat) => cat.tipo === "despesa" && cat.nome !== "Despesas fixas no dinheiro")
      .reduce((acc, cat) => acc + cat.orcamento, 0);
  }, [cartaoSelecionado, cartoesAtivos, categorias]);

  // Calcular percentual gasto
  const percentualGasto = metaCiclo > 0 ? Math.min((totalGastoCartao / metaCiclo) * 100, 100) : 0;
  
  // Verificar se está dentro ou fora da meta
  const dentroMeta = totalGastoCartao <= metaCiclo;
  const diferenca = Math.abs(totalGastoCartao - metaCiclo);

  // Quebra por cartão quando selecionado "Todos"
  const gastosPorCartao = useMemo(() => {
    if (selecaoId !== TODOS) return [];
    const map = new Map<string, number>();
    let semCartao = 0;
    for (const t of despesasCartao) {
      const val = Math.abs(t.valor);
      if (t.cartaoId) {
        map.set(t.cartaoId, (map.get(t.cartaoId) || 0) + val);
      } else {
        semCartao += val;
      }
    }
    const lista = cartoesAtivos.map((c) => ({
      id: c.id,
      nome: c.nome,
      banco: c.banco,
      bandeira: c.bandeira,
      cor: c.cor,
      meta: c.metaMensal || 0,
      gasto: map.get(c.id) || 0,
    }));
    if (semCartao > 0) {
      lista.push({
        id: "__sem__",
        nome: "Sem cartão atribuído",
        banco: null,
        bandeira: null,
        cor: "#9ca3af",
        meta: 0,
        gasto: semCartao,
      });
    }
    return lista.sort((a, b) => b.gasto - a.gasto);
  }, [selecaoId, despesasCartao, cartoesAtivos]);

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

  const titulo = cartaoSelecionado
    ? `Cartão ${cartaoSelecionado.nome}${fatura ? ` · ${fatura.label}` : ""}`
    : `Todos os cartões - ${cicloAtual.nome}`;

  return (
    <Card className="w-full">
      {showTitle && (
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Relatório Cartão de Crédito
            </CardTitle>
            {cartoesAtivos.length > 0 && (
              <Select value={selecaoId} onValueChange={setSelecaoId}>
                <SelectTrigger className="w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TODOS}>Todos os cartões</SelectItem>
                  {cartoesAtivos.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <div className="flex items-center gap-2">
                        <CartaoIcone banco={c.banco} bandeira={c.bandeira} cor={c.cor} size={18} />
                        <span>{c.nome}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{titulo}</p>
          {cartaoSelecionado && fatura && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Calendar className="h-3 w-3" />
              {fatura.inicio.toLocaleDateString("pt-BR")} → {fatura.fim.toLocaleDateString("pt-BR")} · Vence {fatura.vencimento.toLocaleDateString("pt-BR")}
            </p>
          )}
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-6">
          {/* Resumo Geral */}
          <div className="bg-slate-50 p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="font-medium">
                  {metaCiclo > 0 ? "Meta vs Realizado" : "Total gasto"}
                </span>
              </div>
              {metaCiclo > 0 && (dentroMeta ? (
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingDown className="h-4 w-4" />
                  <span className="text-sm font-medium">Dentro da Meta</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">Acima da Meta</span>
                </div>
              ))}
            </div>
            
            <div className="space-y-2">
              {metaCiclo > 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <span>Progresso</span>
                    <span className="font-medium">{percentualGasto.toFixed(1)}%</span>
                  </div>
                  <Progress value={percentualGasto} className="h-2" />
                </>
              )}
              <div className="flex justify-between text-sm mt-2">
                <span>Gasto: {formatarMoeda(totalGastoCartao)}</span>
                {metaCiclo > 0 && <span>Meta: {formatarMoeda(metaCiclo)}</span>}
              </div>
              {metaCiclo > 0 && (
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
              )}
            </div>
          </div>

          {/* Quebra por cartão (modo "Todos") */}
          {selecaoId === TODOS && gastosPorCartao.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">Gastos por cartão</h4>
              <div className="space-y-2">
                {gastosPorCartao.map((c) => {
                  const pct = c.meta > 0 ? Math.min((c.gasto / c.meta) * 100, 100) : 0;
                  return (
                    <div key={c.id} className="flex items-center gap-3 p-3 bg-white border rounded-lg">
                      <CartaoIcone banco={c.banco} bandeira={c.bandeira} cor={c.cor} size={32} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium truncate">{c.nome}</span>
                          <span className="font-medium">{formatarMoeda(c.gasto)}</span>
                        </div>
                        {c.meta > 0 && (
                          <>
                            <Progress value={pct} className="h-1 mt-1" />
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {pct.toFixed(0)}% da meta de {formatarMoeda(c.meta)}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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
