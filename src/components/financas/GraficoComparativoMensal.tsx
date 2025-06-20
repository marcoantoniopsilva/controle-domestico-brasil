
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Transacao, Categoria } from "@/types";
import { formatarMoeda } from "@/utils/financas";
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

// Função melhorada para gerar ciclos financeiros baseada nas transações existentes
const gerarCiclosFinanceiros = (transacoes: Transacao[]) => {
  const ciclos = [];
  const hoje = new Date();
  
  console.log("[GraficoComparativo] Gerando ciclos para", transacoes.length, "transações");
  
  // Encontrar a data mais antiga e mais recente das transações
  if (transacoes.length === 0) {
    // Se não há transações, gerar apenas os últimos 6 ciclos
    for (let i = 5; i >= 0; i--) {
      const dataBase = subMonths(hoje, i);
      const inicioCiclo = dataBase.getDate() < 25 
        ? new Date(dataBase.getFullYear(), dataBase.getMonth() - 1, 25)
        : new Date(dataBase.getFullYear(), dataBase.getMonth(), 25);
      
      const fimCiclo = new Date(inicioCiclo);
      fimCiclo.setMonth(fimCiclo.getMonth() + 1);
      fimCiclo.setDate(24);
      
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
  }
  
  // Ordenar transações por data
  const transacoesOrdenadas = [...transacoes].sort((a, b) => 
    new Date(a.data).getTime() - new Date(b.data).getTime()
  );
  
  const primeiraTransacao = new Date(transacoesOrdenadas[0].data);
  const ultimaTransacao = new Date(transacoesOrdenadas[transacoesOrdenadas.length - 1].data);
  
  console.log("[GraficoComparativo] Primeira transação:", primeiraTransacao.toDateString());
  console.log("[GraficoComparativo] Última transação:", ultimaTransacao.toDateString());
  
  // Determinar o ciclo da primeira transação
  let dataInicioCiclos: Date;
  if (primeiraTransacao.getDate() >= 25) {
    // A transação está na segunda metade do mês, então o ciclo começou no dia 25 deste mês
    dataInicioCiclos = new Date(primeiraTransacao.getFullYear(), primeiraTransacao.getMonth(), 25);
  } else {
    // A transação está na primeira metade do mês, então o ciclo começou no dia 25 do mês anterior
    dataInicioCiclos = new Date(primeiraTransacao.getFullYear(), primeiraTransacao.getMonth() - 1, 25);
  }
  
  // Gerar ciclos desde o primeiro até um pouco depois do último
  let cicloAtual = new Date(dataInicioCiclos);
  
  while (cicloAtual <= addMonths(ultimaTransacao, 2)) {
    const inicioCiclo = new Date(cicloAtual);
    const fimCiclo = new Date(cicloAtual);
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
    
    // Verificar se este ciclo tem transações
    const transacoesCiclo = transacoes.filter(t => {
      const dataTransacao = new Date(t.data);
      return dataTransacao >= inicioCiclo && dataTransacao <= fimCiclo;
    });
    
    console.log(`[GraficoComparativo] Ciclo ${nomeCiclo}: ${transacoesCiclo.length} transações`);
    
    ciclos.push({
      inicio: new Date(inicioCiclo),
      fim: new Date(fimCiclo),
      nome: nomeCiclo,
      nomeCompleto: nomeCicloCompleto
    });
    
    // Avançar para o próximo ciclo
    cicloAtual = new Date(cicloAtual);
    cicloAtual.setMonth(cicloAtual.getMonth() + 1);
  }
  
  // Ordenar ciclos por data de início
  ciclos.sort((a, b) => a.inicio.getTime() - b.inicio.getTime());
  
  // Manter apenas os últimos 8 ciclos para não sobrecarregar o gráfico
  const ciclosLimitados = ciclos.slice(-8);
  
  console.log("[GraficoComparativo] Total de ciclos gerados:", ciclosLimitados.length);
  ciclosLimitados.forEach(c => console.log(`- ${c.nome}: ${c.inicio.toDateString()} a ${c.fim.toDateString()}`));
  
  return ciclosLimitados;
};

const GraficoComparativoMensal = ({ transacoes, categorias }: GraficoComparativoMensalProps) => {
  // Gerar ciclos baseados nas transações existentes
  const ciclos = gerarCiclosFinanceiros(transacoes);

  // Preparar dados para o gráfico
  const dadosGrafico = ciclos.map(ciclo => {
    // Filtrar transações do ciclo
    const transacoesCiclo = transacoes.filter(t => {
      const dataTransacao = new Date(t.data);
      return dataTransacao >= ciclo.inicio && dataTransacao <= ciclo.fim;
    });

    console.log(`[GraficoComparativo] Ciclo ${ciclo.nome}: ${transacoesCiclo.length} transações encontradas`);

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

  console.log("[GraficoComparativo] Dados do gráfico:", dadosGrafico);
  console.log("[GraficoComparativo] Categorias com dados:", categoriasComDados.map(c => c.nome));

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
          Comparação dos gastos de cada categoria nos últimos ciclos financeiros
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
            
            // Calcular média apenas para ciclos com lançamentos efetivos da categoria
            const ciclosComLancamentosCategoria = dadosGrafico.filter(ciclo => ciclo[categoria.nome] > 0);
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
