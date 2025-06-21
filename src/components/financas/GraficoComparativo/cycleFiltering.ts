
import { DadosCiclo } from "./types";

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

export const filterAndSortCycles = (dadosTabela: DadosCiclo[]) => {
  // Filtrar apenas ciclos que tenham lançamentos e ordenar cronologicamente
  const ciclosFiltrados = dadosTabela
    .filter(ciclo => {
      // Mostrar apenas ciclos que tenham transações (dados reais)
      const temDados = ciclo.temLancamentos;
      
      if (temDados) {
        console.log(`[GraficoComparativo] Incluindo ciclo com dados: ${ciclo.ciclo}`);
      } else {
        console.log(`[GraficoComparativo] Excluindo ciclo sem dados: ${ciclo.ciclo}`);
      }
      
      return temDados;
    })
    .sort((a, b) => {
      const dataA = extrairDataDoCiclo(a.ciclo);
      const dataB = extrairDataDoCiclo(b.ciclo);
      const resultado = dataA.getTime() - dataB.getTime();
      
      console.log(`[GraficoComparativo] Ordenação: "${a.ciclo}" (${dataA.toDateString()}) vs "${b.ciclo}" (${dataB.toDateString()}) = ${resultado}`);
      
      return resultado;
    });

  console.log(`[GraficoComparativo] Total de ciclos com dados: ${ciclosFiltrados.length}`);
  
  return { ciclosFiltrados, extrairDataDoCiclo };
};
