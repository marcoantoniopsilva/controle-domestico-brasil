import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_CYCLE_START_DAY } from "@/utils/financas";

/**
 * Garante que o usuário esteja autenticado e tenha completado o onboarding.
 * Redireciona para /login se não autenticado, ou /onboarding se pendente.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/login");
        return;
      }

      // verificar onboarding
      const { data: prefs } = await (supabase as any)
        .from("user_preferences")
        .select("onboarding_completed")
        .eq("usuario_id", session.user.id)
        .maybeSingle();

      if (!prefs) {
        // criar e mandar para onboarding
        await (supabase as any).from("user_preferences").insert({
          usuario_id: session.user.id,
          cycle_start_day: DEFAULT_CYCLE_START_DAY,
          onboarding_completed: false,
        });
        if (location.pathname !== "/onboarding") navigate("/onboarding");
        return;
      }

      if (!prefs.onboarding_completed && location.pathname !== "/onboarding") {
        navigate("/onboarding");
        return;
      }

      if (mounted) setReady(true);
    };

    check();
    return () => {
      mounted = false;
    };
  }, [navigate, location.pathname]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Carregando…
      </div>
    );
  }

  return <>{children}</>;
}