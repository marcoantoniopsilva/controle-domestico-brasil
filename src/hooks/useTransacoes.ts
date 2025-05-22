
import { useState, useCallback } from "react";
import { Transacao } from "@/types";
import { useTransacaoFetch } from "./useTransacaoFetch";
import { useTransacaoCRUD } from "./useTransacaoCRUD";
import { useAuth } from "@/hooks/useAuth";

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
    const { data } = await fetchApi(showToast);
    setTransacoes(data || []);
    setLastUpdate(Date.now());
    setIsLoading(false);
  }, [fetchApi]);

  // Função para adicionar uma transação
  const adicionarTransacao = useCallback(async (transacao: Omit<Transacao, "id">) => {
    if (!usuario) return false;
    
    const sucesso = await handleAddTransacao(transacao, usuario.id);
    if (sucesso) {
      // Atualizar dados após adicionar
      await fetchTransacoes();
    }
    return sucesso;
  }, [handleAddTransacao, usuario, fetchTransacoes]);
  
  // Função para excluir uma transação
  const excluirTransacao = useCallback(async (id: string) => {
    const sucesso = await handleExcluirTransacao(id);
    if (sucesso) {
      // Atualizar dados após excluir
      await fetchTransacoes();
    }
    return sucesso;
  }, [handleExcluirTransacao, fetchTransacoes]);
  
  // Função para editar uma transação
  const editarTransacao = useCallback(async (id: string, transacao: Omit<Transacao, "id">) => {
    const sucesso = await handleEditarTransacao(id, transacao);
    if (sucesso) {
      // Atualizar dados após editar
      await fetchTransacoes();
    }
    return sucesso;
  }, [handleEditarTransacao, fetchTransacoes]);

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
