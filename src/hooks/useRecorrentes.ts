import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LancamentoRecorrente, FrequenciaRecorrencia } from "@/types";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

function mapRow(r: any): LancamentoRecorrente {
  return {
    id: r.id,
    descricao: r.descricao,
    categoria: r.categoria,
    valor: Number(r.valor) || 0,
    tipo: r.tipo,
    frequencia: r.frequencia as FrequenciaRecorrencia,
    diaMes: r.dia_mes,
    mesAno: r.mes_ano,
    diaSemana: r.dia_semana,
    dataInicio: r.data_inicio,
    dataFim: r.data_fim,
    cartaoId: r.cartao_id,
    contaId: r.conta_id,
    quemGastou: r.quem_gastou,
    parcelas: r.parcelas || 1,
    ativo: !!r.ativo,
    proximaExecucao: r.proxima_execucao,
    ultimaExecucao: r.ultima_execucao,
    observacao: r.observacao,
  };
}

function toDbPayload(r: Partial<LancamentoRecorrente>): any {
  const out: any = {};
  if (r.descricao !== undefined) out.descricao = r.descricao;
  if (r.categoria !== undefined) out.categoria = r.categoria;
  if (r.valor !== undefined) out.valor = r.valor;
  if (r.tipo !== undefined) out.tipo = r.tipo;
  if (r.frequencia !== undefined) out.frequencia = r.frequencia;
  if (r.diaMes !== undefined) out.dia_mes = r.diaMes;
  if (r.mesAno !== undefined) out.mes_ano = r.mesAno;
  if (r.diaSemana !== undefined) out.dia_semana = r.diaSemana;
  if (r.dataInicio !== undefined) out.data_inicio = r.dataInicio;
  if (r.dataFim !== undefined) out.data_fim = r.dataFim;
  if (r.cartaoId !== undefined) out.cartao_id = r.cartaoId;
  if (r.contaId !== undefined) out.conta_id = r.contaId;
  if (r.quemGastou !== undefined) out.quem_gastou = r.quemGastou;
  if (r.parcelas !== undefined) out.parcelas = r.parcelas;
  if (r.ativo !== undefined) out.ativo = r.ativo;
  if (r.proximaExecucao !== undefined) out.proxima_execucao = r.proximaExecucao;
  if (r.ultimaExecucao !== undefined) out.ultima_execucao = r.ultimaExecucao;
  if (r.observacao !== undefined) out.observacao = r.observacao;
  return out;
}

export function useRecorrentes() {
  const { usuario } = useAuth();
  const [recorrentes, setRecorrentes] = useState<LancamentoRecorrente[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!usuario?.id) { setLoading(false); return; }
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("lancamentos_recorrentes")
      .select("*")
      .order("proxima_execucao", { ascending: true });
    if (error) {
      toast.error("Erro ao carregar recorrentes: " + error.message);
      setLoading(false);
      return;
    }
    setRecorrentes((data || []).map(mapRow));
    setLoading(false);
  }, [usuario?.id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const create = useCallback(async (input: Omit<LancamentoRecorrente, "id" | "ultimaExecucao">) => {
    if (!usuario?.id) return false;
    const payload = { ...toDbPayload(input), usuario_id: usuario.id };
    const { error } = await (supabase as any).from("lancamentos_recorrentes").insert(payload);
    if (error) { toast.error("Erro: " + error.message); return false; }
    toast.success("Recorrência criada");
    await fetchAll();
    return true;
  }, [usuario?.id, fetchAll]);

  const update = useCallback(async (id: string, patch: Partial<LancamentoRecorrente>) => {
    const { error } = await (supabase as any)
      .from("lancamentos_recorrentes")
      .update(toDbPayload(patch))
      .eq("id", id);
    if (error) { toast.error("Erro: " + error.message); return false; }
    await fetchAll();
    return true;
  }, [fetchAll]);

  const remove = useCallback(async (id: string) => {
    const { error } = await (supabase as any)
      .from("lancamentos_recorrentes")
      .delete()
      .eq("id", id);
    if (error) { toast.error("Erro: " + error.message); return false; }
    toast.success("Recorrência excluída");
    await fetchAll();
    return true;
  }, [fetchAll]);

  const toggleAtivo = useCallback((r: LancamentoRecorrente) => {
    return update(r.id, { ativo: !r.ativo });
  }, [update]);

  return { recorrentes, loading, create, update, remove, toggleAtivo, refetch: fetchAll };
}