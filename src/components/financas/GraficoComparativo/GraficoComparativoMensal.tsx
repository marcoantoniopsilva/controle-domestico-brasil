
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transacao, Categoria } from "@/types";
import { TrendingUp } from "lucide-react";
import { gerarCiclosFinanceiros } from "@/utils/ciclosFinanceiros";
import GraficoComparativoChart from "./GraficoComparativoChart";
import CategorySummaryGrid from "./CategorySummaryGrid";
import { DadosCiclo } from "./types";

interface GraficoComparativoMensalProps {
  transacoes: Transacao[];
  categorias: Categoria[];
}

const GraficoComparativoMensal = ({ transacoes, categorias }: GraficoComparativoMensalProps) => {
  // Filtrar apenas transações de despesa para o gráfico
  const transacoesDespesa = transacoes.filter(t => t.tipo === "despesa");
  
  console.log("[GraficoComparativo] Transações de despesa:", transacoesDespesa.length);
  console.log("[GraficoComparativo] Total de transações:", transacoes.length);
  
  // Gerar ciclos baseados no período atual, sempre mostrando histórico
  const ciclos = gerarCiclosFinanceiros(transacoesDespesa);

  // Preparar dados para o gráfico
  const dadosGrafico: DadosCiclo[] = ciclos.map(ciclo => {
    // Filtrar transações do ciclo (apenas despesas)
    const transacoesCiclo = transacoesDespesa.filter(t => {
      const dataTransacao = new Date(t.data);
      return dataTransacao >= ciclo.inicio && dataTransacao <= ciclo.fim;
    });

    console.log(`[GraficoComparativo] Processando ciclo ${ciclo.nome}: ${transacoesCiclo.length} transações de despesa`);

    // Calcular total por categoria para este ciclo
    const dadosCiclo: DadosCiclo = {
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
    dadosGrafico.some(ciclo => (ciclo[cat.nome] as number) > 0)
  );

  console.log("[GraficoComparativo] Categorias de despesa com dados:", categoriasComDados.map(c => c.nome));
  console.log("[GraficoComparativo] Resumo dos dados do gráfico:");
  dadosGrafico.forEach(ciclo => {
    const totalCiclo = categoriasDespesa.reduce((acc, cat) => acc + (ciclo[cat.nome] as number || 0), 0);
    if (totalCiclo > 0) {
      console.log(`- ${ciclo.ciclo}: R$ ${totalCiclo.toFixed(2)} total`);
    }
  });

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
        <GraficoComparativoChart 
          dadosGrafico={dadosGrafico}
          categoriasComDados={categoriasComDados}
        />
        
        <CategorySummaryGrid 
          categoriasComDados={categoriasComDados}
          dadosGrafico={dadosGrafico}
        />
        
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
