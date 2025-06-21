
import { Transacao, Categoria } from "@/types";
import { gerarCiclosFinanceiros } from "@/utils/ciclosFinanceiros";
import { DadosCiclo } from "./types";

export const processFinancialData = (transacoes: Transacao[], categorias: Categoria[]) => {
  // Filtrar apenas transações de despesa para a tabela
  const transacoesDespesa = transacoes.filter(t => t.tipo === "despesa");
  
  console.log("[GraficoComparativo] Transações de despesa:", transacoesDespesa.length);
  console.log("[GraficoComparativo] Total de transações:", transacoes.length);
  
  // Debug: vamos ver as datas das transações
  const datasTransacoes = transacoesDespesa.map(t => new Date(t.data).toISOString().split('T')[0]).sort();
  console.log("[GraficoComparativo] Datas das transações (ordenadas):", datasTransacoes.slice(0, 10), "...", datasTransacoes.slice(-10));
  
  // Gerar ciclos baseados no período atual, sempre mostrando histórico
  const ciclos = gerarCiclosFinanceiros(transacoesDespesa);

  // Preparar dados para a tabela
  const dadosTabela: DadosCiclo[] = ciclos.map(ciclo => {
    // Filtrar transações do ciclo (apenas despesas) - usando comparação mais flexível
    const transacoesCiclo = transacoesDespesa.filter(t => {
      const dataTransacao = new Date(t.data);
      // Normalizar para comparação apenas de datas (sem horário)
      const dataTransacaoNormalizada = new Date(dataTransacao.getFullYear(), dataTransacao.getMonth(), dataTransacao.getDate());
      const inicioNormalizado = new Date(ciclo.inicio.getFullYear(), ciclo.inicio.getMonth(), ciclo.inicio.getDate());
      const fimNormalizado = new Date(ciclo.fim.getFullYear(), ciclo.fim.getMonth(), ciclo.fim.getDate());
      
      const estaNoCiclo = dataTransacaoNormalizada >= inicioNormalizado && dataTransacaoNormalizada <= fimNormalizado;
      
      if (estaNoCiclo) {
        console.log(`[GraficoComparativo] Transação ${t.id} (${dataTransacao.toDateString()}) está no ciclo ${ciclo.nome}`);
      }
      
      return estaNoCiclo;
    });

    console.log(`[GraficoComparativo] Processando ciclo ${ciclo.nome}: ${transacoesCiclo.length} transações de despesa`);
    console.log(`[GraficoComparativo] Período do ciclo: ${ciclo.inicio.toDateString()} até ${ciclo.fim.toDateString()}`);

    // Calcular total por categoria para este ciclo
    const dadosCiclo: DadosCiclo = {
      ciclo: ciclo.nome,
      cicloCompleto: ciclo.nomeCompleto,
      temLancamentos: false // Será atualizado abaixo
    };

    // Adicionar total por categoria (apenas categorias de despesa)
    const categoriasDespesa = categorias.filter(cat => cat.tipo === "despesa");
    let totalGeralCiclo = 0;
    
    categoriasDespesa.forEach(categoria => {
      const totalCategoria = transacoesCiclo
        .filter(t => t.categoria === categoria.nome)
        .reduce((acc, t) => acc + Math.abs(t.valor), 0);
      
      dadosCiclo[categoria.nome] = totalCategoria;
      totalGeralCiclo += totalCategoria;
      
      if (totalCategoria > 0) {
        console.log(`[GraficoComparativo] ${ciclo.nome} - ${categoria.nome}: R$ ${totalCategoria.toFixed(2)}`);
      }
    });

    // Definir se tem lançamentos baseado nos totais calculados
    dadosCiclo.temLancamentos = totalGeralCiclo > 0;
    
    console.log(`[GraficoComparativo] Ciclo ${ciclo.nome} - Total geral: R$ ${totalGeralCiclo.toFixed(2)} - Tem lançamentos: ${dadosCiclo.temLancamentos}`);

    return dadosCiclo;
  });

  // CORREÇÃO PRINCIPAL: Retornar TODOS os ciclos, não apenas os filtrados
  // O filtro será aplicado apenas na apresentação, se necessário
  console.log("[GraficoComparativo] Todos os ciclos processados:", dadosTabela.map(c => `${c.ciclo} (${c.temLancamentos ? 'com dados' : 'sem dados'})`));

  return { dadosTabela, categoriasDespesa: categorias.filter(cat => cat.tipo === "despesa") };
};
