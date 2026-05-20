import { useAuth } from "./useAuth";
import { useUserPreferences } from "./useUserPreferences";
import { DEFAULT_CYCLE_START_DAY } from "@/utils/financas";

/**
 * Returns the user's configured cycle start day (1-28),
 * falling back to DEFAULT_CYCLE_START_DAY (25).
 */
export function useCycleStartDay(): number {
  const { usuario } = useAuth();
  const { preferences } = useUserPreferences(usuario?.id);
  return preferences.cycleStartDay || DEFAULT_CYCLE_START_DAY;
}