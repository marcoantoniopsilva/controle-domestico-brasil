
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Transacao, CicloFinanceiro } from "@/types";
import { toast } from "sonner";

export function useTransacoes() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransacoes = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("lancamentos")
        .select("*");
        
      if (error) {
        console.error("Erro ao carregar lançamentos:", error);
        toast.error("Erro ao carregar lançamentos: " + error.message);
      } else {
        console.log("Dados recebidos do Supabase:", data);
        setTransacoes((data || []).map((t: any) => ({
          id: t.id.toString(),
          data: new Date(t.data),
          categoria: t.categoria,
          valor: Number(t.valor),
          parcelas: t.parcelas || 1,
          quemGastou: t.quem_gastou,
          descricao: t.descricao,
          tipo: t.tipo,
        })));
      }
    } catch (error: any) {
      console.error("Erro ao buscar transações:", error);
      toast.error("Erro ao buscar transações: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTransacao = async (novaTransacao: Omit<Transacao, "id">, usuarioId: string) => {
    try {
      console.log("Adicionando transação:", novaTransacao);
      
      const insertObj = {
        data: novaTransacao.data.toISOString().split('T')[0],
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
        .select(); // Adicionado .select() para retornar os dados inseridos
      
      if (error) {
        console.error("Erro ao adicionar transação:", error);
        toast.error("Erro ao adicionar transação: " + error.message);
        return false;
      }
      
      console.log("Transação adicionada com sucesso:", data);
      // Atualizamos os dados imediatamente para não depender somente do fetchTransacoes
      if (data && data.length > 0) {
        const novaTransacaoComId: Transacao = {
          id: data[0].id.toString(),
          data: new Date(data[0].data),
          categoria: data[0].categoria,
          valor: Number(data[0].valor),
          parcelas: data[0].parcelas,
          quemGastou: data[0].quem_gastou,
          descricao: data[0].descricao,
          tipo: data[0].tipo,
        };
        setTransacoes(prev => [novaTransacaoComId, ...prev]);
      }
      
      // Ainda assim buscamos todos os lançamentos para garantir a sincronização
      await fetchTransacoes();
      toast.success("Transação registrada com sucesso!");
      return true;
    } catch (error: any) {
      console.error("Erro ao adicionar transação:", error);
      toast.error("Erro ao adicionar transação: " + error.message);
      return false;
    }
  };

  const handleExcluirTransacao = async (id: string) => {
    try {
      const { error } = await supabase
        .from("lancamentos")
        .delete()
        .eq("id", Number(id));
        
      if (error) {
        console.error("Erro ao excluir transação:", error);
        toast.error("Erro ao excluir transação: " + error.message);
        return;
      }
      
      // Atualizamos localmente para uma resposta mais rápida
      setTransacoes(prev => prev.filter(t => t.id !== id));
      
      // E também buscamos os dados atualizados do servidor
      await fetchTransacoes();
      toast.success("Transação excluída com sucesso!");
    } catch (error: any) {
      console.error("Erro ao excluir transação:", error);
      toast.error("Erro ao excluir transação: " + error.message);
    }
  };

  useEffect(() => {
    fetchTransacoes();
  }, []);

  return {
    transacoes,
    isLoading,
    handleAddTransacao,
    handleExcluirTransacao,
    fetchTransacoes
  };
}
