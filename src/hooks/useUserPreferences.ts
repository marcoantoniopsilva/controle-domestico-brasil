import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_CYCLE_START_DAY } from "@/utils/financas";

export interface UserPreferences {
  cycleStartDay: number;
  onboardingCompleted: boolean;
}

export function useUserPreferences(userId?: string) {
  const [preferences, setPreferences] = useState<UserPreferences>({
    cycleStartDay: DEFAULT_CYCLE_START_DAY,
    onboardingCompleted: true,
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
      .select("cycle_start_day, onboarding_completed")
      .eq("usuario_id", userId)
      .maybeSingle();

    if (error) {
      console.error("[useUserPreferences] erro:", error);
      setLoading(false);
      return;
    }

    if (data) {
      setPreferences({
        cycleStartDay: data.cycle_start_day ?? DEFAULT_CYCLE_START_DAY,
        onboardingCompleted: !!data.onboarding_completed,
      });
    } else {
      // sem registro: criar default
      await (supabase as any).from("user_preferences").insert({
        usuario_id: userId,
        cycle_start_day: DEFAULT_CYCLE_START_DAY,
        onboarding_completed: false,
      });
      setPreferences({
        cycleStartDay: DEFAULT_CYCLE_START_DAY,
        onboardingCompleted: false,
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