
import { Transacao, Categoria } from "@/types";
import { gerarCiclosFinanceiros } from "@/utils/ciclosFinanceiros";
import { DadosCiclo } from "./types";

export const processFinancialData = (transacoes: Transacao[], categorias: Categoria[]) => {
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

  return { dadosTabela, categoriasDespesa: categorias.filter(cat => cat.tipo === "despesa") };
};

export const filterAndSortCycles = (dadosTabela: DadosCiclo[]) => {
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

  return { ciclosFiltrados, extrairDataDoCiclo };
};
