
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Transacao } from "@/types";
import { toast } from "sonner";

/**
 * Hook para buscar dados de transações do Supabase
 */
export function useTransacaoFetch() {
  /**
   * Busca todas as transações do usuário
   */
  const fetchTransacoes = useCallback(async (showToast: boolean = false) => {
    try {
      console.log("Buscando transações...");
      
      // Consulta básica sem parâmetros de cache busting
      const { data, error } = await supabase
        .from("lancamentos")
        .select("*")
        .order('data', { ascending: false });
        
      if (error) {
        console.error("Erro ao carregar lançamentos:", error);
        toast.error("Erro ao carregar lançamentos: " + error.message);
        return { data: [], error };
      } else {
        console.log("Dados recebidos do Supabase:", data);
        
        // Converter datas SEM adicionar 1 dia - usar a data exata do banco
        const transacoesConvertidas = (data || []).map((t: any) => {
          // Criar data a partir da string YYYY-MM-DD do banco
          const [ano, mes, dia] = t.data.split('-').map(Number);
          const dataOriginal = new Date(ano, mes - 1, dia);
          
          console.log(`[useTransacaoFetch] Data do banco: "${t.data}" → Data convertida: "${dataOriginal.toDateString()}"`);
          
          return {
            id: t.id.toString(),
            data: dataOriginal, // Usar a data original SEM correção
            categoria: t.categoria,
            valor: Number(t.valor),
            parcelas: t.parcelas || 1,
            quemGastou: t.quem_gastou as "Marco" | "Bruna",
            descricao: t.descricao,
            tipo: t.tipo as "despesa" | "receita" | "investimento",
            ganhos: Number(t.ganhos) || 0, // Incluir ganhos
          };
        });
        
        console.log("Transações convertidas:", transacoesConvertidas.length);
        // Log para depuração: listar as datas das transações
        transacoesConvertidas.forEach((t, idx) => {
          if (idx < 10) { // Aumentar para 10 registros para ver mais exemplos
            console.log(`[useTransacaoFetch] Transação ${idx}: id=${t.id}, data=${t.data.toDateString()}, valor=${t.valor}, categoria=${t.categoria}, tipo=${t.tipo}, ganhos=${t.ganhos}`);
          }
        });
        
        if (showToast) {
          toast.success("Dados atualizados com sucesso!");
        }
        
        return { data: transacoesConvertidas, error: null };
      }
    } catch (error: any) {
      console.error("Erro ao buscar transações:", error);
      toast.error("Erro ao buscar transações: " + error.message);
      return { data: [], error };
    }
  }, []);

  return {
    fetchTransacoes
  };
}
