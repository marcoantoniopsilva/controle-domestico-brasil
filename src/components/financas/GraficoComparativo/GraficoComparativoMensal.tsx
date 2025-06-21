
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Transacao, Categoria } from "@/types";
import { TrendingUp } from "lucide-react";
import { gerarCiclosFinanceiros } from "@/utils/ciclosFinanceiros";
import { DadosCiclo } from "./types";

interface GraficoComparativoMensalProps {
  transacoes: Transacao[];
  categorias: Categoria[];
}

const GraficoComparativoMensal = ({ transacoes, categorias }: GraficoComparativoMensalProps) => {
  // Filtrar apenas transações de despesa para a tabela
  const transacoesDespesa = transacoes.filter(t => t.tipo === "despesa");
  
  console.log("[GraficoComparativo] Transações de despesa:", transacoesDespesa.length);
  console.log("[GraficoComparativo] Total de transações:", transacoes.length);
  
  // Gerar ciclos baseados no período atual, sempre mostrando histórico
  const ciclos = gerarCiclosFinanceiros(transacoesDespesa);

  // Preparar dados para a tabela
  const dadosTabela: DadosCiclo[] = ciclos.map(ciclo => {
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
    dadosTabela.some(ciclo => (ciclo[cat.nome] as number) > 0)
  );

  // Melhorar a lógica de filtragem de ciclos - começar de março/abril 2025
  const ciclosFiltrados = dadosTabela.filter(ciclo => {
    // Verificar se o ciclo é de março/abril 2025 ou posterior
    const temMarco2025 = ciclo.ciclo.includes("mar") && ciclo.ciclo.includes("2025");
    const temAbril2025 = ciclo.ciclo.includes("abr") && ciclo.ciclo.includes("2025");
    const eh2025OuPosterior = ciclo.ciclo.includes("2025") || 
                             ciclo.ciclo.includes("2026") || 
                             ciclo.ciclo.includes("2027") ||
                             ciclo.ciclo.includes("2028");
    
    // Incluir março/abril 2025 e todos os ciclos posteriores
    return (temMarco2025 || temAbril2025) || 
           (eh2025OuPosterior && !ciclo.ciclo.includes("jan/fev 2025") && !ciclo.ciclo.includes("fev/mar 2025"));
  }).sort((a, b) => {
    // Ordenar os ciclos cronologicamente
    // Extrair ano e mês para comparação adequada
    const extrairData = (cicloNome: string) => {
      if (cicloNome.includes("mar") && cicloNome.includes("2025")) return new Date(2025, 2); // março
      if (cicloNome.includes("abr") && cicloNome.includes("2025")) return new Date(2025, 3); // abril
      if (cicloNome.includes("mai") && cicloNome.includes("2025")) return new Date(2025, 4); // maio
      if (cicloNome.includes("jun") && cicloNome.includes("2025")) return new Date(2025, 5); // junho
      if (cicloNome.includes("jul") && cicloNome.includes("2025")) return new Date(2025, 6); // julho
      if (cicloNome.includes("ago") && cicloNome.includes("2025")) return new Date(2025, 7); // agosto
      if (cicloNome.includes("set") && cicloNome.includes("2025")) return new Date(2025, 8); // setembro
      if (cicloNome.includes("out") && cicloNome.includes("2025")) return new Date(2025, 9); // outubro
      if (cicloNome.includes("nov") && cicloNome.includes("2025")) return new Date(2025, 10); // novembro
      if (cicloNome.includes("dez") && cicloNome.includes("2025")) return new Date(2025, 11); // dezembro
      
      // Para anos futuros, assumir janeiro como padrão
      if (cicloNome.includes("2026")) return new Date(2026, 0);
      if (cicloNome.includes("2027")) return new Date(2027, 0);
      
      return new Date(2025, 0); // fallback
    };
    
    const dataA = extrairData(a.ciclo);
    const dataB = extrairData(b.ciclo);
    return dataA.getTime() - dataB.getTime();
  });

  console.log("[GraficoComparativo] Categorias de despesa com dados:", categoriasComDados.map(c => c.nome));
  console.log("[GraficoComparativo] Ciclos filtrados:", ciclosFiltrados.map(c => c.ciclo));

  // Função para determinar a cor da célula
  const getCellColor = (valor: number, orcamento: number) => {
    if (valor === 0) return "bg-gray-50 text-gray-400";
    if (valor <= orcamento) return "bg-green-50 text-green-800 border-green-200";
    return "bg-red-50 text-red-800 border-red-200";
  };

  // Função para formatar valor em moeda
  const formatarMoeda = (valor: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Evolução por Ciclo Financeiro
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Gastos por categoria nos ciclos financeiros (a partir de março/abril 2025)
        </p>
      </CardHeader>
      <CardContent>
        {categoriasComDados.length > 0 && ciclosFiltrados.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px] font-semibold">Categoria</TableHead>
                  <TableHead className="min-w-[100px] text-center font-semibold">Orçamento</TableHead>
                  {ciclosFiltrados.map(ciclo => (
                    <TableHead key={ciclo.ciclo} className="min-w-[120px] text-center font-semibold">
                      {ciclo.ciclo}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoriasDespesa.map(categoria => {
                  return (
                    <TableRow key={categoria.nome}>
                      <TableCell className="font-medium">{categoria.nome}</TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">
                        {formatarMoeda(categoria.orcamento)}
                      </TableCell>
                      {ciclosFiltrados.map(ciclo => {
                        const valor = (ciclo[categoria.nome] as number) || 0;
                        const colorClass = getCellColor(valor, categoria.orcamento);
                        
                        return (
                          <TableCell 
                            key={`${categoria.nome}-${ciclo.ciclo}`}
                            className={`text-center text-sm font-medium border ${colorClass}`}
                          >
                            {valor > 0 ? formatarMoeda(valor) : "-"}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhum dado de despesa encontrado a partir de março/abril 2025.</p>
            <p className="text-sm mt-2">Adicione algumas transações de despesa para ver a evolução dos gastos.</p>
          </div>
        )}
        
        {/* Legenda */}
        <div className="mt-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-50 border border-green-200 rounded"></div>
            <span>Dentro do orçamento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
            <span>Acima do orçamento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded"></div>
            <span>Sem gastos</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GraficoComparativoMensal;
