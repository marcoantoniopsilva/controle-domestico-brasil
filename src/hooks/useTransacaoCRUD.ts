
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Transacao } from "@/types";
import { toast } from "sonner";

/**
 * Hook para operações CRUD de transações
 */
export function useTransacaoCRUD() {
  /**
   * Adiciona uma nova transação
   */
  const handleAddTransacao = useCallback(async (novaTransacao: Omit<Transacao, "id">, usuarioId: string) => {
    try {
      console.log("Adicionando transação:", novaTransacao);
      
      // Usa a data original sem alterações de fuso horário
      const dataAjustada = novaTransacao.data;
      // Converte para formato ISO para garantir formato correto para o banco
      const dataFormatada = dataAjustada.toISOString().split('T')[0];
      
      console.log(`Data original: ${novaTransacao.data.toISOString()}, Data formatada: ${dataFormatada}`);
      
      const insertObj = {
        data: dataFormatada,
        categoria: novaTransacao.categoria,
        valor: novaTransacao.valor,
        parcelas: novaTransacao.parcelas,
        quem_gastou: novaTransacao.quemGastou,
        descricao: novaTransacao.descricao || null,
        tipo: novaTransacao.tipo,
        usuario_id: usuarioId,
      };
      
      console.log("Objeto para inserção:", insertObj);
      
      const { data, error } = await supabase
        .from("lancamentos")
        .insert([insertObj])
        .select(); // Retorna os dados inseridos
      
      if (error) {
        console.error("Erro ao adicionar transação:", error);
        toast.error("Erro ao adicionar transação: " + error.message);
        return false;
      }
      
      console.log("Transação adicionada com sucesso:", data);
      toast.success("Transação registrada com sucesso!");
      return true;
    } catch (error: any) {
      console.error("Erro ao adicionar transação:", error);
      toast.error("Erro ao adicionar transação: " + error.message);
      return false;
    }
  }, []);

  /**
   * Exclui uma transação existente
   */
  const handleExcluirTransacao = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from("lancamentos")
        .delete()
        .eq("id", Number(id));
        
      if (error) {
        console.error("Erro ao excluir transação:", error);
        toast.error("Erro ao excluir transação: " + error.message);
        return false;
      }
      
      toast.success("Transação excluída com sucesso!");
      return true;
    } catch (error: any) {
      console.error("Erro ao excluir transação:", error);
      toast.error("Erro ao excluir transação: " + error.message);
      return false;
    }
  }, []);

  return {
    handleAddTransacao,
    handleExcluirTransacao
  };
}
