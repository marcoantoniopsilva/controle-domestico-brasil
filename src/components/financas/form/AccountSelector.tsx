import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wallet } from "lucide-react";
import { useContas } from "@/hooks/useContas";

interface AccountSelectorProps {
  contaId: string | null;
  onChange: (id: string | null) => void;
  label?: string;
}

const NONE = "__none__";

export function AccountSelector({ contaId, onChange, label = "Conta" }: AccountSelectorProps) {
  const { contas, loading } = useContas();
  const ativas = contas.filter((c) => c.ativo);

  return (
    <div className="w-full space-y-2">
      <Label htmlFor="conta">{label}</Label>
      <Select
        value={contaId ?? NONE}
        onValueChange={(v) => onChange(v === NONE ? null : v)}
      >
        <SelectTrigger id="conta">
          <SelectValue placeholder={loading ? "Carregando..." : "Sem conta"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE}>Sem conta</SelectItem>
          {ativas.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              <div className="flex items-center gap-2">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: c.cor }}
                />
                <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{c.nome}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
