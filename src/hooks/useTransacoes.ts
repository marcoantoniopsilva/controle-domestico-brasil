
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
        setTransacoes((data || []).map((t: any) => ({
          id: t.id.toString(),
          data: new Date(t.data),
          categoria: t.categoria,
          valor: Number(t.valor),
          parcelas: t.parcelas,
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
      
      const { error } = await supabase.from("lancamentos").insert([insertObj]);
      
      if (error) {
        console.error("Erro ao adicionar transação:", error);
        toast.error("Erro ao adicionar transação: " + error.message);
        return false;
      }
      
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
