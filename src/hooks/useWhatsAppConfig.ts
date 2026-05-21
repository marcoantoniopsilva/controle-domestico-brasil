import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const MAX_PHONES = 3;

export interface WhatsAppPhone {
  id: string;
  phone_number: string;
}

export interface WhatsAppPreferences {
  is_active: boolean;
  report_frequency: "daily" | "weekly" | "none";
  report_hour: number;
  report_type: "completo" | "despesas" | "receitas" | "categorias";
  selected_categories: string[];
}

const DEFAULT_PREFS: WhatsAppPreferences = {
  is_active: true,
  report_frequency: "daily",
  report_hour: 20,
  report_type: "completo",
  selected_categories: [],
};

const phoneRegex = /^55\d{10,11}$/;

export function useWhatsAppConfig() {
  const [phones, setPhones] = useState<WhatsAppPhone[]>([]);
  const [preferences, setPreferences] = useState<WhatsAppPreferences>(DEFAULT_PREFS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const fetchAll = async () => {
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
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Erro ao buscar configurações WhatsApp:", error);
        return;
      }

      if (data && data.length > 0) {
        setPhones(
          data.map((d: any) => ({ id: d.id, phone_number: d.phone_number }))
        );
        const first: any = data[0];
        setPreferences({
          is_active: first.is_active,
          report_frequency: first.report_frequency,
          report_hour: first.report_hour,
          report_type: (first.report_type ?? "completo"),
          selected_categories: (first.selected_categories ?? []),
        });
      } else {
        setPhones([]);
        setPreferences(DEFAULT_PREFS);
      }
    } catch (e) {
      console.error("Erro ao buscar configuração:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const savePreferences = async (prefs: WhatsAppPreferences) => {
    try {
      setIsSaving(true);
      if (phones.length === 0) {
        // Sem telefone ainda, só atualiza estado local
        setPreferences(prefs);
        return true;
      }
      const { error } = await supabase
        .from("whatsapp_finance_users")
        .update({
          is_active: prefs.is_active,
          report_frequency: prefs.report_frequency,
          report_hour: prefs.report_hour,
          report_type: prefs.report_type,
          selected_categories: prefs.selected_categories,
          updated_at: new Date().toISOString(),
        })
        .in("id", phones.map((p) => p.id));

      if (error) throw error;

      toast({ title: "Preferências salvas!", description: "Aplicadas a todos os telefones cadastrados." });
      await fetchAll();
      return true;
    } catch (e) {
      console.error(e);
      toast({ title: "Erro ao salvar", description: "Tente novamente.", variant: "destructive" });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const addPhone = async (rawPhone: string) => {
    const cleanPhone = rawPhone.replace(/\D/g, "");
    if (!phoneRegex.test(cleanPhone)) {
      toast({ title: "Número inválido", description: "Use o formato 5531999999999", variant: "destructive" });
      return false;
    }
    if (phones.length >= MAX_PHONES) {
      toast({ title: "Limite atingido", description: `Máximo de ${MAX_PHONES} telefones.`, variant: "destructive" });
      return false;
    }
    if (phones.some((p) => p.phone_number === cleanPhone)) {
      toast({ title: "Já cadastrado", description: "Este número já está na lista.", variant: "destructive" });
      return false;
    }
    try {
      setIsSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase.from("whatsapp_finance_users").insert({
        usuario_id: user.id,
        phone_number: cleanPhone,
        is_active: preferences.is_active,
        report_frequency: preferences.report_frequency,
        report_hour: preferences.report_hour,
        report_type: preferences.report_type,
        selected_categories: preferences.selected_categories,
        is_verified: true,
      });
      if (error) throw error;

      toast({ title: "Telefone adicionado!", description: cleanPhone });
      await fetchAll();
      return true;
    } catch (e: any) {
      console.error(e);
      if (e.code === "23505") {
        toast({ title: "Número já cadastrado", description: "Vinculado a outra conta.", variant: "destructive" });
      } else {
        toast({ title: "Erro", description: "Não foi possível adicionar.", variant: "destructive" });
      }
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const removePhone = async (id: string) => {
    try {
      setIsSaving(true);
      const { error } = await supabase.from("whatsapp_finance_users").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Telefone removido" });
      await fetchAll();
      return true;
    } catch (e) {
      console.error(e);
      toast({ title: "Erro", description: "Não foi possível remover.", variant: "destructive" });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    phones,
    preferences,
    isLoading,
    isSaving,
    savePreferences,
    addPhone,
    removePhone,
    refetch: fetchAll,
  };
}