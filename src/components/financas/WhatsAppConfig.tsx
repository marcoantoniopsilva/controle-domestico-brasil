import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Bell, Clock, Trash2, Save, Smartphone, CheckCircle } from "lucide-react";
import { useWhatsAppConfig } from "@/hooks/useWhatsAppConfig";
import { useCategorias } from "@/hooks/useCategorias";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const WhatsAppConfig = () => {
  const { 
    config, 
    isLoading, 
    isSaving, 
    saveConfig, 
    deleteConfig 
  } = useWhatsAppConfig();
  
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [reportFrequency, setReportFrequency] = useState<"daily" | "weekly" | "none">("daily");
  const [reportHour, setReportHour] = useState(20);
  const [reportType, setReportType] = useState<"completo" | "despesas" | "receitas" | "categorias">("completo");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const { categorias } = useCategorias();
  const MAX_CATEGORIES = 6;

  // Sincroniza estado local com dados do servidor
  useEffect(() => {
    if (config) {
      setPhoneNumber(formatPhoneNumber(config.phone_number));
      setIsActive(config.is_active);
      setReportFrequency(config.report_frequency);
      setReportHour(config.report_hour);
      setReportType(config.report_type);
      setSelectedCategories(config.selected_categories ?? []);
    }
  }, [config]);

  const formatPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 13) {
      return `+${cleaned.slice(0, 2)} (${cleaned.slice(2, 4)}) ${cleaned.slice(4, 9)}-${cleaned.slice(9)}`;
    } else if (cleaned.length === 12) {
      return `+${cleaned.slice(0, 2)} (${cleaned.slice(2, 4)}) ${cleaned.slice(4, 8)}-${cleaned.slice(8)}`;
    }
    return phone;
  };

  const handlePhoneChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const limited = cleaned.slice(0, 13);
    
    if (limited.length <= 2) {
      setPhoneNumber(limited);
    } else if (limited.length <= 4) {
      setPhoneNumber(`+${limited.slice(0, 2)} (${limited.slice(2)}`);
    } else if (limited.length <= 9) {
      setPhoneNumber(`+${limited.slice(0, 2)} (${limited.slice(2, 4)}) ${limited.slice(4)}`);
    } else {
      setPhoneNumber(`+${limited.slice(0, 2)} (${limited.slice(2, 4)}) ${limited.slice(4, 9)}-${limited.slice(9)}`);
    }
  };

  const handleSaveNumber = async () => {
    await saveConfig({
      phone_number: phoneNumber.replace(/\D/g, ""),
      is_active: isActive,
      report_frequency: reportFrequency,
      report_hour: reportHour,
      report_type: reportType,
      selected_categories: selectedCategories,
    });
  };

  const handleSaveSettings = async () => {
    await saveConfig({
      phone_number: phoneNumber.replace(/\D/g, ""),
      is_active: isActive,
      report_frequency: reportFrequency,
      report_hour: reportHour,
      report_type: reportType,
      selected_categories: selectedCategories,
    });
  };

  const handleDelete = async () => {
    await deleteConfig();
    setPhoneNumber("");
    setIsActive(true);
    setReportFrequency("daily");
    setReportHour(20);
    setReportType("completo");
    setSelectedCategories([]);
  };

  const hasSettingsChanges = () => {
    if (!config) return false;
    
    const cleanCurrentPhone = phoneNumber.replace(/\D/g, "");
    const sameCats =
      selectedCategories.length === (config.selected_categories?.length ?? 0) &&
      selectedCategories.every((c) => config.selected_categories?.includes(c));
    return (
      cleanCurrentPhone !== config.phone_number ||
      isActive !== config.is_active ||
      reportFrequency !== config.report_frequency ||
      reportHour !== config.report_hour ||
      reportType !== config.report_type ||
      !sameCats
    );
  };

  const toggleCategory = (nome: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(nome)) return prev.filter((c) => c !== nome);
      if (prev.length >= MAX_CATEGORIES) return prev;
      return [...prev, nome];
    });
  };

  const categoriasDespesa = categorias.filter((c) => c.tipo === "despesa" && c.ativa);

  const reportTypeLabel: Record<typeof reportType, string> = {
    completo: "Resumo completo (saldo + categorias principais)",
    despesas: "Apenas despesas do ciclo",
    receitas: "Apenas receitas do ciclo",
    categorias: "Categorias escolhidas por você",
  };

  const isPhoneValid = () => {
    const cleaned = phoneNumber.replace(/\D/g, "");
    return /^55\d{10,11}$/.test(cleaned);
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
          {config && (
            <Badge variant="secondary" className="ml-2">
              <CheckCircle className="h-3 w-3 mr-1" />
              Configurado
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Configure seu número para receber relatórios financeiros e interagir com o assistente via WhatsApp
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Número de Telefone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Número do WhatsApp
          </Label>
          <div className="flex gap-2">
            <Input
              id="phone"
              type="tel"
              placeholder="+55 (31) 99999-9999"
              value={phoneNumber}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className="font-mono flex-1"
            />
            {!config && (
              <Button
                onClick={handleSaveNumber}
                disabled={!isPhoneValid() || isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Salvando..." : "Salvar"}
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Digite seu número com DDD (ex: 5531999999999)
          </p>
        </div>

        {/* Configurações (aparecem após salvar o número) */}
        {config && (
          <>
            {/* Ativar Notificações */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notificações Ativas
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receber relatórios automáticos via WhatsApp
                </p>
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>

            {/* Frequência */}
            <div className="space-y-2">
              <Label>Frequência dos Relatórios</Label>
              <Select value={reportFrequency} onValueChange={(v) => setReportFrequency(v as "daily" | "weekly" | "none")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Diário</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="none">Desativado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Horário */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Horário do Relatório
              </Label>
              <Select value={reportHour.toString()} onValueChange={(v) => setReportHour(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {i.toString().padStart(2, "0")}:00
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Horário de Brasília (UTC-3)
              </p>
            </div>

            {/* Tipo de Relatório */}
            <div className="space-y-2">
              <Label>Tipo de Relatório</Label>
              <Select value={reportType} onValueChange={(v) => setReportType(v as typeof reportType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completo">Resumo completo</SelectItem>
                  <SelectItem value="despesas">Só despesas</SelectItem>
                  <SelectItem value="receitas">Só receitas</SelectItem>
                  <SelectItem value="categorias">Categorias escolhidas</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{reportTypeLabel[reportType]}</p>
            </div>

            {/* Multi-select de Categorias */}
            {reportType === "categorias" && (
              <div className="space-y-2">
                <Label>Categorias para acompanhar (máx. {MAX_CATEGORIES})</Label>
                <div className="rounded-lg border p-3 max-h-64 overflow-y-auto space-y-2">
                  {categoriasDespesa.length === 0 && (
                    <p className="text-xs text-muted-foreground">Nenhuma categoria de despesa encontrada.</p>
                  )}
                  {categoriasDespesa.map((c) => {
                    const checked = selectedCategories.includes(c.nome);
                    const disabled = !checked && selectedCategories.length >= MAX_CATEGORIES;
                    return (
                      <label key={c.id} className={`flex items-center gap-2 text-sm cursor-pointer ${disabled ? "opacity-50" : ""}`}>
                        <Checkbox checked={checked} disabled={disabled} onCheckedChange={() => toggleCategory(c.nome)} />
                        <span>{c.nome}</span>
                      </label>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Selecionadas: {selectedCategories.length}/{MAX_CATEGORIES}
                </p>
              </div>
            )}
          </>
        )}

        {/* Funcionalidades */}
        <div className="rounded-lg bg-muted p-4 space-y-2">
          <p className="text-sm font-medium">O que você pode fazer via WhatsApp:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>📊 Perguntar sobre seus gastos e metas</li>
            <li>💰 Ver resumo financeiro do ciclo</li>
            <li>📈 Consultar status das categorias</li>
            <li>🤖 Conversar com o assistente financeiro (IA)</li>
          </ul>
        </div>

        {/* Ações */}
        {config && (
          <div className="flex gap-2">
            <Button 
              onClick={handleSaveSettings} 
              disabled={isSaving || !hasSettingsChanges()}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Salvando..." : "Salvar Alterações"}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon" disabled={isSaving}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remover configuração?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Isso irá desvincular seu número de WhatsApp e você deixará de receber relatórios automáticos.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Remover
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WhatsAppConfig;
