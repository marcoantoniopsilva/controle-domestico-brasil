import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MetaFinanceira } from "@/types";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  meta: MetaFinanceira | null;
  onSave: (valor: number, data: string, observacao?: string) => Promise<boolean>;
}

export function AporteDialog({ open, onOpenChange, meta, onSave }: Props) {
  const [valor, setValor] = useState("");
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [obs, setObs] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setValor("");
      setData(new Date().toISOString().slice(0, 10));
      setObs("");
    }
  }, [open]);

  const submit = async () => {
    const v = Number(String(valor).replace(",", "."));
    if (!v || v <= 0) return;
    setSaving(true);
    const ok = await onSave(v, data, obs.trim() || undefined);
    setSaving(false);
    if (ok) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Aportar em "{meta?.nome}"</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Valor (R$)</Label>
            <Input inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="100" />
          </div>
          <div>
            <Label>Data</Label>
            <Input type="date" value={data} onChange={(e) => setData(e.target.value)} />
          </div>
          <div>
            <Label>Observação (opcional)</Label>
            <Textarea value={obs} onChange={(e) => setObs(e.target.value)} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button onClick={submit} disabled={saving || !valor}>{saving ? "Salvando..." : "Aportar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}