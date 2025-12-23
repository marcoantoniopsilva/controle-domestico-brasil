
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Transacao, CicloFinanceiro } from "@/types";
import { formatarMoeda } from "@/utils/financas";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowDownUp, ArrowUpCircle, ArrowDownCircle, Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";

interface ReceitasDespesasProps {
  transacoes: Transacao[];
  cicloAtual: CicloFinanceiro;
}

const ReceitasDespesas = ({
  transacoes,
  cicloAtual
}: ReceitasDespesasProps) => {
  // Separar receitas e despesas
  const receitas = transacoes.filter(t => t.tipo === "receita");
  const despesas = transacoes.filter(t => t.tipo === "despesa");
  const investimentos = transacoes.filter(t => t.tipo === "investimento");

  // Usar Math.abs() para garantir valores positivos (despesas são armazenadas como negativos)
  const totalReceitas = receitas.reduce((acc, t) => acc + Math.abs(t.valor), 0);
  const totalDespesas = despesas.reduce((acc, t) => acc + Math.abs(t.valor), 0);
  const totalInvestimentos = investimentos.reduce((acc, t) => acc + Math.abs(t.valor), 0);
  
  const saldoLiquido = totalReceitas - totalDespesas - totalInvestimentos;
  const taxaPoupanca = totalReceitas > 0 ? ((totalReceitas - totalDespesas) / totalReceitas) * 100 : 0;

  // Agrupar por categoria (com Math.abs para valores positivos)
  const receitasPorCategoria = receitas.reduce((acc, t) => {
    if (!acc[t.categoria]) acc[t.categoria] = 0;
    acc[t.categoria] += Math.abs(t.valor);
    return acc;
  }, {} as Record<string, number>);

  const despesasPorCategoria = despesas.reduce((acc, t) => {
    if (!acc[t.categoria]) acc[t.categoria] = 0;
    acc[t.categoria] += Math.abs(t.valor);
    return acc;
  }, {} as Record<string, number>);

  // Ordenar categorias por valor (maior para menor)
  const topReceitas = Object.entries(receitasPorCategoria)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const topDespesas = Object.entries(despesasPorCategoria)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Dados para o gráfico
  const dadosGrafico = [
    { nome: "Receitas", valor: totalReceitas, cor: "#22c55e" },
    { nome: "Despesas", valor: totalDespesas, cor: "#ef4444" },
    { nome: "Investimentos", valor: totalInvestimentos, cor: "#3b82f6" },
    { nome: "Saldo", valor: Math.max(0, saldoLiquido), cor: "#8b5cf6" }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowDownUp className="h-5 w-5 text-primary" />
          Receitas vs Despesas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cards de resumo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <div className="flex items-center gap-2 text-green-700 mb-1">
              <ArrowUpCircle className="h-4 w-4" />
              <span className="text-sm">Receitas</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{formatarMoeda(totalReceitas)}</div>
          </div>
          
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <div className="flex items-center gap-2 text-red-700 mb-1">
              <ArrowDownCircle className="h-4 w-4" />
              <span className="text-sm">Despesas</span>
            </div>
            <div className="text-2xl font-bold text-red-600">{formatarMoeda(totalDespesas)}</div>
          </div>
          
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex items-center gap-2 text-blue-700 mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Investimentos</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{formatarMoeda(totalInvestimentos)}</div>
          </div>
          
          <div className={`p-4 rounded-lg ${saldoLiquido >= 0 ? 'bg-purple-50 border border-purple-200' : 'bg-red-50 border border-red-200'}`}>
            <div className={`flex items-center gap-2 ${saldoLiquido >= 0 ? 'text-purple-700' : 'text-red-700'} mb-1`}>
              <Wallet className="h-4 w-4" />
              <span className="text-sm">Saldo</span>
            </div>
            <div className={`text-2xl font-bold ${saldoLiquido >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
              {formatarMoeda(saldoLiquido)}
            </div>
          </div>
        </div>

        {/* Taxa de poupança */}
        <div className={`p-4 rounded-lg ${taxaPoupanca >= 20 ? 'bg-green-50 border border-green-200' : taxaPoupanca >= 0 ? 'bg-amber-50 border border-amber-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Taxa de Poupança</div>
              <div className="text-xs text-muted-foreground mt-1">
                {taxaPoupanca >= 20 && "Excelente! Você está poupando mais de 20%."}
                {taxaPoupanca >= 10 && taxaPoupanca < 20 && "Bom! Tente chegar a 20% para segurança financeira."}
                {taxaPoupanca >= 0 && taxaPoupanca < 10 && "Atenção! Tente poupar pelo menos 10% da receita."}
                {taxaPoupanca < 0 && "Alerta! Você está gastando mais do que ganha."}
              </div>
            </div>
            <Badge 
              variant={taxaPoupanca >= 20 ? "default" : taxaPoupanca >= 0 ? "secondary" : "destructive"}
              className="text-lg px-4 py-1"
            >
              {taxaPoupanca.toFixed(1)}%
            </Badge>
          </div>
        </div>

        {/* Gráfico */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dadosGrafico} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={(value) => formatarMoeda(value)} />
              <YAxis type="category" dataKey="nome" width={100} />
              <Tooltip 
                formatter={(value: number) => formatarMoeda(value)}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px'
                }}
              />
              <Bar dataKey="valor" radius={[0, 4, 4, 0]}>
                {dadosGrafico.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top categorias */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Top Receitas */}
          <div className="space-y-2">
            <div className="text-sm font-medium flex items-center gap-2">
              <ArrowUpCircle className="h-4 w-4 text-green-500" />
              Principais Receitas
            </div>
            {topReceitas.length === 0 ? (
              <div className="text-sm text-muted-foreground p-3">Nenhuma receita neste ciclo</div>
            ) : (
              <div className="space-y-2">
                {topReceitas.map(([categoria, valor]) => (
                  <div key={categoria} className="flex justify-between items-center p-3 rounded-lg bg-green-50 border border-green-100">
                    <span className="text-sm">{categoria}</span>
                    <span className="font-medium text-green-600">{formatarMoeda(valor)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Despesas */}
          <div className="space-y-2">
            <div className="text-sm font-medium flex items-center gap-2">
              <ArrowDownCircle className="h-4 w-4 text-red-500" />
              Principais Despesas
            </div>
            {topDespesas.length === 0 ? (
              <div className="text-sm text-muted-foreground p-3">Nenhuma despesa neste ciclo</div>
            ) : (
              <div className="space-y-2">
                {topDespesas.map(([categoria, valor]) => (
                  <div key={categoria} className="flex justify-between items-center p-3 rounded-lg bg-red-50 border border-red-100">
                    <span className="text-sm">{categoria}</span>
                    <span className="font-medium text-red-600">{formatarMoeda(valor)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReceitasDespesas;
