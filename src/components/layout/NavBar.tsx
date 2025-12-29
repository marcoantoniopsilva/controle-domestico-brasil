
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const NavBar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Verificar session do Supabase
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
    };
    
    checkSession();
    
    // Atualizar estado quando autenticação mudar
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsLoggedIn(!!session);
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);
  
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erro ao fazer logout: " + error.message);
      return;
    }
    
    setIsLoggedIn(false);
    toast.success("Logout realizado com sucesso");
    navigate("/");
  };
  
  return (
    <nav className="bg-white border-b shadow-sm py-3 md:py-4">
      <div className="container mx-auto px-3 md:px-4 flex justify-between items-center">
        <Link to="/" className="text-lg md:text-xl font-semibold text-primary truncate">
          ControleFinanceiro
        </Link>
        
        <div className="flex gap-1 md:gap-4 items-center">
          {isLoggedIn ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="px-2 md:px-4 text-xs md:text-sm">
                  Dashboard
                </Button>
              </Link>
              <Link to="/simulador" className="hidden sm:block">
                <Button variant="ghost" size="sm" className="px-2 md:px-4 text-xs md:text-sm">
                  Simulador
                </Button>
              </Link>
              <Button onClick={handleLogout} variant="outline" size="sm" className="px-2 md:px-4 text-xs md:text-sm">
                Sair
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" size="sm" className="px-2 md:px-4 text-xs md:text-sm">
                  Entrar
                </Button>
              </Link>
              <Link to="/cadastro">
                <Button size="sm" className="px-2 md:px-4 text-xs md:text-sm">
                  Cadastrar
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
