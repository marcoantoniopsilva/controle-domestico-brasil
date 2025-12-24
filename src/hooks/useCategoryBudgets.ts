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
}

export function useCategoryBudgets() {
  const { usuario } = useAuth();
  const [customBudgets, setCustomBudgets] = useState<CategoryBudget[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar orçamentos personalizados do banco
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

      setCustomBudgets(data || []);
    } catch (error) {
      console.error('Erro ao carregar orçamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Salvar orçamento personalizado
  const saveBudget = async (categoryName: string, categoryType: string, budget: number) => {
    if (!usuario) return false;

    try {
      const { error } = await supabase
        .from('category_budgets')
        .upsert({
          usuario_id: usuario.id,
          categoria_nome: categoryName,
          categoria_tipo: categoryType,
          orcamento: budget
        }, {
          onConflict: 'usuario_id,categoria_nome,categoria_tipo'
        });

      if (error) {
        console.error('Erro ao salvar orçamento:', error);
        return false;
      }

      // Recarregar dados
      await fetchCustomBudgets();
      return true;
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error);
      return false;
    }
  };

  // Resetar orçamento para o padrão
  const resetBudget = async (categoryName: string, categoryType: string) => {
    if (!usuario) return false;

    try {
      const { error } = await supabase
        .from('category_budgets')
        .delete()
        .eq('usuario_id', usuario.id)
        .eq('categoria_nome', categoryName)
        .eq('categoria_tipo', categoryType);

      if (error) {
        console.error('Erro ao resetar orçamento:', error);
        return false;
      }

      // Recarregar dados
      await fetchCustomBudgets();
      return true;
    } catch (error) {
      console.error('Erro ao resetar orçamento:', error);
      return false;
    }
  };

  // Obter categorias com orçamentos personalizados aplicados
  const getCategoriesWithCustomBudgets = useCallback((): Categoria[] => {
    return categoriasDefault.map(categoria => {
      const customBudget = customBudgets.find(
        custom => custom.categoria_nome === categoria.nome && custom.categoria_tipo === categoria.tipo
      );

      return {
        ...categoria,
        orcamento: customBudget ? Number(customBudget.orcamento) : categoria.orcamento
      };
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