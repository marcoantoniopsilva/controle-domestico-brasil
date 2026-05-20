import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type TipoCategoria = "despesa" | "receita" | "investimento";

export interface CategoriaDB {
  id: string;
  nome: string;
  tipo: TipoCategoria;
  orcamento: number;
  grupo_id: string | null;
  ordem: number;
  ativa: boolean;
  is_default: boolean;
}

export interface GrupoDB {
  id: string;
  nome: string;
  icone: string;
  ordem: number;
}

export function useCategorias() {
  const { usuario } = useAuth();
  const [categorias, setCategorias] = useState<CategoriaDB[]>([]);
  const [grupos, setGrupos] = useState<GrupoDB[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!usuario) return;
    setLoading(true);
    const [{ data: cats }, { data: grps }] = await Promise.all([
      (supabase as any).from("categorias").select("*").eq("usuario_id", usuario.id).order("ordem"),
      (supabase as any).from("categoria_grupos").select("*").eq("usuario_id", usuario.id).order("ordem"),
    ]);
    setCategorias(cats || []);
    setGrupos(grps || []);
    setLoading(false);
  }, [usuario]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const createCategoria = async (payload: Omit<CategoriaDB, "id">) => {
    if (!usuario) return false;
    const { error } = await (supabase as any)
      .from("categorias")
      .insert({ ...payload, usuario_id: usuario.id });
    if (error) {
      console.error("createCategoria:", error);
      return false;
    }
    await fetchAll();
    return true;
  };

  const updateCategoria = async (id: string, patch: Partial<CategoriaDB>, opts?: { renameInLancamentos?: { oldName: string; tipo: TipoCategoria } }) => {
    if (!usuario) return false;
    const { error } = await (supabase as any).from("categorias").update(patch).eq("id", id);
    if (error) {
      console.error("updateCategoria:", error);
      return false;
    }
    if (opts?.renameInLancamentos && patch.nome && patch.nome !== opts.renameInLancamentos.oldName) {
      await supabase
        .from("lancamentos")
        .update({ categoria: patch.nome })
        .eq("usuario_id", usuario.id)
        .eq("categoria", opts.renameInLancamentos.oldName)
        .eq("tipo", opts.renameInLancamentos.tipo);
      await (supabase as any)
        .from("category_budgets")
        .update({ categoria_nome: patch.nome })
        .eq("usuario_id", usuario.id)
        .eq("categoria_nome", opts.renameInLancamentos.oldName)
        .eq("categoria_tipo", opts.renameInLancamentos.tipo);
    }
    await fetchAll();
    return true;
  };

  const deleteCategoria = async (id: string, opts?: { migrateTo?: string; nome: string; tipo: TipoCategoria }) => {
    if (!usuario) return false;
    if (opts?.migrateTo) {
      await supabase
        .from("lancamentos")
        .update({ categoria: opts.migrateTo })
        .eq("usuario_id", usuario.id)
        .eq("categoria", opts.nome)
        .eq("tipo", opts.tipo);
    }
    const { error } = await (supabase as any).from("categorias").delete().eq("id", id);
    if (error) {
      console.error("deleteCategoria:", error);
      return false;
    }
    await fetchAll();
    return true;
  };

  const countLancamentos = async (nome: string, tipo: TipoCategoria) => {
    if (!usuario) return 0;
    const { count } = await supabase
      .from("lancamentos")
      .select("id", { count: "exact", head: true })
      .eq("usuario_id", usuario.id)
      .eq("categoria", nome)
      .eq("tipo", tipo);
    return count || 0;
  };

  // Group CRUD
  const createGrupo = async (nome: string, icone: string) => {
    if (!usuario) return false;
    const ordem = grupos.length + 1;
    const { error } = await (supabase as any)
      .from("categoria_grupos")
      .insert({ usuario_id: usuario.id, nome, icone, ordem });
    if (error) {
      console.error("createGrupo:", error);
      return false;
    }
    await fetchAll();
    return true;
  };

  const updateGrupo = async (id: string, patch: Partial<GrupoDB>) => {
    const { error } = await (supabase as any).from("categoria_grupos").update(patch).eq("id", id);
    if (error) {
      console.error("updateGrupo:", error);
      return false;
    }
    await fetchAll();
    return true;
  };

  const deleteGrupo = async (id: string) => {
    const { error } = await (supabase as any).from("categoria_grupos").delete().eq("id", id);
    if (error) {
      console.error("deleteGrupo:", error);
      return false;
    }
    await fetchAll();
    return true;
  };

  return {
    categorias,
    grupos,
    loading,
    refetch: fetchAll,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    countLancamentos,
    createGrupo,
    updateGrupo,
    deleteGrupo,
  };
}