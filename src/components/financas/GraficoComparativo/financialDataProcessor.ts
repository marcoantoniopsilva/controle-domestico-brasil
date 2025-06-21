
import { Transacao, Categoria } from "@/types";
import { gerarCiclosFinanceiros } from "@/utils/ciclosFinanceiros";
import { filtrarTransacoesPorCiclo } from "@/utils/financas";
import { DadosCiclo } from "./types";

export const processFinancialData = (transacoes: Transacao[], categorias: Categoria[]) => {
  // Filtrar apenas transações de despesa para a tabela
  const transacoesDespesa = transacoes.filter(t => t.tipo === "despesa");
  
  console.log("[GraficoComparativo] Transações de despesa:", transacoesDespesa.length);
  console.log("[GraficoComparativo] Total de transações:", transacoes.length);
  
  // Gerar ciclos baseados no período atual, sempre mostrando histórico
  const ciclos = gerarCiclosFinanceiros(transacoesDespesa);

  // Preparar dados para a tabela usando a MESMA lógica da aba "Despesas"
  const dadosTabela: DadosCiclo[] = ciclos.map(ciclo => {
    console.log(`[GraficoComparativo] Processando ciclo ${ciclo.nome}: ${ciclo.inicio.toDateString()} até ${ciclo.fim.toDateString()}`);

    // Criar objeto do ciclo financeiro no formato esperado por filtrarTransacoesPorCiclo
    const cicloFinanceiro = {
      inicio: ciclo.inicio,
      fim: ciclo.fim,
      nome: ciclo.nome
    };

    // Usar a MESMA função que a aba "Despesas" usa para filtrar transações
    const transacoesCiclo = filtrarTransacoesPorCiclo(transacoesDespesa, cicloFinanceiro);
    
    console.log(`[GraficoComparativo] Transações filtradas para ${ciclo.nome}: ${transacoesCiclo.length}`);

    // Inicializar dados do ciclo
    const dadosCiclo: DadosCiclo = {
      ciclo: ciclo.nome,
      cicloCompleto: ciclo.nomeCompleto,
      temLancamentos: false
    };

    // Usar a MESMA lógica da aba "Despesas" para calcular gastos por categoria
    const categoriasDespesa = categorias.filter(cat => cat.tipo === "despesa");
    let totalGeralCiclo = 0;
    
    categoriasDespesa.forEach(categoria => {
      // MESMA lógica do useDashboardData: filtrar transações da categoria e somar valores
      const transacoesDaCategoria = transacoesCiclo.filter(t => t.categoria === categoria.nome);
      const totalCategoria = transacoesDaCategoria.reduce((acc, t) => acc + Math.abs(t.valor), 0);
      
      dadosCiclo[categoria.nome] = totalCategoria;
      totalGeralCiclo += totalCategoria;
      
      if (totalCategoria > 0) {
        console.log(`[GraficoComparativo] ${ciclo.nome} - ${categoria.nome}: R$ ${totalCategoria.toFixed(2)} (${transacoesDaCategoria.length} transações)`);
      }
    });

    // Definir se tem lançamentos baseado nos totais calculados
    dadosCiclo.temLancamentos = totalGeralCiclo > 0;
    
    console.log(`[GraficoComparativo] Ciclo ${ciclo.nome} - Total geral: R$ ${totalGeralCiclo.toFixed(2)} - Tem lançamentos: ${dadosCiclo.temLancamentos}`);

    return dadosCiclo;
  });

  console.log("[GraficoComparativo] Todos os ciclos processados:", dadosTabela.map(c => `${c.ciclo} (${c.temLancamentos ? 'com dados' : 'sem dados'})`));

  return { dadosTabela, categoriasDespesa: categorias.filter(cat => cat.tipo === "despesa") };
};
