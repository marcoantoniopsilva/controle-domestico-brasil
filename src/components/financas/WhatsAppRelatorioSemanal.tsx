import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarRange } from "lucide-react";
import type { WhatsAppPreferences } from "@/hooks/useWhatsAppConfig";
import { useCategorias } from "@/hooks/useCategorias";

const DIAS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
export const MAX_MONTH_CATEGORIES = 5;

interface Props {
  draft: WhatsAppPreferences;
  setDraft: React.Dispatch<React.SetStateAction<WhatsAppPreferences>>;
}

const WhatsAppRelatorioSemanal = ({ draft, setDraft }: Props) => {
  const { categorias, grupos } = useCategorias();
  const despesas = categorias.filter((c) => c.tipo === "despesa" && c.ativa);

  const gruposComCategorias = grupos
    .slice()
    .sort((a, b) => a.ordem - b.ordem)
    .map((g) => ({
      ...g,
      categorias: despesas.filter((c) => c.grupo_id === g.id).map((c) => c.nome),
    }))
    .filter((g) => g.categorias.length > 0);

  const escopoValor =
    draft.weekly_scope_tipo === "grupo"
      ? gruposComCategorias.find((g) => g.nome === draft.weekly_scope_nome)?.id ?? ""
      : draft.weekly_scope_nome;

  const handleEscopoChange = (valor: string) => {
    if (draft.weekly_scope_tipo === "grupo") {
      const g = gruposComCategorias.find((x) => x.id === valor);
      setDraft((d) => ({
        ...d,
        weekly_scope_nome: g?.nome ?? "",
        weekly_scope_categorias: g?.categorias ?? [],
      }));
    } else {
      setDraft((d) => ({ ...d, weekly_scope_nome: valor, weekly_scope_categorias: [valor] }));
    }
  };

  const toggleMonthCategory = (nome: string) => {
    setDraft((prev) => {
      if (prev.weekly_month_categorias.includes(nome)) {
        return { ...prev, weekly_month_categorias: prev.weekly_month_categorias.filter((c) => c !== nome) };
      }
      if (prev.weekly_month_categorias.length >= MAX_MONTH_CATEGORIES) return prev;
      return { ...prev, weekly_month_categorias: [...prev.weekly_month_categorias, nome] };
    });
  };

  return (
    <div className="space-y-6 border-t pt-6">
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label className="flex items-center gap-2">
            <CalendarRange className="h-4 w-4" />
            Relatório semanal por grupo/categoria
          </Label>
          <p className="text-sm text-muted-foreground">
            Acumulado da semana em um grupo (ou categoria) + saldo do mês de até {MAX_MONTH_CATEGORIES} categorias.
          </p>
        </div>
        <Switch
          checked={draft.weekly_report_enabled}
          onCheckedChange={(v) => setDraft((d) => ({ ...d, weekly_report_enabled: v }))}
        />
      </div>

      {draft.weekly_report_enabled && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Enviar toda</Label>
              <Select
                value={String(draft.weekly_report_day)}
                onValueChange={(v) => setDraft((d) => ({ ...d, weekly_report_day: parseInt(v) }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DIAS.map((dia, i) => (
                    <SelectItem key={i} value={String(i)}>{dia}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Horário</Label>
              <Select
                value={String(draft.weekly_report_hour)}
                onValueChange={(v) => setDraft((d) => ({ ...d, weekly_report_hour: parseInt(v) }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => (
                    <SelectItem key={i} value={String(i)}>{String(i).padStart(2, "0")}:00</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>A semana começa em</Label>
            <Select
              value={String(draft.weekly_week_start)}
              onValueChange={(v) => setDraft((d) => ({ ...d, weekly_week_start: parseInt(v) }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Domingo (domingo a sábado)</SelectItem>
                <SelectItem value="1">Segunda (segunda a domingo)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              O relatório sempre considera a última semana completa antes do envio.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Acompanhar</Label>
              <Select
                value={draft.weekly_scope_tipo}
                onValueChange={(v) =>
                  setDraft((d) => ({
                    ...d,
                    weekly_scope_tipo: v as "grupo" | "categoria",
                    weekly_scope_nome: "",
                    weekly_scope_categorias: [],
                  }))
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="grupo">Grupo de categorias</SelectItem>
                  <SelectItem value="categoria">Uma categoria</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{draft.weekly_scope_tipo === "grupo" ? "Grupo" : "Categoria"}</Label>
              <Select value={escopoValor} onValueChange={handleEscopoChange}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {draft.weekly_scope_tipo === "grupo"
                    ? gruposComCategorias.map((g) => (
                        <SelectItem key={g.id} value={g.id}>{g.nome}</SelectItem>
                      ))
                    : despesas.map((c) => (
                        <SelectItem key={c.id} value={c.nome}>{c.nome}</SelectItem>
                      ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {draft.weekly_scope_tipo === "grupo" && draft.weekly_scope_categorias.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Categorias incluídas: {draft.weekly_scope_categorias.join(", ")}
            </p>
          )}

          <div className="space-y-2">
            <Label>Saldo do mês — categorias (máx. {MAX_MONTH_CATEGORIES})</Label>
            <div className="rounded-lg border p-3 max-h-64 overflow-y-auto space-y-2">
              {despesas.length === 0 && (
                <p className="text-xs text-muted-foreground">Nenhuma categoria de despesa encontrada.</p>
              )}
              {despesas.map((c) => {
                const checked = draft.weekly_month_categorias.includes(c.nome);
                const disabled = !checked && draft.weekly_month_categorias.length >= MAX_MONTH_CATEGORIES;
                return (
                  <label
                    key={c.id}
                    className={`flex items-center gap-2 text-sm cursor-pointer ${disabled ? "opacity-50" : ""}`}
                  >
                    <Checkbox checked={checked} disabled={disabled} onCheckedChange={() => toggleMonthCategory(c.nome)} />
                    <span>{c.nome}</span>
                  </label>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Selecionadas: {draft.weekly_month_categorias.length}/{MAX_MONTH_CATEGORIES}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppRelatorioSemanal;