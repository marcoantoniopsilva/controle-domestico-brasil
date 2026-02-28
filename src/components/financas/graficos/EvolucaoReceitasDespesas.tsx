import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Transacao, CicloFinanceiro } from "@/types";
import { formatarMoeda } from "@/utils/financas";
import { TrendingUp } from "lucide-react";
import { gerarCiclosFinanceiros } from "@/utils/ciclosFinanceiros";
import { filtrarPorCiclo, somarTransacoes, filtrarPorTipo } from "@/utils/calculosFinanceiros";

interface EvolucaoReceitasDespesasProps {
  transacoes: Transacao[];
}

/**
 * Gera parcelas projetadas para um ciclo específico
 * Replica a lógica de useParcelasFuturas mas para qualquer ciclo
 */
function gerarParcelasDoCiclo(transacoes: Transacao[], ciclo: { inicio: Date; fim: Date }): Transacao[] {
  const inicio = new Date(ciclo.inicio);
  const fim = new Date(ciclo.fim);
  inicio.setHours(0, 0, 0, 0);
  fim.setHours(23, 59, 59, 999);

  const parcelas: Transacao[] = [];
  const transacoesParceladas = transacoes.filter(t => t.parcelas > 1 && !t.isParcela);

  transacoesParceladas.forEach(transacao => {
    const dataTransacao = new Date(transacao.data);
    if (isNaN(dataTransacao.getTime())) return;

    for (let i = 2; i <= transacao.parcelas; i++) {
      const dataParcela = new Date(dataTransacao);
      dataParcela.setMonth(dataTransacao.getMonth() + (i - 1));

      const ultimoDia = new Date(dataParcela.getFullYear(), dataParcela.getMonth() + 1, 0).getDate();
      if (dataParcela.getDate() > ultimoDia) dataParcela.setDate(ultimoDia);

      dataParcela.setHours(0, 0, 0, 0);
      if (dataParcela >= inicio && dataParcela <= fim) {
        parcelas.push({
          ...transacao,
          id: `proj-${transacao.id}-p${i}`,
          data: dataParcela,
          descricao: `${transacao.descricao || transacao.categoria} (Parcela ${i}/${transacao.parcelas})`,
          isParcela: true,
          parcelaAtual: i,
        });
      }
    }
  });

  return parcelas;
}

const EvolucaoReceitasDespesas = ({ transacoes }: EvolucaoReceitasDespesasProps) => {
  const hoje = new Date();
  const ciclos = gerarCiclosFinanceiros(transacoes)
    .filter(c => c.temTransacoes && c.fim < hoje)
    .sort((a, b) => a.inicio.getTime() - b.inicio.getTime())
    .slice(-8);

  if (ciclos.length < 2) return null;

  const dados = ciclos.map(ciclo => {
    // Transações reais do ciclo
    const transacoesCiclo = filtrarPorCiclo(transacoes, ciclo);
    // Parcelas projetadas para este ciclo (mesma lógica do dashboard)
    const parcelasCiclo = gerarParcelasDoCiclo(transacoes, ciclo);
    // Combinar
    const todasDoCiclo = [...transacoesCiclo, ...parcelasCiclo];

    const receitas = somarTransacoes(filtrarPorTipo(todasDoCiclo, "receita"));
    const despesas = somarTransacoes(filtrarPorTipo(todasDoCiclo, "despesa"));

    return {
      ciclo: ciclo.nome.split(" ")[0],
      Receitas: receitas,
      Despesas: despesas,
    };
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-5 w-5 text-primary" />
          Evolução Receitas vs Despesas
        </CardTitle>
        <p className="text-xs text-muted-foreground">Últimos ciclos financeiros encerrados</p>
      </CardHeader>
      <CardContent>
        <div className="h-72 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dados}>
              <defs>
                <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 72%, 40%)" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="hsl(142, 72%, 40%)" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="ciclo" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis
                tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={55}
              />
              <Tooltip
                formatter={(value: number, name: string) => [formatarMoeda(value), name]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid hsl(var(--border))",
                  backgroundColor: "hsl(var(--card))",
                  fontSize: "13px",
                }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: "13px" }} />
              <Area
                type="monotone"
                dataKey="Receitas"
                stroke="hsl(142, 72%, 40%)"
                strokeWidth={2.5}
                fill="url(#colorReceitas)"
                dot={{ r: 4, fill: "hsl(142, 72%, 40%)", strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
              <Area
                type="monotone"
                dataKey="Despesas"
                stroke="hsl(0, 84%, 60%)"
                strokeWidth={2.5}
                fill="url(#colorDespesas)"
                dot={{ r: 4, fill: "hsl(0, 84%, 60%)", strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default EvolucaoReceitasDespesas;
