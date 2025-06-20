
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Transacao, Categoria } from "@/types";
import { formatarMoeda, calcularCicloAtual } from "@/utils/financas";
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TrendingUp } from "lucide-react";

interface GraficoComparativoMensalProps {
  transacoes: Transacao[];
  categorias: Categoria[];
}

const CORES_CATEGORIAS = [
  "#3B82F6", "#EF4444", "#10B981", "#F59E0B", 
  "#8B5CF6", "#EC4899", "#6366F1", "#14B8A6",
  "#D97706", "#84CC16", "#7C3AED", "#F43F5E"
];

// Função para gerar ciclos financeiros (do 25 de um mês ao 24 do próximo)
const gerarCiclosFinanceiros = () => {
  const ciclos = [];
  const hoje = new Date();
  
  // Gerar últimos 6 ciclos incluindo o atual
  for (let i = 5; i >= 0; i--) {
    const dataBase = subMonths(hoje, i);
    
    // Determinar se estamos no primeiro ou segundo período do mês
    const inicioCiclo = dataBase.getDate() < 25 
      ? new Date(dataBase.getFullYear(), dataBase.getMonth() - 1, 25)
      : new Date(dataBase.getFullYear(), dataBase.getMonth(), 25);
    
    const fimCiclo = new Date(inicioCiclo);
    fimCiclo.setMonth(fimCiclo.getMonth() + 1);
    fimCiclo.setDate(24);
    
    // Formatação do nome do ciclo
    const mesInicio = format(inicioCiclo, 'MMM', { locale: ptBR });
    const mesFim = format(fimCiclo, 'MMM', { locale: ptBR });
    const anoInicio = inicioCiclo.getFullYear();
    const anoFim = fimCiclo.getFullYear();
    
    const nomeCiclo = anoInicio === anoFim 
      ? `${mesInicio}/${mesFim} ${anoInicio}`
      : `${mesInicio} ${anoInicio}/${mesFim} ${anoFim}`;
    
    const nomeCicloCompleto = anoInicio === anoFim
      ? `${format(inicioCiclo, 'MMMM', { locale: ptBR })}/${format(fimCiclo, 'MMMM', { locale: ptBR })} de ${anoInicio}`
      : `${format(inicioCiclo, 'MMMM', { locale: ptBR })} de ${anoInicio} / ${format(fimCiclo, 'MMMM', { locale: ptBR })} de ${anoFim}`;
    
    ciclos.push({
      inicio: new Date(inicioCiclo),
      fim: new Date(fimCiclo),
      nome: nomeCiclo,
      nomeCompleto: nomeCicloCompleto
    });
  }
  
  return ciclos;
};

const GraficoComparativoMensal = ({ transacoes, categorias }: GraficoComparativoMensalProps) => {
  // Gerar últimos 6 ciclos financeiros
  const ciclos = gerarCiclosFinanceiros();

  // Preparar dados para o gráfico
  const dadosGrafico = ciclos.map(ciclo => {
    // Filtrar transações do ciclo
    const transacoesCiclo = transacoes.filter(t => {
      const dataTransacao = new Date(t.data);
      return dataTransacao >= ciclo.inicio && dataTransacao <= ciclo.fim;
    });

    // Calcular total por categoria para este ciclo
    const dadosCiclo: any = {
      ciclo: ciclo.nome,
      cicloCompleto: ciclo.nomeCompleto,
      temLancamentos: transacoesCiclo.length > 0
    };

    // Adicionar total por categoria
    categorias.forEach(categoria => {
      const totalCategoria = transacoesCiclo
        .filter(t => t.categoria === categoria.nome)
        .reduce((acc, t) => acc + Math.abs(t.valor), 0);
      
      dadosCiclo[categoria.nome] = totalCategoria;
    });

    return dadosCiclo;
  });

  // Filtrar apenas categorias que têm dados para mostrar
  const categoriasComDados = categorias.filter(cat => 
    dadosGrafico.some(ciclo => ciclo[cat.nome] > 0)
  );

  // Função para formatar tooltip
  const formatTooltip = (value: number, name: string) => [
    formatarMoeda(value),
    name
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Evolução por Ciclo Financeiro
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Comparação dos gastos de cada categoria nos últimos 6 ciclos financeiros
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dadosGrafico}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="ciclo" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tickFormatter={(value) => `R$ ${value}`}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={formatTooltip}
                labelFormatter={(label) => {
                  const item = dadosGrafico.find(d => d.ciclo === label);
                  return item ? item.cicloCompleto : label;
                }}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px'
                }}
              />
              <Legend />
              
              {categoriasComDados.map((categoria, index) => (
                <Line
                  key={categoria.nome}
                  type="monotone"
                  dataKey={categoria.nome}
                  stroke={CORES_CATEGORIAS[index % CORES_CATEGORIAS.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Resumo das categorias */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categoriasComDados.map((categoria, index) => {
            const totalCategoria = dadosGrafico.reduce((acc, ciclo) => acc + ciclo[categoria.nome], 0);
            
            // Calcular média apenas para ciclos com lançamentos efetivos
            const ciclosComLancamentos = dadosGrafico.filter(ciclo => ciclo.temLancamentos);
            const ciclosComLancamentosCategoria = ciclosComLancamentos.filter(ciclo => ciclo[categoria.nome] > 0);
            const mediaCategoria = ciclosComLancamentosCategoria.length > 0 
              ? ciclosComLancamentosCategoria.reduce((acc, ciclo) => acc + ciclo[categoria.nome], 0) / ciclosComLancamentosCategoria.length
              : 0;
            
            return (
              <div key={categoria.nome} className="bg-slate-50 p-3 rounded-lg border">
                <div className="flex items-center gap-2 mb-1">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: CORES_CATEGORIAS[index % CORES_CATEGORIAS.length] }}
                  />
                  <span className="text-sm font-medium">{categoria.nome}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  <div>Total: {formatarMoeda(totalCategoria)}</div>
                  <div>Média: {formatarMoeda(mediaCategoria)}</div>
                  <div className="text-xs opacity-75">
                    ({ciclosComLancamentosCategoria.length} ciclos)
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default GraficoComparativoMensal;
