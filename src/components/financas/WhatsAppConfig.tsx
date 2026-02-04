import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Bell, Clock, Trash2, Save, Smartphone, CheckCircle, Send, Shield } from "lucide-react";
import { useWhatsAppConfig, WhatsAppConfig as WhatsAppConfigType } from "@/hooks/useWhatsAppConfig";
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const WhatsAppConfig = () => {
  const { 
    config, 
    isLoading, 
    isSaving, 
    isVerifying,
    saveConfig, 
    deleteConfig,
    sendVerificationCode,
    verifyCode 
  } = useWhatsAppConfig();
  
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [reportFrequency, setReportFrequency] = useState<"daily" | "weekly" | "none">("daily");
  const [reportHour, setReportHour] = useState(20);
  
  // Estados para verificação
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [countdown, setCountdown] = useState(0);

  // Sincroniza estado local com dados do servidor
  useEffect(() => {
    if (config) {
      setPhoneNumber(formatPhoneNumber(config.phone_number));
      setIsActive(config.is_active);
      setReportFrequency(config.report_frequency);
      setReportHour(config.report_hour);
    }
  }, [config]);

  // Countdown para reenvio
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

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

  const handleSendCode = async () => {
    const success = await sendVerificationCode(phoneNumber);
    if (success) {
      setShowVerification(true);
      setCountdown(300); // 5 minutos
      setVerificationCode("");
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) return;
    
    const success = await verifyCode(phoneNumber, verificationCode);
    if (success) {
      setShowVerification(false);
      setVerificationCode("");
      setCountdown(0);
    }
  };

  const handleSaveSettings = async () => {
    if (!config?.is_verified) return;
    
    await saveConfig({
      phone_number: phoneNumber.replace(/\D/g, ""),
      is_active: isActive,
      report_frequency: reportFrequency,
      report_hour: reportHour,
      is_verified: true
    });
  };

  const handleDelete = async () => {
    await deleteConfig();
    setPhoneNumber("");
    setIsActive(true);
    setReportFrequency("daily");
    setReportHour(20);
    setShowVerification(false);
    setVerificationCode("");
  };

  const hasSettingsChanges = () => {
    if (!config) return false;
    
    return (
      isActive !== config.is_active ||
      reportFrequency !== config.report_frequency ||
      reportHour !== config.report_hour
    );
  };

  const isPhoneValid = () => {
    const cleaned = phoneNumber.replace(/\D/g, "");
    return /^55\d{10,11}$/.test(cleaned);
  };

  const isNewPhone = () => {
    if (!config) return true;
    const cleaned = phoneNumber.replace(/\D/g, "");
    return cleaned !== config.phone_number;
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
          {config?.is_verified && (
            <Badge variant="secondary" className="ml-2">
              <CheckCircle className="h-3 w-3 mr-1" />
              Verificado
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
              disabled={showVerification}
            />
            {(!config?.is_verified || isNewPhone()) && (
              <Button
                onClick={handleSendCode}
                disabled={!isPhoneValid() || isVerifying || countdown > 0}
                variant={config?.is_verified ? "outline" : "default"}
              >
                <Send className="h-4 w-4 mr-2" />
                {countdown > 0 ? formatCountdown(countdown) : "Verificar"}
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {config?.is_verified && !isNewPhone() 
              ? "✓ Número verificado" 
              : "Digite seu número com DDD (ex: 5531999999999)"}
          </p>
        </div>

        {/* Verificação de Código */}
        {showVerification && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Shield className="h-5 w-5" />
              <span className="font-medium">Verificação de Número</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Digite o código de 6 dígitos enviado para seu WhatsApp
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <InputOTP
                maxLength={6}
                value={verificationCode}
                onChange={setVerificationCode}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <Button
                onClick={handleVerifyCode}
                disabled={verificationCode.length !== 6 || isVerifying}
              >
                {isVerifying ? "Verificando..." : "Confirmar"}
              </Button>
            </div>
            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowVerification(false);
                  setVerificationCode("");
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="link"
                size="sm"
                onClick={handleSendCode}
                disabled={countdown > 0 || isVerifying}
              >
                {countdown > 0 ? `Reenviar em ${formatCountdown(countdown)}` : "Reenviar código"}
              </Button>
            </div>
          </div>
        )}

        {/* Configurações (só aparecem se verificado) */}
        {config?.is_verified && !isNewPhone() && (
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
        {config?.is_verified && !isNewPhone() && (
          <div className="flex gap-2">
            <Button 
              onClick={handleSaveSettings} 
              disabled={isSaving || !hasSettingsChanges()}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Salvando..." : "Salvar Preferências"}
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
