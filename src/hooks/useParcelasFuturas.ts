
import { useMemo } from "react";
import { Transacao, CicloFinanceiro } from "@/types";

export function useParcelasFuturas(transacoes: Transacao[], cicloAtual: CicloFinanceiro) {
  // Função para gerar projeções de parcelas futuras
  const parcelasFuturas = useMemo(() => {
    // Converter cicloAtual para garantir que são objetos Date
    const ciclo = {
      inicio: new Date(cicloAtual.inicio),
      fim: new Date(cicloAtual.fim),
      nome: cicloAtual.nome
    };
    
    console.log(`Gerando parcelas futuras para ciclo: ${ciclo.nome}`);
    console.log(`Data início do ciclo: ${ciclo.inicio.toISOString()}`);
    console.log(`Data fim do ciclo: ${ciclo.fim.toISOString()}`);
    
    // Filtra apenas transações parceladas (parcelas > 1)
    const transacoesParceladas = transacoes.filter(t => t.parcelas > 1);
    
    // Se não tiver transações parceladas, retorna array vazio
    if (transacoesParceladas.length === 0) {
      console.log("Nenhuma transação parcelada encontrada");
      return [];
    }

    console.log(`Gerando parcelas futuras para ${transacoesParceladas.length} transações parceladas`);
    
    const todasParcelas: Transacao[] = [];
    
    // Para cada transação parcelada, projeta as parcelas futuras
    transacoesParceladas.forEach(transacao => {
      // Garantir que estamos trabalhando com um objeto Date
      const dataTransacao = new Date(transacao.data);
      
      console.log(`Gerando parcelas para transação: ${transacao.descricao || transacao.categoria}`, 
                  `ID: ${transacao.id}`,
                  `Data: ${dataTransacao.toISOString()}`,
                  `Total parcelas: ${transacao.parcelas}`);
      
      // Gera as parcelas para todos os meses além do primeiro (que já está na lista de transações)
      for (let i = 2; i <= transacao.parcelas; i++) {
        // Calcula a data da parcela (um mês adicional por parcela)
        const dataParcela = new Date(dataTransacao);
        dataParcela.setMonth(dataTransacao.getMonth() + (i - 1));
        
        // Ajusta o dia se necessário para evitar problemas com meses com diferentes números de dias
        const ultimoDiaDoMes = new Date(
          dataParcela.getFullYear(),
          dataParcela.getMonth() + 1,
          0
        ).getDate();
        
        if (dataParcela.getDate() > ultimoDiaDoMes) {
          dataParcela.setDate(ultimoDiaDoMes);
        }
        
        // Criamos um novo objeto para a parcela futura
        const parcela: Transacao = {
          ...transacao,
          id: `projecao-${transacao.id}-parcela-${i}`,
          data: new Date(dataParcela),  // Garantir que é um novo objeto Date
          descricao: `${transacao.descricao || transacao.categoria} (Parcela ${i}/${transacao.parcelas})`,
          isParcela: true, // Marca como uma parcela projetada
          parcelaAtual: i
        };
        
        console.log(`Gerada parcela ${i}/${transacao.parcelas} para data: ${parcela.data.toISOString()}`);
        todasParcelas.push(parcela);
      }
    });
    
    console.log("Total de parcelas futuras geradas:", todasParcelas.length);
    
    // Log detalhado das primeiras parcelas para depuração
    todasParcelas.forEach((parcela, index) => {
      if (index < 10) { // Limitar a 10 para não sobrecarregar o console
        console.log(`Parcela ${index}: ${parcela.descricao}`);
        console.log(`  Data: ${new Date(parcela.data).toISOString()}`);
        console.log(`  Categoria: ${parcela.categoria}`);
        console.log(`  Valor: ${parcela.valor}`);
      }
    });
    
    return todasParcelas;
  }, [transacoes, cicloAtual]);
  
  return parcelasFuturas;
}
