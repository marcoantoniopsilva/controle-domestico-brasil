
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Usuario } from "@/types";
import { useNavigate } from "react-router-dom";

export function useAuth() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate("/login");
        return;
      }
      
      setUsuario({
        id: session.user.id,
        nome: session.user.email?.split("@")[0] || '',
        email: session.user.email || '',
      });
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          navigate("/login");
        }
      }
    );
    
    return () => subscription.unsubscribe();
  }, [navigate]);

  return { usuario };
}
