
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Transacao } from "@/types";
import { toast } from "sonner";

/**
 * Hook para operações CRUD de transações
 */
export function useTransacaoCRUD() {
  /**
   * Formata uma data para YYYY-MM-DD usando componentes da data
   */
  const formatarDataParaBanco = (data: Date): string => {
    // Usar os componentes da data diretamente para evitar problemas de timezone
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    const dataFormatada = `${ano}-${mes}-${dia}`;
    
    console.log(`[useTransacaoCRUD] Formatando data: ano=${ano}, mes=${mes}, dia=${dia} → ${dataFormatada}`);
    console.log(`[useTransacaoCRUD] Data original: ${data.toDateString()} → ${dataFormatada}`);
    return dataFormatada;
  };

  /**
   * Adiciona uma nova transação
   */
  const handleAddTransacao = useCallback(async (novaTransacao: Omit<Transacao, "id">, usuarioId: string) => {
    try {
      console.log("Adicionando transação:", novaTransacao);
      
      const dataFormatada = formatarDataParaBanco(novaTransacao.data);
      
      const insertObj = {
        data: dataFormatada,
        categoria: novaTransacao.categoria,
        valor: novaTransacao.valor,
        parcelas: novaTransacao.parcelas,
        quem_gastou: novaTransacao.quemGastou,
        descricao: novaTransacao.descricao || null,
        tipo: novaTransacao.tipo,
        ganhos: novaTransacao.ganhos || 0, // Incluir ganhos
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
      
      const dataFormatada = formatarDataParaBanco(transacaoAtualizada.data);
      
      const updateObj = {
        data: dataFormatada,
        categoria: transacaoAtualizada.categoria,
        valor: transacaoAtualizada.valor,
        parcelas: transacaoAtualizada.parcelas,
        quem_gastou: transacaoAtualizada.quemGastou,
        descricao: transacaoAtualizada.descricao || null,
        tipo: transacaoAtualizada.tipo,
        ganhos: transacaoAtualizada.ganhos || 0 // Incluir ganhos
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
