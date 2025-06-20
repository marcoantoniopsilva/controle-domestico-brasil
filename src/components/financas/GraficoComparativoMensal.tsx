
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Transacao, Categoria } from "@/types";
import { formatarMoeda } from "@/utils/financas";
import { format, addMonths, subMonths } from "date-fns";
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

// Função aprimorada para gerar ciclos financeiros com dados históricos
const gerarCiclosFinanceiros = (transacoes: Transacao[]) => {
  const ciclos = [];
  const hoje = new Date();
  
  console.log("[GraficoComparativo] Gerando ciclos históricos para", transacoes.length, "transações");
  
  // Sempre gerar os últimos 12 ciclos, independente das transações
  // Isso garante que sempre temos dados históricos para comparação
  for (let i = 11; i >= 0; i--) {
    const dataBase = subMonths(hoje, i);
    
    // Calcular o início do ciclo financeiro (dia 25 do mês anterior)
    const inicioCiclo = new Date(dataBase.getFullYear(), dataBase.getMonth() - 1, 25);
    
    // Calcular o fim do ciclo financeiro (dia 24 do mês atual)
    const fimCiclo = new Date(dataBase.getFullYear(), dataBase.getMonth(), 24);
    
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
    
    console.log(`[GraficoComparativo] Ciclo ${nomeCiclo}: ${transacoesCiclo.length} transações (${inicioCiclo.toDateString()} a ${fimCiclo.toDateString()})`);
    
    ciclos.push({
      inicio: new Date(inicioCiclo),
      fim: new Date(fimCiclo),
      nome: nomeCiclo,
      nomeCompleto: nomeCicloCompleto,
      temTransacoes: transacoesCiclo.length > 0
    });
  }
  
  console.log("[GraficoComparativo] Total de ciclos gerados:", ciclos.length);
  console.log("[GraficoComparativo] Ciclos com transações:", ciclos.filter(c => c.temTransacoes).length);
  
  return ciclos;
};

const GraficoComparativoMensal = ({ transacoes, categorias }: GraficoComparativoMensalProps) => {
  // Filtrar apenas transações de despesa para o gráfico
  const transacoesDespesa = transacoes.filter(t => t.tipo === "despesa");
  
  console.log("[GraficoComparativo] Transações de despesa:", transacoesDespesa.length);
  console.log("[GraficoComparativo] Total de transações:", transacoes.length);
  
  // Gerar ciclos baseados no período atual, sempre mostrando histórico
  const ciclos = gerarCiclosFinanceiros(transacoesDespesa);

  // Preparar dados para o gráfico
  const dadosGrafico = ciclos.map(ciclo => {
    // Filtrar transações do ciclo (apenas despesas)
    const transacoesCiclo = transacoesDespesa.filter(t => {
      const dataTransacao = new Date(t.data);
      return dataTransacao >= ciclo.inicio && dataTransacao <= ciclo.fim;
    });

    console.log(`[GraficoComparativo] Processando ciclo ${ciclo.nome}: ${transacoesCiclo.length} transações de despesa`);

    // Calcular total por categoria para este ciclo
    const dadosCiclo: any = {
      ciclo: ciclo.nome,
      cicloCompleto: ciclo.nomeCompleto,
      temLancamentos: transacoesCiclo.length > 0
    };

    // Adicionar total por categoria (apenas categorias de despesa)
    const categoriasDespesa = categorias.filter(cat => cat.tipo === "despesa");
    categoriasDespesa.forEach(categoria => {
      const totalCategoria = transacoesCiclo
        .filter(t => t.categoria === categoria.nome)
        .reduce((acc, t) => acc + Math.abs(t.valor), 0);
      
      dadosCiclo[categoria.nome] = totalCategoria;
      
      if (totalCategoria > 0) {
        console.log(`[GraficoComparativo] ${ciclo.nome} - ${categoria.nome}: R$ ${totalCategoria.toFixed(2)}`);
      }
    });

    return dadosCiclo;
  });

  // Filtrar apenas categorias de despesa que têm dados para mostrar
  const categoriasDespesa = categorias.filter(cat => cat.tipo === "despesa");
  const categoriasComDados = categoriasDespesa.filter(cat => 
    dadosGrafico.some(ciclo => ciclo[cat.nome] > 0)
  );

  console.log("[GraficoComparativo] Categorias de despesa com dados:", categoriasComDados.map(c => c.nome));
  console.log("[GraficoComparativo] Resumo dos dados do gráfico:");
  dadosGrafico.forEach(ciclo => {
    const totalCiclo = categoriasDespesa.reduce((acc, cat) => acc + (ciclo[cat.nome] || 0), 0);
    if (totalCiclo > 0) {
      console.log(`- ${ciclo.ciclo}: R$ ${totalCiclo.toFixed(2)} total`);
    }
  });

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
          Acompanhamento da evolução dos gastos por categoria nos últimos 12 ciclos financeiros
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dadosGrafico}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="ciclo" 
                tick={{ fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tickFormatter={(value) => `R$ ${value.toLocaleString()}`}
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
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Resumo das categorias */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categoriasComDados.map((categoria, index) => {
            // Calcular total geral da categoria em todos os ciclos
            const totalCategoria = dadosGrafico.reduce((acc, ciclo) => acc + (ciclo[categoria.nome] || 0), 0);
            
            // Calcular média apenas para ciclos com lançamentos efetivos da categoria
            const ciclosComLancamentosCategoria = dadosGrafico.filter(ciclo => 
              ciclo[categoria.nome] > 0 && ciclo.temLancamentos
            );
            const mediaCategoria = ciclosComLancamentosCategoria.length > 0 
              ? ciclosComLancamentosCategoria.reduce((acc, ciclo) => acc + ciclo[categoria.nome], 0) / ciclosComLancamentosCategoria.length
              : 0;
            
            // Encontrar o valor mais alto e mais baixo
            const valoresCategoria = ciclosComLancamentosCategoria.map(ciclo => ciclo[categoria.nome]).filter(v => v > 0);
            const maiorValor = valoresCategoria.length > 0 ? Math.max(...valoresCategoria) : 0;
            const menorValor = valoresCategoria.length > 0 ? Math.min(...valoresCategoria) : 0;
            
            return (
              <div key={categoria.nome} className="bg-slate-50 p-3 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: CORES_CATEGORIAS[index % CORES_CATEGORIAS.length] }}
                  />
                  <span className="text-sm font-medium">{categoria.nome}</span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Total: {formatarMoeda(totalCategoria)}</div>
                  <div>Média: {formatarMoeda(mediaCategoria)}</div>
                  {valoresCategoria.length > 1 && (
                    <>
                      <div>Maior: {formatarMoeda(maiorValor)}</div>
                      <div>Menor: {formatarMoeda(menorValor)}</div>
                    </>
                  )}
                  <div className="text-xs opacity-75 pt-1">
                    {ciclosComLancamentosCategoria.length} ciclos com dados
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {categoriasComDados.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhum dado de despesa encontrado para os últimos 12 ciclos financeiros.</p>
            <p className="text-sm mt-2">Adicione algumas transações de despesa para ver a evolução dos gastos.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GraficoComparativoMensal;
