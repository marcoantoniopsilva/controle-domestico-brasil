import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { Categoria } from "@/types";
import { categorias as categoriasDefault } from "@/utils/financas";

interface CategoryBudget {
  id: string;
  categoria_nome: string;
  categoria_tipo: string;
  orcamento: number;
  ciclo_id: string | null;
}

export function useCategoryBudgets() {
  const { usuario } = useAuth();
  const [customBudgets, setCustomBudgets] = useState<CategoryBudget[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomBudgets = async () => {
    if (!usuario) return;
    
    try {
      const { data, error } = await supabase
        .from('category_budgets')
        .select('*')
        .eq('usuario_id', usuario.id);

      if (error) {
        console.error('Erro ao carregar orçamentos personalizados:', error);
        return;
      }

      setCustomBudgets((data || []).map(d => ({
        ...d,
        ciclo_id: (d as any).ciclo_id ?? null
      })));
    } catch (error) {
      console.error('Erro ao carregar orçamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveBudget = async (categoryName: string, categoryType: string, budget: number, cicloId?: string | null) => {
    if (!usuario) return false;

    try {
      const insertData: any = {
        usuario_id: usuario.id,
        categoria_nome: categoryName,
        categoria_tipo: categoryType,
        orcamento: budget,
        ciclo_id: cicloId ?? null
      };

      // Find existing record
      const { data: existing } = await supabase
        .from('category_budgets')
        .select('id')
        .eq('usuario_id', usuario.id)
        .eq('categoria_nome', categoryName)
        .eq('categoria_tipo', categoryType)
        .then(async (res) => {
          if (res.error) return res;
          // Filter by ciclo_id in JS to avoid deep type issues
          const filtered = (res.data || []).filter((row: any) => 
            cicloId ? row.ciclo_id === cicloId : row.ciclo_id === null
          );
          return { ...res, data: filtered };
        });

      let error;
      if (existing && existing.length > 0) {
        const result = await supabase
          .from('category_budgets')
          .update({ orcamento: budget })
          .eq('id', existing[0].id);
        error = result.error;
      } else {
        const result = await supabase
          .from('category_budgets')
          .insert(insertData);
        error = result.error;
      }

      if (error) {
        console.error('Erro ao salvar orçamento:', error);
        return false;
      }

      await fetchCustomBudgets();
      return true;
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error);
      return false;
    }
  };

  const resetBudget = async (categoryName: string, categoryType: string, cicloId?: string | null) => {
    if (!usuario) return false;

    try {
      let query = supabase
        .from('category_budgets')
        .delete()
        .eq('usuario_id', usuario.id)
        .eq('categoria_nome', categoryName)
        .eq('categoria_tipo', categoryType);

      if (cicloId) {
        query = query.eq('ciclo_id' as any, cicloId);
      } else {
        query = query.is('ciclo_id' as any, null);
      }

      const { error } = await query;

      if (error) {
        console.error('Erro ao resetar orçamento:', error);
        return false;
      }

      await fetchCustomBudgets();
      return true;
    } catch (error) {
      console.error('Erro ao resetar orçamento:', error);
      return false;
    }
  };

  // Hierarchy: cycle-specific > global custom > code default
  const getCategoriesWithCustomBudgets = useCallback((cicloId?: string | null): Categoria[] => {
    return categoriasDefault.map(categoria => {
      // 1. Check cycle-specific budget
      const cycleBudget = cicloId
        ? customBudgets.find(
            custom => custom.categoria_nome === categoria.nome && custom.categoria_tipo === categoria.tipo && custom.ciclo_id === cicloId
          )
        : null;

      if (cycleBudget) {
        return { ...categoria, orcamento: Number(cycleBudget.orcamento) };
      }

      // 2. Check global custom budget (ciclo_id is null)
      const globalBudget = customBudgets.find(
        custom => custom.categoria_nome === categoria.nome && custom.categoria_tipo === categoria.tipo && custom.ciclo_id === null
      );

      if (globalBudget) {
        return { ...categoria, orcamento: Number(globalBudget.orcamento) };
      }

      // 3. Code default
      return categoria;
    });
  }, [customBudgets]);

  useEffect(() => {
    fetchCustomBudgets();
  }, [usuario]);

  return {
    customBudgets,
    loading,
    saveBudget,
    resetBudget,
    getCategoriesWithCustomBudgets,
    refetch: fetchCustomBudgets
  };
}
