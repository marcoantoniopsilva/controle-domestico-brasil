
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";
import NavBar from "@/components/layout/NavBar";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Verificar se já existe um usuário logado
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const rawNext = params.get("next");
        const nextPath =
          rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : null;
        if (nextPath) {
          window.location.href = nextPath;
        } else {
          navigate("/dashboard");
        }
      }
      
      setIsLoading(false);
    };
    
    checkSession();
  }, [navigate, params]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-1 flex items-center justify-center p-4">
          <p>Carregando...</p>
        </main>
      </div>
    );
  }
  
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
