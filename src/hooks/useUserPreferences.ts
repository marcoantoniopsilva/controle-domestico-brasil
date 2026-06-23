import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_CYCLE_START_DAY } from "@/utils/financas";

export interface UserPreferences {
  cycleStartDay: number;
  onboardingCompleted: boolean;
  responsaveis: string[];
  responsavelPadrao: string;
  cartaoPadraoId: string | null;
}

export function useUserPreferences(userId?: string) {
  const [preferences, setPreferences] = useState<UserPreferences>({
    cycleStartDay: DEFAULT_CYCLE_START_DAY,
    onboardingCompleted: true,
    responsaveis: ["Você"],
    responsavelPadrao: "Você",
    cartaoPadraoId: null,
  });
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("user_preferences")
      .select("cycle_start_day, onboarding_completed, responsaveis, responsavel_padrao, cartao_padrao_id")
      .eq("usuario_id", userId)
      .maybeSingle();

    if (error) {
      console.error("[useUserPreferences] erro:", error);
      setLoading(false);
      return;
    }

    if (data) {
      const responsaveis: string[] =
        Array.isArray(data.responsaveis) && data.responsaveis.length > 0
          ? data.responsaveis
          : ["Você"];
      const padrao: string = data.responsavel_padrao || responsaveis[0];
      setPreferences({
        cycleStartDay: data.cycle_start_day ?? DEFAULT_CYCLE_START_DAY,
        onboardingCompleted: !!data.onboarding_completed,
        responsaveis,
        responsavelPadrao: padrao,
        cartaoPadraoId: data.cartao_padrao_id ?? null,
      });
    } else {
      // sem registro: criar default
      await (supabase as any).from("user_preferences").insert({
        usuario_id: userId,
        cycle_start_day: DEFAULT_CYCLE_START_DAY,
        onboarding_completed: false,
        responsaveis: ["Você"],
        responsavel_padrao: "Você",
      });
      setPreferences({
        cycleStartDay: DEFAULT_CYCLE_START_DAY,
        onboardingCompleted: false,
        responsaveis: ["Você"],
        responsavelPadrao: "Você",
        cartaoPadraoId: null,
      });
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const update = useCallback(
    async (patch: Partial<UserPreferences>) => {
      if (!userId) return false;
      const payload: any = {};
      if (patch.cycleStartDay !== undefined) payload.cycle_start_day = patch.cycleStartDay;
      if (patch.onboardingCompleted !== undefined) payload.onboarding_completed = patch.onboardingCompleted;
      if (patch.responsaveis !== undefined) payload.responsaveis = patch.responsaveis;
      if (patch.responsavelPadrao !== undefined) payload.responsavel_padrao = patch.responsavelPadrao;
      if (patch.cartaoPadraoId !== undefined) payload.cartao_padrao_id = patch.cartaoPadraoId;

      const { error } = await (supabase as any)
        .from("user_preferences")
        .upsert({ usuario_id: userId, ...payload }, { onConflict: "usuario_id" });
      if (error) {
        console.error("[useUserPreferences] update erro:", error);
        return false;
      }
      setPreferences((prev) => ({ ...prev, ...patch }));
      return true;
    },
    [userId]
  );

  return { preferences, loading, update, refetch: fetch };
}