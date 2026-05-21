import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Bell, Clock, Trash2, Save, Plus, CheckCircle } from "lucide-react";
import { useWhatsAppConfig, MAX_PHONES, WhatsAppPreferences } from "@/hooks/useWhatsAppConfig";
import { useCategorias } from "@/hooks/useCategorias";
import { Checkbox } from "@/components/ui/checkbox";

const formatPhone = (raw: string) => {
  const c = raw.replace(/\D/g, "");
  if (c.length === 13) return `+${c.slice(0, 2)} (${c.slice(2, 4)}) ${c.slice(4, 9)}-${c.slice(9)}`;
  if (c.length === 12) return `+${c.slice(0, 2)} (${c.slice(2, 4)}) ${c.slice(4, 8)}-${c.slice(8)}`;
  return raw;
};

const maskInput = (value: string) => {
  const c = value.replace(/\D/g, "").slice(0, 13);
  if (c.length <= 2) return c;
  if (c.length <= 4) return `+${c.slice(0, 2)} (${c.slice(2)}`;
  if (c.length <= 9) return `+${c.slice(0, 2)} (${c.slice(2, 4)}) ${c.slice(4)}`;
  return `+${c.slice(0, 2)} (${c.slice(2, 4)}) ${c.slice(4, 9)}-${c.slice(9)}`;
};

const WhatsAppConfig = () => {
  const {
    phones,
    preferences,
    isLoading,
    isSaving,
    savePreferences,
    addPhone,
    removePhone,
  } = useWhatsAppConfig();

  const { categorias } = useCategorias();
  const MAX_CATEGORIES = 6;

  const [newPhone, setNewPhone] = useState("");
  const [draft, setDraft] = useState<WhatsAppPreferences>(preferences);

  useEffect(() => {
    setDraft(preferences);
  }, [preferences]);

  const hasPrefChanges =
    draft.is_active !== preferences.is_active ||
    draft.report_frequency !== preferences.report_frequency ||
    draft.report_hour !== preferences.report_hour ||
    draft.report_type !== preferences.report_type ||
    draft.selected_categories.length !== preferences.selected_categories.length ||
    draft.selected_categories.some((c) => !preferences.selected_categories.includes(c));

  const toggleCategory = (nome: string) => {
    setDraft((prev) => {
      if (prev.selected_categories.includes(nome)) {
        return { ...prev, selected_categories: prev.selected_categories.filter((c) => c !== nome) };
      }
      if (prev.selected_categories.length >= MAX_CATEGORIES) return prev;
      return { ...prev, selected_categories: [...prev.selected_categories, nome] };
    });
  };

  const categoriasDespesa = categorias.filter((c) => c.tipo === "despesa" && c.ativa);

  const reportTypeLabel: Record<WhatsAppPreferences["report_type"], string> = {
    completo: "Resumo completo (saldo + categorias principais)",
    despesas: "Apenas despesas do ciclo",
    receitas: "Apenas receitas do ciclo",
    categorias: "Categorias escolhidas por você",
  };

  const isNewPhoneValid = /^55\d{10,11}$/.test(newPhone.replace(/\D/g, ""));

  const handleAddPhone = async () => {
    const ok = await addPhone(newPhone);
    if (ok) setNewPhone("");
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Configuração WhatsApp
          {phones.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              <CheckCircle className="h-3 w-3 mr-1" />
              {phones.length} {phones.length === 1 ? "telefone" : "telefones"}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Cadastre até {MAX_PHONES} números para receberem os relatórios. Todos seguem as mesmas preferências.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Lista de telefones */}
        <div className="space-y-2">
          <Label>Telefones cadastrados ({phones.length}/{MAX_PHONES})</Label>
          <div className="space-y-2">
            {phones.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum telefone cadastrado ainda.</p>
            )}
            {phones.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border p-3">
                <span className="font-mono text-sm">{formatPhone(p.phone_number)}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removePhone(p.id)}
                  disabled={isSaving}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>

          {phones.length < MAX_PHONES && (
            <div className="flex gap-2 pt-2">
              <Input
                type="tel"
                placeholder="+55 (31) 99999-9999"
                value={newPhone}
                onChange={(e) => setNewPhone(maskInput(e.target.value))}
                className="font-mono flex-1"
              />
              <Button onClick={handleAddPhone} disabled={!isNewPhoneValid || isSaving}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
          )}
          <p className="text-xs text-muted-foreground">Formato: 5531999999999 (DDI + DDD + número)</p>
        </div>

        {/* Preferências (compartilhadas por todos os telefones) */}
        <div className="space-y-6 border-t pt-6">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notificações Ativas
              </Label>
              <p className="text-sm text-muted-foreground">Receber relatórios automáticos via WhatsApp</p>
            </div>
            <Switch
              checked={draft.is_active}
              onCheckedChange={(v) => setDraft((d) => ({ ...d, is_active: v }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Frequência dos Relatórios</Label>
            <Select
              value={draft.report_frequency}
              onValueChange={(v) => setDraft((d) => ({ ...d, report_frequency: v as any }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Diário</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="none">Desativado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horário do Relatório
            </Label>
            <Select
              value={draft.report_hour.toString()}
              onValueChange={(v) => setDraft((d) => ({ ...d, report_hour: parseInt(v) }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {i.toString().padStart(2, "0")}:00
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Horário de Brasília (UTC-3)</p>
          </div>

          <div className="space-y-2">
            <Label>Tipo de Relatório</Label>
            <Select
              value={draft.report_type}
              onValueChange={(v) => setDraft((d) => ({ ...d, report_type: v as any }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="completo">Resumo completo</SelectItem>
                <SelectItem value="despesas">Só despesas</SelectItem>
                <SelectItem value="receitas">Só receitas</SelectItem>
                <SelectItem value="categorias">Categorias escolhidas</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{reportTypeLabel[draft.report_type]}</p>
          </div>

          {draft.report_type === "categorias" && (
            <div className="space-y-2">
              <Label>Categorias para acompanhar (máx. {MAX_CATEGORIES})</Label>
              <div className="rounded-lg border p-3 max-h-64 overflow-y-auto space-y-2">
                {categoriasDespesa.length === 0 && (
                  <p className="text-xs text-muted-foreground">Nenhuma categoria de despesa encontrada.</p>
                )}
                {categoriasDespesa.map((c) => {
                  const checked = draft.selected_categories.includes(c.nome);
                  const disabled = !checked && draft.selected_categories.length >= MAX_CATEGORIES;
                  return (
                    <label key={c.id} className={`flex items-center gap-2 text-sm cursor-pointer ${disabled ? "opacity-50" : ""}`}>
                      <Checkbox checked={checked} disabled={disabled} onCheckedChange={() => toggleCategory(c.nome)} />
                      <span>{c.nome}</span>
                    </label>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Selecionadas: {draft.selected_categories.length}/{MAX_CATEGORIES}
              </p>
            </div>
          )}

          <Button
            onClick={() => savePreferences(draft)}
            disabled={isSaving || !hasPrefChanges || phones.length === 0}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Salvando..." : "Salvar Preferências"}
          </Button>
          {phones.length === 0 && (
            <p className="text-xs text-muted-foreground text-center">
              Adicione ao menos um telefone para salvar as preferências.
            </p>
          )}
        </div>

        <div className="rounded-lg bg-muted p-4 space-y-2">
          <p className="text-sm font-medium">O que você pode fazer via WhatsApp:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>📊 Perguntar sobre seus gastos e metas</li>
            <li>💰 Ver resumo financeiro do ciclo</li>
            <li>📈 Consultar status das categorias</li>
            <li>🤖 Conversar com o assistente financeiro (IA)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default WhatsAppConfig;