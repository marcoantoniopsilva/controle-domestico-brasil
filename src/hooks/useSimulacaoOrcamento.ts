// Hook para gerenciamento de simulação de orçamento anual
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useCategoryBudgets } from "./useCategoryBudgets";
import { SimulacaoMes, SimulacaoCategoria, TotaisSimulacao, SaldoMensal } from "@/types/simulacao";
import { toast } from "sonner";

const ANO_SIMULACAO = 2026;

export function useSimulacaoOrcamento() {
  const { usuario } = useAuth();
  const { getCategoriesWithCustomBudgets, loading: loadingBudgets } = useCategoryBudgets();
  const [simulacao, setSimulacao] = useState<SimulacaoMes[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Inicializar simulação com orçamentos base
  const inicializarSimulacao = useCallback(() => {
    const categorias = getCategoriesWithCustomBudgets();
    const meses: SimulacaoMes[] = [];

    for (let mes = 1; mes <= 12; mes++) {
      const categoriasSimulacao: SimulacaoCategoria[] = categorias.map(cat => ({
        categoriaNome: cat.nome,
        categoriaTipo: cat.tipo as "despesa" | "receita" | "investimento",
        valorPrevisto: cat.orcamento,
        valorOrcamentoBase: cat.orcamento
      }));

      meses.push({
        mes,
        ano: ANO_SIMULACAO,
        categorias: categoriasSimulacao
      });
    }

    return meses;
  }, [getCategoriesWithCustomBudgets]);

  // Carregar dados do Supabase
  const carregarSimulacao = useCallback(async () => {
    if (!usuario || loadingBudgets) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('simulacoes_orcamento')
        .select('*')
        .eq('usuario_id', usuario.id)
        .eq('ano', ANO_SIMULACAO);

      if (error) {
        console.error('Erro ao carregar simulação:', error);
        toast.error('Erro ao carregar simulação');
        return;
      }

      // Se não tem dados, inicializar com orçamentos base
      if (!data || data.length === 0) {
        const novaSimulacao = inicializarSimulacao();
        setSimulacao(novaSimulacao);
        return;
      }

      // Montar simulação a partir dos dados salvos
      const categorias = getCategoriesWithCustomBudgets();
      const meses: SimulacaoMes[] = [];

      for (let mes = 1; mes <= 12; mes++) {
        const categoriasSimulacao: SimulacaoCategoria[] = categorias.map(cat => {
          const saved = data.find(
            d => d.mes === mes && 
            d.categoria_nome === cat.nome && 
            d.categoria_tipo === cat.tipo
          );

          return {
            categoriaNome: cat.nome,
            categoriaTipo: cat.tipo as "despesa" | "receita" | "investimento",
            valorPrevisto: saved ? Number(saved.valor_previsto) : cat.orcamento,
            valorOrcamentoBase: cat.orcamento
          };
        });

        meses.push({
          mes,
          ano: ANO_SIMULACAO,
          categorias: categoriasSimulacao
        });
      }

      setSimulacao(meses);
    } catch (error) {
      console.error('Erro ao carregar simulação:', error);
      toast.error('Erro ao carregar simulação');
    } finally {
      setLoading(false);
    }
  }, [usuario, loadingBudgets, inicializarSimulacao, getCategoriesWithCustomBudgets]);

  // Salvar valor alterado
  const salvarValor = useCallback(async (
    mes: number,
    categoriaNome: string,
    categoriaTipo: string,
    valorPrevisto: number
  ) => {
    if (!usuario) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('simulacoes_orcamento')
        .upsert({
          usuario_id: usuario.id,
          ano: ANO_SIMULACAO,
          mes,
          categoria_nome: categoriaNome,
          categoria_tipo: categoriaTipo,
          valor_previsto: valorPrevisto
        }, {
          onConflict: 'usuario_id,ano,mes,categoria_nome,categoria_tipo'
        });

      if (error) {
        console.error('Erro ao salvar:', error);
        toast.error('Erro ao salvar alteração');
        return;
      }

      // Atualizar estado local
      setSimulacao(prev => prev.map(m => {
        if (m.mes !== mes) return m;
        return {
          ...m,
          categorias: m.categorias.map(c => {
            if (c.categoriaNome !== categoriaNome || c.categoriaTipo !== categoriaTipo) return c;
            return { ...c, valorPrevisto };
          })
        };
      }));
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar alteração');
    } finally {
      setSaving(false);
    }
  }, [usuario]);

  // Resetar mês para orçamentos base
  const resetarMes = useCallback(async (mes: number) => {
    if (!usuario) return;

    try {
      const { error } = await supabase
        .from('simulacoes_orcamento')
        .delete()
        .eq('usuario_id', usuario.id)
        .eq('ano', ANO_SIMULACAO)
        .eq('mes', mes);

      if (error) {
        console.error('Erro ao resetar mês:', error);
        toast.error('Erro ao resetar mês');
        return;
      }

      // Atualizar estado local
      const categorias = getCategoriesWithCustomBudgets();
      setSimulacao(prev => prev.map(m => {
        if (m.mes !== mes) return m;
        return {
          ...m,
          categorias: categorias.map(cat => ({
            categoriaNome: cat.nome,
            categoriaTipo: cat.tipo as "despesa" | "receita" | "investimento",
            valorPrevisto: cat.orcamento,
            valorOrcamentoBase: cat.orcamento
          }))
        };
      }));

      toast.success(`Mês ${mes} resetado para valores base`);
    } catch (error) {
      console.error('Erro ao resetar mês:', error);
      toast.error('Erro ao resetar mês');
    }
  }, [usuario, getCategoriesWithCustomBudgets]);

  // Resetar toda a simulação
  const resetarTudo = useCallback(async () => {
    if (!usuario) return;

    try {
      const { error } = await supabase
        .from('simulacoes_orcamento')
        .delete()
        .eq('usuario_id', usuario.id)
        .eq('ano', ANO_SIMULACAO);

      if (error) {
        console.error('Erro ao resetar simulação:', error);
        toast.error('Erro ao resetar simulação');
        return;
      }

      const novaSimulacao = inicializarSimulacao();
      setSimulacao(novaSimulacao);
      toast.success('Simulação resetada para valores base');
    } catch (error) {
      console.error('Erro ao resetar simulação:', error);
      toast.error('Erro ao resetar simulação');
    }
  }, [usuario, inicializarSimulacao]);

  // Copiar valores de um mês para todos os outros
  const copiarParaTodosMeses = useCallback(async (mesOrigem: number) => {
    if (!usuario) return;

    const mesRef = simulacao.find(m => m.mes === mesOrigem);
    if (!mesRef) return;

    setSaving(true);
    try {
      // Preparar dados para upsert
      const dadosParaSalvar = [];
      for (let mes = 1; mes <= 12; mes++) {
        if (mes === mesOrigem) continue;
        for (const cat of mesRef.categorias) {
          dadosParaSalvar.push({
            usuario_id: usuario.id,
            ano: ANO_SIMULACAO,
            mes,
            categoria_nome: cat.categoriaNome,
            categoria_tipo: cat.categoriaTipo,
            valor_previsto: cat.valorPrevisto
          });
        }
      }

      const { error } = await supabase
        .from('simulacoes_orcamento')
        .upsert(dadosParaSalvar, {
          onConflict: 'usuario_id,ano,mes,categoria_nome,categoria_tipo'
        });

      if (error) {
        console.error('Erro ao copiar valores:', error);
        toast.error('Erro ao copiar valores');
        return;
      }

      // Atualizar estado local
      setSimulacao(prev => prev.map(m => {
        if (m.mes === mesOrigem) return m;
        return {
          ...m,
          categorias: mesRef.categorias.map(cat => ({ ...cat }))
        };
      }));

      toast.success('Valores copiados para todos os meses');
    } catch (error) {
      console.error('Erro ao copiar valores:', error);
      toast.error('Erro ao copiar valores');
    } finally {
      setSaving(false);
    }
  }, [usuario, simulacao]);

  // Calcular totais
  const calcularTotais = useCallback((): TotaisSimulacao => {
    let totalReceitas = 0;
    let totalDespesas = 0;
    let totalInvestimentos = 0;

    simulacao.forEach(mes => {
      mes.categorias.forEach(cat => {
        if (cat.categoriaTipo === 'receita') {
          totalReceitas += cat.valorPrevisto;
        } else if (cat.categoriaTipo === 'despesa') {
          totalDespesas += cat.valorPrevisto;
        } else if (cat.categoriaTipo === 'investimento') {
          totalInvestimentos += cat.valorPrevisto;
        }
      });
    });

    const saldoLiquido = totalReceitas - totalDespesas - totalInvestimentos;
    const capacidadeInvestimento = saldoLiquido / 12;

    return {
      totalReceitas,
      totalDespesas,
      totalInvestimentos,
      saldoLiquido,
      capacidadeInvestimento
    };
  }, [simulacao]);

  // Calcular totais por mês
  const calcularTotaisMes = useCallback((mes: number) => {
    const mesData = simulacao.find(m => m.mes === mes);
    if (!mesData) return { receitas: 0, despesas: 0, investimentos: 0, saldo: 0 };

    let receitas = 0;
    let despesas = 0;
    let investimentos = 0;

    mesData.categorias.forEach(cat => {
      if (cat.categoriaTipo === 'receita') {
        receitas += cat.valorPrevisto;
      } else if (cat.categoriaTipo === 'despesa') {
        despesas += cat.valorPrevisto;
      } else if (cat.categoriaTipo === 'investimento') {
        investimentos += cat.valorPrevisto;
      }
    });

    return {
      receitas,
      despesas,
      investimentos,
      saldo: receitas - despesas - investimentos
    };
  }, [simulacao]);

  // Calcular saldos mensais com acumulado
  const calcularSaldosMensais = useCallback((): SaldoMensal[] => {
    const saldos: SaldoMensal[] = [];
    let acumulado = 0;

    for (let mes = 1; mes <= 12; mes++) {
      const totais = calcularTotaisMes(mes);
      const saldoMes = totais.receitas - totais.despesas - totais.investimentos;
      acumulado += saldoMes;

      saldos.push({
        mes,
        receitas: totais.receitas,
        despesas: totais.despesas,
        investimentos: totais.investimentos,
        saldoMes,
        saldoAcumulado: acumulado
      });
    }

    return saldos;
  }, [calcularTotaisMes]);

  // Carregar dados iniciais - usar ref para evitar loop infinito
  useEffect(() => {
    if (!loadingBudgets && usuario) {
      carregarSimulacao();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingBudgets, usuario?.id]);

  return {
    simulacao,
    loading: loading || loadingBudgets,
    saving,
    salvarValor,
    resetarMes,
    resetarTudo,
    copiarParaTodosMeses,
    calcularTotais,
    calcularTotaisMes,
    calcularSaldosMensais,
    recarregar: carregarSimulacao,
    anoSimulacao: ANO_SIMULACAO
  };
}
