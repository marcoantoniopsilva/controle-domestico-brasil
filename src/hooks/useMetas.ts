import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MetaFinanceira, MetaAporte } from "@/types";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

function mapMeta(r: any): MetaFinanceira {
  return {
    id: r.id,
    nome: r.nome,
    tipo: r.tipo,
    valorAlvo: Number(r.valor_alvo),
    valorInicial: Number(r.valor_inicial ?? 0),
    prazo: r.prazo,
    cor: r.cor,
    icone: r.icone,
    concluida: r.concluida,
    ordem: r.ordem,
  };
}

function mapAporte(r: any): MetaAporte {
  return {
    id: r.id,
    metaId: r.meta_id,
    valor: Number(r.valor),
    data: r.data,
    observacao: r.observacao,
  };
}

export function useMetas() {
  const { usuario } = useAuth();
  const [metas, setMetas] = useState<MetaFinanceira[]>([]);
  const [aportes, setAportes] = useState<MetaAporte[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!usuario?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const [m, a] = await Promise.all([
      (supabase as any)
        .from("metas_financeiras")
        .select("*")
        .order("ordem", { ascending: true })
        .order("created_at", { ascending: true }),
      (supabase as any)
        .from("metas_aportes")
        .select("*")
        .order("data", { ascending: false }),
    ]);
    if (m.error) toast.error("Erro ao carregar metas: " + m.error.message);
    if (a.error) toast.error("Erro ao carregar aportes: " + a.error.message);
    setMetas((m.data || []).map(mapMeta));
    setAportes((a.data || []).map(mapAporte));
    setLoading(false);
  }, [usuario?.id]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const progressoPorMeta = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of metas) map.set(m.id, m.valorInicial);
    for (const a of aportes) map.set(a.metaId, (map.get(a.metaId) || 0) + a.valor);
    return map;
  }, [metas, aportes]);

  const createMeta = useCallback(
    async (input: Omit<MetaFinanceira, "id" | "concluida" | "ordem"> & { ordem?: number }) => {
      if (!usuario?.id) return false;
      const { error } = await (supabase as any).from("metas_financeiras").insert({
        usuario_id: usuario.id,
        nome: input.nome,
        tipo: input.tipo,
        valor_alvo: input.valorAlvo,
        valor_inicial: input.valorInicial,
        prazo: input.prazo,
        cor: input.cor,
        icone: input.icone,
        ordem: input.ordem ?? 0,
      });
      if (error) return toast.error("Erro ao criar meta: " + error.message), false;
      toast.success("Meta criada");
      await fetchAll();
      return true;
    },
    [usuario?.id, fetchAll]
  );

  const updateMeta = useCallback(
    async (id: string, patch: Partial<MetaFinanceira>) => {
      const payload: any = {};
      if (patch.nome !== undefined) payload.nome = patch.nome;
      if (patch.tipo !== undefined) payload.tipo = patch.tipo;
      if (patch.valorAlvo !== undefined) payload.valor_alvo = patch.valorAlvo;
      if (patch.valorInicial !== undefined) payload.valor_inicial = patch.valorInicial;
      if (patch.prazo !== undefined) payload.prazo = patch.prazo;
      if (patch.cor !== undefined) payload.cor = patch.cor;
      if (patch.icone !== undefined) payload.icone = patch.icone;
      if (patch.concluida !== undefined) payload.concluida = patch.concluida;
      if (patch.ordem !== undefined) payload.ordem = patch.ordem;
      const { error } = await (supabase as any)
        .from("metas_financeiras")
        .update(payload)
        .eq("id", id);
      if (error) return toast.error("Erro ao atualizar meta: " + error.message), false;
      await fetchAll();
      return true;
    },
    [fetchAll]
  );

  const deleteMeta = useCallback(
    async (id: string) => {
      const { error } = await (supabase as any).from("metas_financeiras").delete().eq("id", id);
      if (error) return toast.error("Erro ao excluir meta: " + error.message), false;
      toast.success("Meta excluída");
      await fetchAll();
      return true;
    },
    [fetchAll]
  );

  const addAporte = useCallback(
    async (metaId: string, valor: number, data: string, observacao?: string) => {
      if (!usuario?.id) return false;
      const { error } = await (supabase as any).from("metas_aportes").insert({
        meta_id: metaId,
        usuario_id: usuario.id,
        valor,
        data,
        observacao: observacao || null,
      });
      if (error) return toast.error("Erro ao registrar aporte: " + error.message), false;
      toast.success("Aporte registrado");
      await fetchAll();
      return true;
    },
    [usuario?.id, fetchAll]
  );

  const deleteAporte = useCallback(
    async (id: string) => {
      const { error } = await (supabase as any).from("metas_aportes").delete().eq("id", id);
      if (error) return toast.error("Erro ao excluir aporte: " + error.message), false;
      await fetchAll();
      return true;
    },
    [fetchAll]
  );

  return {
    metas,
    aportes,
    loading,
    progressoPorMeta,
    createMeta,
    updateMeta,
    deleteMeta,
    addAporte,
    deleteAporte,
    refetch: fetchAll,
  };
}