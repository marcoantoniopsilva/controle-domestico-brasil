
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

  // Preparar dados para a tabela usando a MESMA lógica exata do useDashboardData
  const dadosTabela: DadosCiclo[] = ciclos.map(ciclo => {
    console.log(`[GraficoComparativo] Processando ciclo ${ciclo.nome}: ${ciclo.inicio.toDateString()} até ${ciclo.fim.toDateString()}`);

    // USAR A MESMA LÓGICA DO useDashboardData - filtrar transações diretamente
    const inicio = new Date(ciclo.inicio);
    const fim = new Date(ciclo.fim);
    
    // Garantir que estamos trabalhando com objetos Date válidos
    inicio.setHours(0, 0, 0, 0);
    fim.setHours(23, 59, 59, 999);

    // MESMA lógica do useDashboardData para filtrar transações
    const transacoesCiclo = transacoesDespesa.filter(t => {
      if (!t || !t.data) {
        console.error("[GraficoComparativo] Encontrada transação sem data ou inválida");
        return false;
      }
      
      if (t.isParcela) return false; // Ignorar parcelas projetadas nas transações originais
      
      // Certifique-se de que a data da transação é um objeto Date válido
      const dataTransacao = t.data instanceof Date ? t.data : new Date(t.data);
      
      if (isNaN(dataTransacao.getTime())) {
        console.error(`[GraficoComparativo] Data inválida para transação ${t.id}`);
        return true; // Include transactions with invalid dates rather than filtering them out
      }
      
      dataTransacao.setHours(0, 0, 0, 0);
      
      // A transação deve estar estritamente entre o início e fim do ciclo
      const estaNoCiclo = dataTransacao >= inicio && dataTransacao <= fim;
      
      // Log detalhado para debug
      if (estaNoCiclo) {
        console.log(`[GraficoComparativo] ✅ Transação ${t.id} (${dataTransacao.toDateString()}) ESTÁ no ciclo ${ciclo.nome}`);
      } else {
        console.log(`[GraficoComparativo] ❌ Transação ${t.id} (${dataTransacao.toDateString()}) NÃO ESTÁ no ciclo ${ciclo.nome}`);
      }
      
      return estaNoCiclo;
    });
    
    console.log(`[GraficoComparativo] Transações filtradas para ${ciclo.nome}: ${transacoesCiclo.length}`);

    // Inicializar dados do ciclo
    const dadosCiclo: DadosCiclo = {
      ciclo: ciclo.nome,
      cicloCompleto: ciclo.nomeCompleto,
      temLancamentos: false
    };

    // MESMA lógica do useDashboardData para calcular gastos por categoria
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
