import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { MetaFinanceira, MetaTipo } from "@/types";

const TIPOS: { value: MetaTipo; label: string; icone: string }[] = [
  { value: "reserva", label: "Reserva de emergência", icone: "ShieldCheck" },
  { value: "viagem", label: "Viagem", icone: "Plane" },
  { value: "compra", label: "Compra", icone: "ShoppingBag" },
  { value: "investimento", label: "Investimento", icone: "TrendingUp" },
  { value: "outro", label: "Outro", icone: "Target" },
];

const CORES = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  meta: MetaFinanceira | null;
  onSave: (
    input: Omit<MetaFinanceira, "id" | "concluida" | "ordem">
  ) => Promise<boolean>;
}

export function MetaForm({ open, onOpenChange, meta, onSave }: Props) {
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<MetaTipo>("outro");
  const [valorAlvo, setValorAlvo] = useState("");
  const [valorInicial, setValorInicial] = useState("");
  const [prazo, setPrazo] = useState("");
  const [cor, setCor] = useState(CORES[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setNome(meta?.nome || "");
      setTipo((meta?.tipo as MetaTipo) || "outro");
      setValorAlvo(meta ? String(meta.valorAlvo) : "");
      setValorInicial(meta ? String(meta.valorInicial) : "");
      setPrazo(meta?.prazo || "");
      setCor(meta?.cor || CORES[0]);
    }
  }, [open, meta]);

  const submit = async () => {
    const alvo = Number(String(valorAlvo).replace(",", "."));
    const inicial = Number(String(valorInicial || "0").replace(",", "."));
    if (!nome.trim() || !alvo || alvo <= 0) return;
    setSaving(true);
    const icone = TIPOS.find((t) => t.value === tipo)?.icone || "Target";
    const ok = await onSave({
      nome: nome.trim(),
      tipo,
      valorAlvo: alvo,
      valorInicial: inicial || 0,
      prazo: prazo || null,
      cor,
      icone,
    });
    setSaving(false);
    if (ok) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{meta ? "Editar meta" : "Nova meta"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Nome</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Viagem para a praia" />
          </div>

          <div>
            <Label>Tipo</Label>
            <Select value={tipo} onValueChange={(v) => setTipo(v as MetaTipo)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TIPOS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Valor-alvo (R$)</Label>
              <Input
                inputMode="decimal"
                value={valorAlvo}
                onChange={(e) => setValorAlvo(e.target.value)}
                placeholder="5000"
              />
            </div>
            <div>
              <Label>Valor inicial</Label>
              <Input
                inputMode="decimal"
                value={valorInicial}
                onChange={(e) => setValorInicial(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <Label>Prazo (opcional)</Label>
            <Input type="date" value={prazo} onChange={(e) => setPrazo(e.target.value)} />
          </div>

          <div>
            <Label>Cor</Label>
            <div className="flex gap-2 mt-1">
              {CORES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCor(c)}
                  className={`h-7 w-7 rounded-full border-2 ${cor === c ? "border-foreground" : "border-transparent"}`}
                  style={{ backgroundColor: c }}
                  aria-label={c}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={saving || !nome.trim() || !valorAlvo}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}