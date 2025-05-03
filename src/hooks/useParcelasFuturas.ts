
import { useMemo } from "react";
import { Transacao, CicloFinanceiro } from "@/types";

export function useParcelasFuturas(transacoes: Transacao[], cicloAtual: CicloFinanceiro) {
  // Função para gerar projeções de parcelas futuras
  const parcelasFuturas = useMemo(() => {
    // Garantir que cicloAtual contém objetos Date válidos
    const ciclo = {
      inicio: new Date(cicloAtual.inicio),
      fim: new Date(cicloAtual.fim),
      nome: cicloAtual.nome
    };
    
    console.log(`[useParcelasFuturas] Gerando parcelas futuras para ciclo: ${ciclo.nome}`);
    
    // Verificar se as datas são válidas
    if (isNaN(ciclo.inicio.getTime()) || isNaN(ciclo.fim.getTime())) {
      console.error("[useParcelasFuturas] Datas de ciclo inválidas!");
      return [];
    }
    
    ciclo.inicio.setHours(0, 0, 0, 0);
    ciclo.fim.setHours(23, 59, 59, 999);
    
    // Filtra apenas transações parceladas (parcelas > 1)
    const transacoesParceladas = transacoes.filter(t => t.parcelas > 1);
    
    // Se não tiver transações parceladas, retorna array vazio
    if (transacoesParceladas.length === 0) {
      console.log("[useParcelasFuturas] Nenhuma transação parcelada encontrada");
      return [];
    }

    console.log(`[useParcelasFuturas] Processando ${transacoesParceladas.length} transações parceladas`);
    
    const todasParcelas: Transacao[] = [];
    
    // Para cada transação parcelada, projeta as parcelas futuras
    transacoesParceladas.forEach(transacao => {
      if (transacao.isParcela) {
        console.log(`[useParcelasFuturas] Ignorando transação que já é uma parcela projetada: ${transacao.id}`);
        return; // Ignorar transações que já são parcelas projetadas
      }
      
      // Garantir que estamos trabalhando com um objeto Date
      const dataTransacao = new Date(transacao.data);
      
      // Verificar se a data é válida
      if (isNaN(dataTransacao.getTime())) {
        console.error(`[useParcelasFuturas] Data inválida para transação ${transacao.id}`);
        return;
      }
      
      console.log(`[useParcelasFuturas] Gerando parcelas para: ${transacao.descricao || transacao.categoria}`);
      
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
        
        // Verificar se a data da parcela é válida
        if (isNaN(dataParcela.getTime())) {
          console.error(`[useParcelasFuturas] Data da parcela ${i} inválida para transação ${transacao.id}`);
          continue;
        }
        
        // Verificar se esta parcela está dentro do ciclo atual
        dataParcela.setHours(0, 0, 0, 0);
        const parcelaEstaNoCiclo = dataParcela >= ciclo.inicio && dataParcela <= ciclo.fim;
        
        if (!parcelaEstaNoCiclo) {
          // Se a parcela não está neste ciclo, não adiciona
          console.log(`[useParcelasFuturas] Parcela ${i}/${transacao.parcelas} não está no ciclo atual`);
          continue;
        }
        
        // Criamos um novo objeto para a parcela futura
        const parcela: Transacao = {
          ...transacao,
          id: `projecao-${transacao.id}-parcela-${i}`,
          data: dataParcela,
          descricao: `${transacao.descricao || transacao.categoria} (Parcela ${i}/${transacao.parcelas})`,
          isParcela: true, // Marca como uma parcela projetada
          parcelaAtual: i
        };
        
        console.log(`[useParcelasFuturas] Adicionada parcela ${i}/${transacao.parcelas} ao ciclo ${ciclo.nome}`);
        todasParcelas.push(parcela);
      }
    });
    
    console.log(`[useParcelasFuturas] Total de parcelas futuras para o ciclo: ${todasParcelas.length}`);
    
    return todasParcelas;
  }, [transacoes, cicloAtual]);
  
  return parcelasFuturas;
}
