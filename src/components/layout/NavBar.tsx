
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, Menu } from "lucide-react";
import { Logo } from "./Logo";

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
    <nav className="bg-card border-b border-border py-3 md:py-4">
      <div className="container mx-auto px-3 md:px-4 flex justify-between items-center">
        <Link to="/" className="shrink-0">
          <Logo size="sm" />
        </Link>
        
        <div className="flex gap-1 md:gap-4 items-center">
          {isLoggedIn ? (
            <>
              {/* Mobile: menu geral único */}
              <div className="sm:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="px-2 text-xs gap-1">
                      <Menu className="h-4 w-4" />
                      Menu
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate("/dashboard")}>Dashboard</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/simulador")}>Simulador</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/categorias")}>Categorias</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/cartoes")}>Cartões de crédito</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/metas")}>Metas & reservas</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/preferencias")}>Preferências (ciclo)</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Desktop: navegação principal + dropdown de config */}
              <Link to="/dashboard" className="hidden sm:block">
                <Button variant="ghost" size="sm" className="px-2 md:px-4 text-xs md:text-sm">
                  Dashboard
                </Button>
              </Link>
              <Link to="/simulador" className="hidden sm:block">
                <Button variant="ghost" size="sm" className="px-2 md:px-4 text-xs md:text-sm">
                  Simulador
                </Button>
              </Link>
              <div className="hidden sm:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="px-2 md:px-3 text-xs md:text-sm">
                      <Settings className="h-4 w-4 md:mr-1" />
                      <span>Config</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate("/categorias")}>Categorias</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/cartoes")}>Cartões</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/metas")}>Metas & reservas</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/preferencias")}>Preferências (ciclo)</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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
