import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Transacao } from "@/types";
import { formatarMoeda } from "@/utils/financas";
import { BarChart3 } from "lucide-react";
import { gerarCiclosFinanceiros } from "@/utils/ciclosFinanceiros";
import { filtrarPorCiclo, filtrarPorTipo } from "@/utils/calculosFinanceiros";
import { categoryGroups } from "@/utils/categoryGroups";

interface EvolucaoGruposProps {
  transacoes: Transacao[];
}

// Replica installment projection logic
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

const GROUP_COLORS: Record<string, string> = {
  "Alimentação": "hsl(25, 95%, 53%)",
  "Deslocamento": "hsl(210, 79%, 46%)",
  "Saúde": "hsl(340, 82%, 52%)",
  "Aurora": "hsl(280, 68%, 60%)",
  "Pessoais": "hsl(160, 60%, 45%)",
  "Essenciais": "hsl(45, 93%, 47%)",
  "Extraordinários": "hsl(0, 72%, 51%)",
};

const EvolucaoGrupos = ({ transacoes }: EvolucaoGruposProps) => {
  const hoje = new Date();
  const ciclos = gerarCiclosFinanceiros(transacoes)
    .filter(c => c.temTransacoes && c.fim < hoje)
    .sort((a, b) => a.inicio.getTime() - b.inicio.getTime())
    .slice(-6);

  if (ciclos.length < 2) return null;

  const dados = ciclos.map(ciclo => {
    const transacoesCiclo = filtrarPorCiclo(transacoes, ciclo);
    const parcelasCiclo = gerarParcelasDoCiclo(transacoes, ciclo);
    const todasDoCiclo = [...transacoesCiclo, ...parcelasCiclo];
    const despesas = filtrarPorTipo(todasDoCiclo, "despesa");

    const ponto: Record<string, string | number> = {
      ciclo: ciclo.nome.split(" ")[0],
    };

    categoryGroups.forEach(group => {
      const total = despesas
        .filter(t => group.categorias.includes(t.categoria))
        .reduce((sum, t) => sum + Math.abs(t.valor), 0);
      ponto[group.nome] = total;
    });

    return ponto;
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-5 w-5 text-primary" />
          Evolução por Grupo
        </CardTitle>
        <p className="text-xs text-muted-foreground">Últimos 6 ciclos encerrados</p>
      </CardHeader>
      <CardContent>
        <div className="h-72 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dados}>
              <defs>
                {categoryGroups.map(group => (
                  <linearGradient key={group.nome} id={`color-${group.nome}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={GROUP_COLORS[group.nome]} stopOpacity={0.6} />
                    <stop offset="95%" stopColor={GROUP_COLORS[group.nome]} stopOpacity={0.05} />
                  </linearGradient>
                ))}
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
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
              {categoryGroups.map(group => (
                <Area
                  key={group.nome}
                  type="monotone"
                  dataKey={group.nome}
                  stroke={GROUP_COLORS[group.nome]}
                  strokeWidth={2}
                  fill={`url(#color-${group.nome})`}
                  dot={{ r: 3, fill: GROUP_COLORS[group.nome], strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default EvolucaoGrupos;
