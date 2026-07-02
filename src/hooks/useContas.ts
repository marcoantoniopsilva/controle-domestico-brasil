import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ContaBancaria, ContaTipo } from "@/types";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

function mapRow(r: any): ContaBancaria {
  return {
    id: r.id,
    nome: r.nome,
    tipo: (r.tipo as ContaTipo) || "corrente",
    banco: r.banco ?? null,
    saldoInicial: Number(r.saldo_inicial) || 0,
    cor: r.cor || "#3B82F6",
    incluirNoSaldo: !!r.incluir_no_saldo,
    ativo: !!r.ativo,
    observacoes: r.observacoes ?? null,
  };
}

export function useContas() {
  const { usuario } = useAuth();
  const [contas, setContas] = useState<ContaBancaria[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContas = useCallback(async () => {
    if (!usuario?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("contas_bancarias")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) {
      console.error("[useContas] erro:", error);
      toast.error("Erro ao carregar contas: " + error.message);
      setLoading(false);
      return;
    }
    setContas((data || []).map(mapRow));
    setLoading(false);
  }, [usuario?.id]);

  useEffect(() => {
    fetchContas();
  }, [fetchContas]);

  const createConta = useCallback(
    async (input: Omit<ContaBancaria, "id">) => {
      if (!usuario?.id) return false;
      const { error } = await (supabase as any).from("contas_bancarias").insert({
        usuario_id: usuario.id,
        nome: input.nome,
        tipo: input.tipo,
        banco: input.banco ?? null,
        saldo_inicial: input.saldoInicial,
        cor: input.cor,
        incluir_no_saldo: input.incluirNoSaldo,
        ativo: input.ativo,
        observacoes: input.observacoes ?? null,
      });
      if (error) {
        toast.error("Erro ao criar conta: " + error.message);
        return false;
      }
      toast.success("Conta criada");
      await fetchContas();
      return true;
    },
    [usuario?.id, fetchContas]
  );

  const updateConta = useCallback(
    async (id: string, patch: Partial<Omit<ContaBancaria, "id">>) => {
      const payload: any = {};
      if (patch.nome !== undefined) payload.nome = patch.nome;
      if (patch.tipo !== undefined) payload.tipo = patch.tipo;
      if (patch.banco !== undefined) payload.banco = patch.banco;
      if (patch.saldoInicial !== undefined) payload.saldo_inicial = patch.saldoInicial;
      if (patch.cor !== undefined) payload.cor = patch.cor;
      if (patch.incluirNoSaldo !== undefined) payload.incluir_no_saldo = patch.incluirNoSaldo;
      if (patch.ativo !== undefined) payload.ativo = patch.ativo;
      if (patch.observacoes !== undefined) payload.observacoes = patch.observacoes;
      const { error } = await (supabase as any)
        .from("contas_bancarias")
        .update(payload)
        .eq("id", id);
      if (error) {
        toast.error("Erro ao atualizar conta: " + error.message);
        return false;
      }
      toast.success("Conta atualizada");
      await fetchContas();
      return true;
    },
    [fetchContas]
  );

  const deleteConta = useCallback(
    async (id: string) => {
      const { error } = await (supabase as any)
        .from("contas_bancarias")
        .delete()
        .eq("id", id);
      if (error) {
        toast.error("Erro ao excluir conta: " + error.message);
        return false;
      }
      toast.success("Conta excluída");
      await fetchContas();
      return true;
    },
    [fetchContas]
  );

  return { contas, loading, createConta, updateConta, deleteConta, refetch: fetchContas };
}

export const TIPOS_CONTA: { value: ContaTipo; label: string }[] = [
  { value: "corrente", label: "Conta corrente" },
  { value: "poupanca", label: "Poupança" },
  { value: "carteira", label: "Carteira digital" },
  { value: "dinheiro", label: "Dinheiro em espécie" },
  { value: "investimento", label: "Conta de investimento" },
  { value: "outro", label: "Outro" },
];
