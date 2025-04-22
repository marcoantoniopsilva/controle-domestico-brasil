
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const NavBar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const usuarioLogado = localStorage.getItem("usuarioLogado");
    return !!usuarioLogado;
  });
  
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem("usuarioLogado");
    setIsLoggedIn(false);
    toast.success("Logout realizado com sucesso");
    navigate("/");
  };
  
  return (
    <nav className="bg-white border-b shadow-sm py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-semibold text-primary">
          ControleFinanceiro
        </Link>
        
        <div className="flex gap-4 items-center">
          {isLoggedIn ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Button onClick={handleLogout} variant="outline">
                Sair
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline">Entrar</Button>
              </Link>
              <Link to="/cadastro">
                <Button>Cadastrar</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
