
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SignUpForm from "@/components/auth/SignUpForm";
import NavBar from "@/components/layout/NavBar";
import { supabase } from "@/integrations/supabase/client";

const Cadastro = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Verificar se já existe um usuário logado
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (data.session) {
        navigate("/dashboard");
      }
      
      setIsLoading(false);
    };
    
    checkSession();
  }, [navigate]);
  
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
          <SignUpForm />
        </div>
      </main>
    </div>
  );
};

export default Cadastro;
