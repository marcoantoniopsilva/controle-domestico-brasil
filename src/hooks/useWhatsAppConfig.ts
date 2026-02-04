import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface WhatsAppConfig {
  id: string;
  phone_number: string;
  is_active: boolean;
  report_frequency: "daily" | "weekly" | "none";
  report_hour: number;
  is_verified: boolean;
}

export function useWhatsAppConfig() {
  const [config, setConfig] = useState<WhatsAppConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const fetchConfig = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("whatsapp_finance_users")
        .select("*")
        .eq("usuario_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Erro ao buscar configuração WhatsApp:", error);
        return;
      }

      if (data) {
        setConfig({
          id: data.id,
          phone_number: data.phone_number,
          is_active: data.is_active,
          report_frequency: data.report_frequency as "daily" | "weekly" | "none",
          report_hour: data.report_hour,
          is_verified: data.is_verified
        });
      }
    } catch (error) {
      console.error("Erro ao buscar configuração:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const saveConfig = async (newConfig: Omit<WhatsAppConfig, "id" | "is_verified">) => {
    try {
      setIsSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para salvar configurações.",
          variant: "destructive"
        });
        return false;
      }

      // Validar número de telefone
      const phoneRegex = /^55\d{10,11}$/;
      if (!phoneRegex.test(newConfig.phone_number.replace(/\D/g, ""))) {
        toast({
          title: "Número inválido",
          description: "Digite o número no formato: 5531999999999",
          variant: "destructive"
        });
        return false;
      }

      const cleanPhone = newConfig.phone_number.replace(/\D/g, "");

      if (config?.id) {
        // Atualizar existente
        const { error } = await supabase
          .from("whatsapp_finance_users")
          .update({
            phone_number: cleanPhone,
            is_active: newConfig.is_active,
            report_frequency: newConfig.report_frequency,
            report_hour: newConfig.report_hour,
            is_verified: true,
            updated_at: new Date().toISOString()
          })
          .eq("id", config.id);

        if (error) throw error;
      } else {
        // Criar novo - já salva como verificado
        const { error } = await supabase
          .from("whatsapp_finance_users")
          .insert({
            usuario_id: user.id,
            phone_number: cleanPhone,
            is_active: newConfig.is_active,
            report_frequency: newConfig.report_frequency,
            report_hour: newConfig.report_hour,
            is_verified: true
          });

        if (error) throw error;
      }

      toast({
        title: "Configuração salva!",
        description: "Suas preferências de WhatsApp foram atualizadas."
      });

      await fetchConfig();
      return true;
    } catch (error: any) {
      console.error("Erro ao salvar configuração:", error);
      
      if (error.code === "23505") {
        toast({
          title: "Número já cadastrado",
          description: "Este número de WhatsApp já está vinculado a outra conta.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar as configurações. Tente novamente.",
          variant: "destructive"
        });
      }
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteConfig = async () => {
    if (!config?.id) return false;

    try {
      setIsSaving(true);
      const { error } = await supabase
        .from("whatsapp_finance_users")
        .delete()
        .eq("id", config.id);

      if (error) throw error;

      setConfig(null);
      toast({
        title: "Configuração removida",
        description: "Seu número de WhatsApp foi desvinculado."
      });
      return true;
    } catch (error) {
      console.error("Erro ao remover configuração:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a configuração.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    config,
    isLoading,
    isSaving,
    saveConfig,
    deleteConfig,
    refetch: fetchConfig
  };
}
