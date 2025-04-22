
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";
import NavBar from "@/components/layout/NavBar";

const Login = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Verificar se já existe um usuário logado
    const usuarioLogado = localStorage.getItem("usuarioLogado");
    if (usuarioLogado) {
      navigate("/dashboard");
    }
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </main>
    </div>
  );
};

export default Login;
