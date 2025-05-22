
import { useState, useCallback, useEffect } from "react";
import { Transacao } from "@/types";
import { useTransacaoFetch } from "./useTransacaoFetch";
import { useTransacaoCRUD } from "./useTransacaoCRUD";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export function useTransacoes() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  const { usuario } = useAuth();
  
  // Importar hooks menores
  const { fetchTransacoes: fetchApi } = useTransacaoFetch();
  const { handleAddTransacao, handleExcluirTransacao, handleEditarTransacao } = useTransacaoCRUD();

  // Função para buscar e atualizar transações - apenas sob demanda
  const fetchTransacoes = useCallback(async (showToast: boolean = false) => {
    setIsLoading(true);
    try {
      console.log("[useTransacoes] Buscando transações do Supabase...");
      const { data, error } = await fetchApi(showToast);
      
      if (error) {
        console.error("[useTransacoes] Erro ao buscar transações:", error);
        if (showToast) {
          toast.error("Erro ao buscar transações: " + error.message);
        }
        setIsLoading(false);
        return { success: false, data: [] };
      }
      
      console.log(`[useTransacoes] Encontradas ${data?.length || 0} transações`);
      setTransacoes(data || []);
      setLastUpdate(Date.now());
      setIsLoading(false);
      return { success: true, data };
    } catch (error: any) {
      console.error("[useTransacoes] Erro ao buscar transações:", error);
      if (showToast) {
        toast.error("Erro ao buscar transações: " + error.message);
      }
      setIsLoading(false);
      return { success: false, data: [] };
    }
  }, [fetchApi]);

  // Função para adicionar uma transação
  const adicionarTransacao = useCallback(async (transacao: Omit<Transacao, "id">) => {
    if (!usuario) return false;
    
    try {
      setIsLoading(true);
      const sucesso = await handleAddTransacao(transacao, usuario.id);
      if (sucesso) {
        // Atualizar dados após adicionar
        await fetchTransacoes();
      }
      setIsLoading(false);
      return sucesso;
    } catch (error) {
      console.error("[useTransacoes] Erro ao adicionar transação:", error);
      setIsLoading(false);
      return false;
    }
  }, [handleAddTransacao, usuario, fetchTransacoes]);
  
  // Função para excluir uma transação
  const excluirTransacao = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      const sucesso = await handleExcluirTransacao(id);
      if (sucesso) {
        // Atualizar dados após excluir
        await fetchTransacoes();
      }
      setIsLoading(false);
      return sucesso;
    } catch (error) {
      console.error("[useTransacoes] Erro ao excluir transação:", error);
      setIsLoading(false);
      return false;
    }
  }, [handleExcluirTransacao, fetchTransacoes]);
  
  // Função para editar uma transação
  const editarTransacao = useCallback(async (id: string, transacao: Omit<Transacao, "id">) => {
    try {
      setIsLoading(true);
      const sucesso = await handleEditarTransacao(id, transacao);
      if (sucesso) {
        // Atualizar dados após editar
        await fetchTransacoes();
      }
      setIsLoading(false);
      return sucesso;
    } catch (error) {
      console.error("[useTransacoes] Erro ao editar transação:", error);
      setIsLoading(false);
      return false;
    }
  }, [handleEditarTransacao, fetchTransacoes]);
  
  // Carregamento inicial apenas uma vez
  useEffect(() => {
    if (usuario?.id) {
      console.log("[useTransacoes] Carregamento inicial de dados");
      fetchTransacoes();
    }
  }, [usuario?.id]);

  return {
    transacoes,
    isLoading,
    adicionarTransacao,
    excluirTransacao,
    editarTransacao,
    fetchTransacoes,
    lastUpdate
  };
}
