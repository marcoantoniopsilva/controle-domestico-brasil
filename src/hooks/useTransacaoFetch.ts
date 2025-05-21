
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
        // Converte datas de string para objeto Date e ajusta para o fuso horário local
        const transacoesConvertidas = (data || []).map((t: any) => {
          // Garante que a data esteja no formato correto - ajusta para o timezone local
          // Preserva a data original sem ajustes de fuso horário
          const dataOriginal = new Date(t.data);
          
          console.log(`Convertendo data: ${t.data} → ${dataOriginal.toISOString()}`);
          
          return {
            id: t.id.toString(),
            data: dataOriginal,
            categoria: t.categoria,
            valor: Number(t.valor),
            parcelas: t.parcelas || 1,
            quemGastou: t.quem_gastou as "Marco" | "Bruna",
            descricao: t.descricao,
            tipo: t.tipo as "despesa" | "receita",
          };
        });
        
        console.log("Transações convertidas:", transacoesConvertidas.length);
        // Log para depuração: listar as datas das transações
        transacoesConvertidas.forEach((t, idx) => {
          if (idx < 10) { // Limitar a 10 registros para não sobrecarregar o console
            console.log(`Transação ${idx}: data=${t.data.toISOString()}, valor=${t.valor}, categoria=${t.categoria}`);
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
