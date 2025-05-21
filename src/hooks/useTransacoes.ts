
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Transacao } from "@/types";
import { toast } from "sonner";

export function useTransacoes() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  const fetchTransacoes = useCallback(async (showToast: boolean = false) => {
    setIsLoading(true);
    
    try {
      console.log("Buscando transações...");
      
      // Removendo o parâmetro fictício cache_buster que estava causando erro
      const { data, error } = await supabase
        .from("lancamentos")
        .select("*")
        .order('data', { ascending: false });
        
      if (error) {
        console.error("Erro ao carregar lançamentos:", error);
        toast.error("Erro ao carregar lançamentos: " + error.message);
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
        setTransacoes(transacoesConvertidas);
        setLastUpdate(Date.now());
        
        if (showToast) {
          toast.success("Dados atualizados com sucesso!");
        }
      }
    } catch (error: any) {
      console.error("Erro ao buscar transações:", error);
      toast.error("Erro ao buscar transações: " + error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAddTransacao = async (novaTransacao: Omit<Transacao, "id">, usuarioId: string) => {
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
      
      // Recarregar todos os dados para garantir sincronização completa
      await fetchTransacoes(true);
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
      
      // Recarregar todos os dados para garantir sincronização completa
      await fetchTransacoes(true);
      toast.success("Transação excluída com sucesso!");
    } catch (error: any) {
      console.error("Erro ao excluir transação:", error);
      toast.error("Erro ao excluir transação: " + error.message);
    }
  };

  // Inicialização - carrega transações na montagem do componente
  useEffect(() => {
    fetchTransacoes();
    
    // Configurar canal de tempo real para atualizações de transações
    const channel = supabase
      .channel('custom-lancamentos-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'lancamentos' }, 
        () => {
          console.log("[useTransacoes] Alteração detectada na tabela lancamentos");
          fetchTransacoes();
        }
      )
      .subscribe();
      
    // Limpar inscrição ao desmontar
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTransacoes]);

  return {
    transacoes,
    isLoading,
    handleAddTransacao,
    handleExcluirTransacao,
    fetchTransacoes,
    lastUpdate
  };
}
