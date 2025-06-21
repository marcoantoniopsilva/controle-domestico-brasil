
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
