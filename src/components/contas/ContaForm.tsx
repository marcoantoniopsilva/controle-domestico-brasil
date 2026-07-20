import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ContaBancaria, ContaTipo } from "@/types";
import { TIPOS_CONTA } from "@/hooks/useContas";
import { BANCOS } from "@/utils/cardIcons";
import { useTransacoes } from "@/hooks/useTransacoes";
import { calcularSaldoConta } from "@/utils/saldoContas";

const CORES = ["#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#EF4444", "#6366F1", "#14B8A6", "#F97316", "#0EA5E9"];

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  conta?: ContaBancaria | null;
  onSave: (input: Omit<ContaBancaria, "id">) => Promise<boolean> | boolean;
}

export function ContaForm({ open, onOpenChange, conta, onSave }: Props) {
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<ContaTipo>("corrente");
  const [banco, setBanco] = useState<string>("");
  const [saldoInicial, setSaldoInicial] = useState<string>("0");
  const [saldoAtual, setSaldoAtual] = useState<string>("0");
  const [cor, setCor] = useState("#3B82F6");
  const [incluirNoSaldo, setIncluirNoSaldo] = useState(true);
  const [ativo, setAtivo] = useState(true);
  const [observacoes, setObservacoes] = useState("");
  const [saving, setSaving] = useState(false);
  const { transacoes } = useTransacoes();

  const movimentos = conta
    ? calcularSaldoConta(conta, transacoes) - Number(conta.saldoInicial || 0)
    : 0;

  useEffect(() => {
    if (open) {
      setNome(conta?.nome || "");
      setTipo(conta?.tipo || "corrente");
      setBanco(conta?.banco || "");
      setSaldoInicial(conta?.saldoInicial != null ? String(conta.saldoInicial) : "0");
      const saldoAtualCalc = conta
        ? Number(conta.saldoInicial || 0) + movimentos
        : 0;
      setSaldoAtual(String(saldoAtualCalc));
      setCor(conta?.cor || "#3B82F6");
      setIncluirNoSaldo(conta?.incluirNoSaldo ?? true);
      setAtivo(conta?.ativo ?? true);
      setObservacoes(conta?.observacoes || "");
    }
  }, [open, conta, movimentos]);

  const handleSubmit = async () => {
    if (!nome.trim()) return;
    setSaving(true);
    const saldoInicialNum = parseFloat(saldoInicial.replace(",", ".")) || 0;
    const saldoAtualNum = parseFloat(saldoAtual.replace(",", ".")) || 0;
    // If editing and user changed current balance, adjust initial balance so
    // that saldoInicial + movimentos = saldoAtual informed by the user.
    let saldoInicialFinal = saldoInicialNum;
    if (conta) {
      const saldoAtualCalc = Number(conta.saldoInicial || 0) + movimentos;
      if (Math.abs(saldoAtualNum - saldoAtualCalc) > 0.001) {
        saldoInicialFinal = saldoAtualNum - movimentos;
      }
    }
    const ok = await onSave({
      nome: nome.trim(),
      tipo,
      banco: banco || null,
      saldoInicial: saldoInicialFinal,
      cor,
      incluirNoSaldo,
      ativo,
      observacoes: observacoes.trim() || null,
    });
    setSaving(false);
    if (ok) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{conta ? "Editar conta" : "Nova conta"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Nome</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Nubank – conta corrente" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tipo</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v as ContaTipo)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIPOS_CONTA.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Banco</Label>
              <Select value={banco || "__none__"} onValueChange={(v) => setBanco(v === "__none__" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Sem banco</SelectItem>
                  {BANCOS.map((b) => (
                    <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Saldo inicial (R$)</Label>
            <Input
              type="text"
              inputMode="decimal"
              value={saldoInicial}
              onChange={(e) => setSaldoInicial(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Saldo atual desta conta no momento do cadastro. Os lançamentos seguintes vão atualizar automaticamente.
            </p>
          </div>
          {conta && (
            <div>
              <Label>Saldo atual (R$)</Label>
              <Input
                type="text"
                inputMode="decimal"
                value={saldoAtual}
                onChange={(e) => setSaldoAtual(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Informe o saldo real da conta hoje. O saldo inicial será ajustado automaticamente para refletir esse valor, mantendo os lançamentos existentes.
              </p>
            </div>
          )}
          <div>
            <Label>Cor</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {CORES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCor(c)}
                  className={`w-8 h-8 rounded-md border-2 ${cor === c ? "border-foreground" : "border-transparent"}`}
                  style={{ backgroundColor: c }}
                  aria-label={c}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <Label className="text-sm">Incluir no saldo total</Label>
              <p className="text-xs text-muted-foreground">Se desativado, a conta não aparece no saldo consolidado.</p>
            </div>
            <Switch checked={incluirNoSaldo} onCheckedChange={setIncluirNoSaldo} />
          </div>
          {conta && (
            <div className="flex items-center justify-between rounded-md border p-3">
              <Label className="text-sm">Ativa</Label>
              <Switch checked={ativo} onCheckedChange={setAtivo} />
            </div>
          )}
          <div>
            <Label>Observações (opcional)</Label>
            <Textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={2} />
          </div>
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
