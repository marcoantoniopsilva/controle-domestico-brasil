
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
      
      // Ajustar a data para evitar problemas de fuso horário
      // Criar uma nova data no meio-dia do dia selecionado para evitar mudanças de fuso
      const dataAjustada = new Date(
        novaTransacao.data.getFullYear(),
        novaTransacao.data.getMonth(),
        novaTransacao.data.getDate(),
        12, 0, 0, 0  // Meio-dia
      );
      
      // Formatar para YYYY-MM-DD preservando o dia correto
      const dataFormatada = dataAjustada.toISOString().split('T')[0];
      
      console.log(`Data original: ${novaTransacao.data.toISOString()}`);
      console.log(`Data ajustada: ${dataAjustada.toISOString()}`);
      console.log(`Data formatada para o banco: ${dataFormatada}`);
      
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

  /**
   * Atualiza uma transação existente
   */
  const handleEditarTransacao = useCallback(async (id: string, transacaoAtualizada: Omit<Transacao, "id">) => {
    try {
      console.log("Atualizando transação:", id, transacaoAtualizada);
      
      // Ajustar a data para evitar problemas de fuso horário
      const dataAjustada = new Date(
        transacaoAtualizada.data.getFullYear(),
        transacaoAtualizada.data.getMonth(),
        transacaoAtualizada.data.getDate(),
        12, 0, 0, 0  // Meio-dia
      );
      
      // Formatar para YYYY-MM-DD preservando o dia correto
      const dataFormatada = dataAjustada.toISOString().split('T')[0];
      
      console.log(`Data original: ${transacaoAtualizada.data.toISOString()}`);
      console.log(`Data ajustada: ${dataAjustada.toISOString()}`);
      console.log(`Data formatada para o banco: ${dataFormatada}`);
      
      const updateObj = {
        data: dataFormatada,
        categoria: transacaoAtualizada.categoria,
        valor: transacaoAtualizada.valor,
        parcelas: transacaoAtualizada.parcelas,
        quem_gastou: transacaoAtualizada.quemGastou,
        descricao: transacaoAtualizada.descricao || null,
        tipo: transacaoAtualizada.tipo
      };
      
      console.log("Objeto para atualização:", updateObj);
      
      const { error } = await supabase
        .from("lancamentos")
        .update(updateObj)
        .eq("id", Number(id));
        
      if (error) {
        console.error("Erro ao atualizar transação:", error);
        toast.error("Erro ao atualizar transação: " + error.message);
        return false;
      }
      
      toast.success("Transação atualizada com sucesso!");
      return true;
    } catch (error: any) {
      console.error("Erro ao atualizar transação:", error);
      toast.error("Erro ao atualizar transação: " + error.message);
      return false;
    }
  }, []);

  return {
    handleAddTransacao,
    handleExcluirTransacao,
    handleEditarTransacao
  };
}
