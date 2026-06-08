import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CartaoIcone } from "@/utils/cardIcons";
import { useCartoes } from "@/hooks/useCartoes";

interface CardSelectorProps {
  cartaoId: string | null;
  onChange: (id: string | null) => void;
  label?: string;
}

const NONE = "__none__";

export function CardSelector({ cartaoId, onChange, label = "Cartão" }: CardSelectorProps) {
  const { cartoes, loading } = useCartoes();
  const ativos = cartoes.filter((c) => c.ativo);

  return (
    <div className="w-full space-y-2">
      <Label htmlFor="cartao">{label}</Label>
      <Select
        value={cartaoId ?? NONE}
        onValueChange={(v) => onChange(v === NONE ? null : v)}
      >
        <SelectTrigger id="cartao">
          <SelectValue placeholder={loading ? "Carregando..." : "Sem cartão"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE}>Sem cartão</SelectItem>
          {ativos.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              <div className="flex items-center gap-2">
                <CartaoIcone banco={c.banco} bandeira={c.bandeira} cor={c.cor} size={20} />
                <span>{c.nome}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}