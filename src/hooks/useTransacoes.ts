
import { useState, useCallback } from "react";
import { Transacao } from "@/types";
import { useTransacaoFetch } from "./useTransacaoFetch";
import { useTransacaoCRUD } from "./useTransacaoCRUD";

export function useTransacoes() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  
  // Importar hooks menores
  const { fetchTransacoes: fetchApi } = useTransacaoFetch();
  const { handleAddTransacao, handleExcluirTransacao } = useTransacaoCRUD();

  // Função para buscar e atualizar transações - apenas sob demanda
  const fetchTransacoes = useCallback(async (showToast: boolean = false) => {
    setIsLoading(true);
    const { data } = await fetchApi(showToast);
    setTransacoes(data || []);
    setLastUpdate(Date.now());
    setIsLoading(false);
  }, [fetchApi]);

  // Não usar useEffect para carregar dados automaticamente
  // Não configurar listeners para atualizações automáticas
  // Não verificar versão da aplicação

  return {
    transacoes,
    isLoading,
    handleAddTransacao,
    handleExcluirTransacao,
    fetchTransacoes,
    lastUpdate
  };
}
