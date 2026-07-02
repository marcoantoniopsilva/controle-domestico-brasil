import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { LancamentoRecorrente, FrequenciaRecorrencia } from "@/types";
import { FREQUENCIAS } from "@/utils/recorrencias";
import { useCategorias } from "@/hooks/useCategorias";
import { CardSelector } from "@/components/financas/form/CardSelector";
import { AccountSelector } from "@/components/financas/form/AccountSelector";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  recorrente: LancamentoRecorrente | null;
  onSave: (input: Omit<LancamentoRecorrente, "id" | "ultimaExecucao">) => Promise<boolean>;
}

const DIAS_SEMANA = [
  { v: 0, l: "Domingo" }, { v: 1, l: "Segunda" }, { v: 2, l: "Terça" },
  { v: 3, l: "Quarta" }, { v: 4, l: "Quinta" }, { v: 5, l: "Sexta" }, { v: 6, l: "Sábado" },
];

export function RecorrenteForm({ open, onOpenChange, recorrente, onSave }: Props) {
  const { categorias } = useCategorias();
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("");
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState<"despesa" | "receita" | "investimento">("despesa");
  const [frequencia, setFrequencia] = useState<FrequenciaRecorrencia>("mensal");
  const [diaMes, setDiaMes] = useState<number>(1);
  const [diaSemana, setDiaSemana] = useState<number>(1);
  const [mesAno, setMesAno] = useState<number>(1);
  const [dataInicio, setDataInicio] = useState<string>(new Date().toISOString().slice(0, 10));
  const [dataFim, setDataFim] = useState<string>("");
  const [cartaoId, setCartaoId] = useState<string | null>(null);
  const [contaId, setContaId] = useState<string | null>(null);
  const [parcelas, setParcelas] = useState<number>(1);
  const [observacao, setObservacao] = useState("");
  const [ativo, setAtivo] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDescricao(recorrente?.descricao || "");
    setCategoria(recorrente?.categoria || "");
    setValor(recorrente ? String(Math.abs(recorrente.valor)) : "");
    setTipo(recorrente?.tipo || "despesa");
    setFrequencia(recorrente?.frequencia || "mensal");
    setDiaMes(recorrente?.diaMes ?? new Date().getDate());
    setDiaSemana(recorrente?.diaSemana ?? 1);
    setMesAno(recorrente?.mesAno ?? 1);
    setDataInicio(recorrente?.dataInicio || new Date().toISOString().slice(0, 10));
    setDataFim(recorrente?.dataFim || "");
    setCartaoId(recorrente?.cartaoId ?? null);
    setContaId(recorrente?.contaId ?? null);
    setParcelas(recorrente?.parcelas || 1);
    setObservacao(recorrente?.observacao || "");
    setAtivo(recorrente?.ativo ?? true);
  }, [open, recorrente]);

  const categoriasFiltradas = categorias.filter((c) => c.tipo === tipo && c.ativa);

  const submit = async () => {
    const v = Number(String(valor).replace(",", "."));
    if (!descricao.trim() || !categoria || !v) return;
    const valorFinal = tipo === "despesa" ? -Math.abs(v) : Math.abs(v);
    setSaving(true);
    const ok = await onSave({
      descricao: descricao.trim(),
      categoria,
      valor: valorFinal,
      tipo,
      frequencia,
      diaMes: frequencia === "semanal" ? null : diaMes,
      diaSemana: frequencia === "semanal" ? diaSemana : null,
      mesAno: frequencia === "anual" ? mesAno : null,
      dataInicio,
      dataFim: dataFim || null,
      cartaoId,
      contaId,
      quemGastou: null,
      parcelas,
      ativo,
      proximaExecucao: recorrente?.proximaExecucao || dataInicio,
      observacao: observacao || null,
    });
    setSaving(false);
    if (ok) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{recorrente ? "Editar recorrência" : "Nova recorrência"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Descrição</Label>
            <Input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Netflix, Aluguel..." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tipo</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="despesa">Despesa</SelectItem>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="investimento">Investimento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Valor (R$)</Label>
              <Input inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="50,00" />
            </div>
          </div>

          <div>
            <Label>Categoria</Label>
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {categoriasFiltradas.map((c) => (
                  <SelectItem key={c.id} value={c.nome}>{c.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Frequência</Label>
            <Select value={frequencia} onValueChange={(v) => setFrequencia(v as FrequenciaRecorrencia)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {FREQUENCIAS.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {frequencia === "mensal" && (
            <div>
              <Label>Dia do mês</Label>
              <Input type="number" min={1} max={31} value={diaMes} onChange={(e) => setDiaMes(Number(e.target.value))} />
            </div>
          )}
          {frequencia === "semanal" && (
            <div>
              <Label>Dia da semana</Label>
              <Select value={String(diaSemana)} onValueChange={(v) => setDiaSemana(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DIAS_SEMANA.map((d) => <SelectItem key={d.v} value={String(d.v)}>{d.l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          {frequencia === "anual" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Dia</Label>
                <Input type="number" min={1} max={31} value={diaMes} onChange={(e) => setDiaMes(Number(e.target.value))} />
              </div>
              <div>
                <Label>Mês</Label>
                <Input type="number" min={1} max={12} value={mesAno} onChange={(e) => setMesAno(Number(e.target.value))} />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Início</Label>
              <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
            </div>
            <div>
              <Label>Fim (opcional)</Label>
              <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
            </div>
          </div>

          {tipo === "despesa" && (
            <CardSelector cartaoId={cartaoId} onChange={setCartaoId} />
          )}
          <AccountSelector contaId={contaId} onChange={setContaId} />

          <div>
            <Label>Observação</Label>
            <Textarea value={observacao} onChange={(e) => setObservacao(e.target.value)} rows={2} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button onClick={submit} disabled={saving || !descricao || !categoria || !valor}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}