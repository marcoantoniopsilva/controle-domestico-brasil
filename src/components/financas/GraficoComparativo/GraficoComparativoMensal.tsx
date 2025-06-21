
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

  // Filtrar ciclos a partir de março/abril 2025
  const ciclosFiltrados = dadosTabela.filter(ciclo => {
    // Procurar por "mar" ou "março" no nome do ciclo e ano 2025
    return (ciclo.ciclo.includes("mar") || ciclo.ciclo.includes("março")) && ciclo.ciclo.includes("2025") ||
           ciclo.ciclo > "mar/abr 2025"; // Para ciclos posteriores
  }).sort((a, b) => {
    // Ordenar os ciclos cronologicamente
    if (a.ciclo < b.ciclo) return -1;
    if (a.ciclo > b.ciclo) return 1;
    return 0;
  });

  console.log("[GraficoComparativo] Categorias de despesa com dados:", categoriasComDados.map(c => c.nome));
  console.log("[GraficoComparativo] Ciclos filtrados a partir de mar/abr 2025:", ciclosFiltrados.length);

  // Função para determinar a cor da célula
  const getCellColor = (valor: number, orcamento: number) => {
    if (valor === 0) return "bg-gray-50 text-gray-400";
    if (valor <= orcamento) return "bg-blue-50 text-blue-800 border-blue-200";
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
          Tabela de gastos por categoria nos ciclos financeiros (a partir de março/abril 2025)
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
                {categoriasComDados.map(categoria => {
                  const temDados = ciclosFiltrados.some(ciclo => (ciclo[categoria.nome] as number) > 0);
                  if (!temDados) return null;
                  
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
            <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded"></div>
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
