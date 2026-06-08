import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CartaoCredito } from "@/types";
import { BANCOS, BANDEIRAS, CORES_PRESET, CartaoIcone, getBancoCor } from "@/utils/cardIcons";

interface CartaoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cartao?: CartaoCredito | null;
  onSave: (input: Omit<CartaoCredito, "id">) => Promise<boolean> | boolean;
}

export function CartaoForm({ open, onOpenChange, cartao, onSave }: CartaoFormProps) {
  const [nome, setNome] = useState("");
  const [banco, setBanco] = useState<string>("");
  const [bandeira, setBandeira] = useState<string>("");
  const [cor, setCor] = useState("#6366f1");
  const [diaFechamento, setDiaFechamento] = useState(1);
  const [diaVencimento, setDiaVencimento] = useState(10);
  const [metaMensal, setMetaMensal] = useState<string>("");
  const [ativo, setAtivo] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setNome(cartao?.nome || "");
      setBanco(cartao?.banco || "");
      setBandeira(cartao?.bandeira || "");
      setCor(cartao?.cor || "#6366f1");
      setDiaFechamento(cartao?.diaFechamento ?? 1);
      setDiaVencimento(cartao?.diaVencimento ?? 10);
      setMetaMensal(cartao?.metaMensal != null ? String(cartao.metaMensal) : "");
      setAtivo(cartao?.ativo ?? true);
    }
  }, [open, cartao]);

  const handleBancoChange = (value: string) => {
    setBanco(value);
    // se cor estiver no default, atualiza para a do banco
    if (!cartao) setCor(getBancoCor(value));
  };

  const handleSubmit = async () => {
    if (!nome.trim()) return;
    setSaving(true);
    const ok = await onSave({
      nome: nome.trim(),
      banco: banco || null,
      bandeira: bandeira || null,
      cor,
      diaFechamento: Math.max(1, Math.min(31, diaFechamento)),
      diaVencimento: Math.max(1, Math.min(31, diaVencimento)),
      metaMensal: metaMensal.trim() ? parseFloat(metaMensal.replace(",", ".")) : null,
      ativo,
      ordem: cartao?.ordem ?? 0,
    });
    setSaving(false);
    if (ok) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{cartao ? "Editar cartão" : "Novo cartão"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
            <CartaoIcone banco={banco} bandeira={bandeira} cor={cor} size={48} />
            <div>
              <p className="font-medium">{nome || "Novo cartão"}</p>
              <p className="text-xs text-muted-foreground">
                Fecha dia {diaFechamento} · Vence dia {diaVencimento}
              </p>
            </div>
          </div>

          <div>
            <Label>Apelido</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Nubank pessoal" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Banco</Label>
              <Select value={banco} onValueChange={handleBancoChange}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {BANCOS.map((b) => (
                    <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Bandeira</Label>
              <Select value={bandeira} onValueChange={setBandeira}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {BANDEIRAS.map((b) => (
                    <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Cor</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {CORES_PRESET.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCor(c)}
                  className={`w-8 h-8 rounded-md border-2 ${cor === c ? "border-foreground" : "border-transparent"}`}
                  style={{ backgroundColor: c }}
                  aria-label={c}
                />
              ))}
              <input
                type="color"
                value={cor}
                onChange={(e) => setCor(e.target.value)}
                className="w-8 h-8 rounded-md border border-input cursor-pointer"
                aria-label="Cor personalizada"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Dia de fechamento</Label>
              <Input
                type="number"
                min={1} max={31}
                value={diaFechamento}
                onChange={(e) => setDiaFechamento(parseInt(e.target.value) || 1)}
              />
            </div>
            <div>
              <Label>Dia de vencimento</Label>
              <Input
                type="number"
                min={1} max={31}
                value={diaVencimento}
                onChange={(e) => setDiaVencimento(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          <div>
            <Label>Meta mensal (opcional)</Label>
            <Input
              type="text"
              inputMode="decimal"
              value={metaMensal}
              onChange={(e) => setMetaMensal(e.target.value)}
              placeholder="Ex.: 2000"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Independente das metas das categorias.
            </p>
          </div>

          {cartao && (
            <div className="flex items-center gap-2">
              <input
                id="ativo"
                type="checkbox"
                checked={ativo}
                onChange={(e) => setAtivo(e.target.checked)}
              />
              <Label htmlFor="ativo">Cartão ativo</Label>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={saving || !nome.trim()}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}