import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CartaoCredito } from "@/types";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

function mapRow(r: any): CartaoCredito {
  return {
    id: r.id,
    nome: r.nome,
    bandeira: r.bandeira,
    banco: r.banco,
    cor: r.cor,
    diaFechamento: r.dia_fechamento,
    diaVencimento: r.dia_vencimento,
    metaMensal: r.meta_mensal !== null ? Number(r.meta_mensal) : null,
    ativo: r.ativo,
    ordem: r.ordem,
  };
}

export function useCartoes() {
  const { usuario } = useAuth();
  const [cartoes, setCartoes] = useState<CartaoCredito[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCartoes = useCallback(async () => {
    if (!usuario?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("cartoes_credito")
      .select("*")
      .order("ordem", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) {
      console.error("[useCartoes] erro:", error);
      toast.error("Erro ao carregar cartões: " + error.message);
      setLoading(false);
      return;
    }
    setCartoes((data || []).map(mapRow));
    setLoading(false);
  }, [usuario?.id]);

  useEffect(() => {
    fetchCartoes();
  }, [fetchCartoes]);

  const createCartao = useCallback(
    async (input: Omit<CartaoCredito, "id">) => {
      if (!usuario?.id) return false;
      const { error } = await (supabase as any).from("cartoes_credito").insert({
        usuario_id: usuario.id,
        nome: input.nome,
        bandeira: input.bandeira ?? null,
        banco: input.banco ?? null,
        cor: input.cor,
        dia_fechamento: input.diaFechamento,
        dia_vencimento: input.diaVencimento,
        meta_mensal: input.metaMensal ?? null,
        ativo: input.ativo,
        ordem: input.ordem,
      });
      if (error) {
        toast.error("Erro ao criar cartão: " + error.message);
        return false;
      }
      toast.success("Cartão criado");
      await fetchCartoes();
      return true;
    },
    [usuario?.id, fetchCartoes]
  );

  const updateCartao = useCallback(
    async (id: string, patch: Partial<Omit<CartaoCredito, "id">>) => {
      const payload: any = {};
      if (patch.nome !== undefined) payload.nome = patch.nome;
      if (patch.bandeira !== undefined) payload.bandeira = patch.bandeira;
      if (patch.banco !== undefined) payload.banco = patch.banco;
      if (patch.cor !== undefined) payload.cor = patch.cor;
      if (patch.diaFechamento !== undefined) payload.dia_fechamento = patch.diaFechamento;
      if (patch.diaVencimento !== undefined) payload.dia_vencimento = patch.diaVencimento;
      if (patch.metaMensal !== undefined) payload.meta_mensal = patch.metaMensal;
      if (patch.ativo !== undefined) payload.ativo = patch.ativo;
      if (patch.ordem !== undefined) payload.ordem = patch.ordem;
      const { error } = await (supabase as any)
        .from("cartoes_credito")
        .update(payload)
        .eq("id", id);
      if (error) {
        toast.error("Erro ao atualizar cartão: " + error.message);
        return false;
      }
      toast.success("Cartão atualizado");
      await fetchCartoes();
      return true;
    },
    [fetchCartoes]
  );

  const deleteCartao = useCallback(
    async (id: string) => {
      const { error } = await (supabase as any)
        .from("cartoes_credito")
        .delete()
        .eq("id", id);
      if (error) {
        toast.error("Erro ao excluir cartão: " + error.message);
        return false;
      }
      toast.success("Cartão excluído");
      await fetchCartoes();
      return true;
    },
    [fetchCartoes]
  );

  return { cartoes, loading, createCartao, updateCartao, deleteCartao, refetch: fetchCartoes };
}