
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

  // Função melhorada para extrair data do nome do ciclo
  const extrairDataDoCiclo = (cicloNome: string): Date => {
    console.log(`[GraficoComparativo] Extraindo data do ciclo: "${cicloNome}"`);
    
    // Mapear abreviações de meses para números
    const mesesMap: { [key: string]: number } = {
      'jan': 0, 'fev': 1, 'mar': 2, 'abr': 3, 'mai': 4, 'jun': 5,
      'jul': 6, 'ago': 7, 'set': 8, 'out': 9, 'nov': 10, 'dez': 11
    };
    
    // Extrair ano - procurar por padrão de 4 dígitos
    const anoMatch = cicloNome.match(/(\d{4})/);
    const ano = anoMatch ? parseInt(anoMatch[1]) : 2025;
    
    // Extrair primeiro mês do ciclo
    let mes = 0;
    for (const [nomeAbrev, numeroMes] of Object.entries(mesesMap)) {
      if (cicloNome.includes(nomeAbrev)) {
        mes = numeroMes;
        break;
      }
    }
    
    const dataExtraida = new Date(ano, mes, 1);
    console.log(`[GraficoComparativo] Ciclo "${cicloNome}" → Data: ${dataExtraida.toISOString()}`);
    
    return dataExtraida;
  };

  // Filtrar ciclos a partir de março/abril 2025 e ordenar cronologicamente
  const ciclosFiltrados = dadosTabela
    .filter(ciclo => {
      const dataCiclo = extrairDataDoCiclo(ciclo.ciclo);
      // Incluir a partir de março 2025 (mês 2)
      const incluir = dataCiclo >= new Date(2025, 2, 1);
      
      if (incluir) {
        console.log(`[GraficoComparativo] Incluindo ciclo: ${ciclo.ciclo} (${dataCiclo.toDateString()})`);
      }
      
      return incluir;
    })
    .sort((a, b) => {
      const dataA = extrairDataDoCiclo(a.ciclo);
      const dataB = extrairDataDoCiclo(b.ciclo);
      const resultado = dataA.getTime() - dataB.getTime();
      
      console.log(`[GraficoComparativo] Ordenação: "${a.ciclo}" (${dataA.toDateString()}) vs "${b.ciclo}" (${dataB.toDateString()}) = ${resultado}`);
      
      return resultado;
    });

  console.log("[GraficoComparativo] Categorias de despesa com dados:", categoriasComDados.map(c => c.nome));
  console.log("[GraficoComparativo] Ciclos filtrados e ordenados:", ciclosFiltrados.map(c => c.ciclo));

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
          Gastos por categoria nos ciclos financeiros (a partir de março 2025)
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
            <p>Nenhum dado de despesa encontrado a partir de março 2025.</p>
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
