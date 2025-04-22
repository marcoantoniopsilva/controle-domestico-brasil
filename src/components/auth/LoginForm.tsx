
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simular um login bem-sucedido
    setTimeout(() => {
      // Mock de login - seria substituído por autenticação real
      if (email && senha) {
        // Login bem-sucedido
        localStorage.setItem("usuarioLogado", JSON.stringify({ 
          id: "1", 
          nome: email.split("@")[0], 
          email 
        }));
        toast.success("Login realizado com sucesso!");
        navigate("/dashboard");
      } else {
        toast.error("Por favor, preencha todos os campos");
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Entrar</CardTitle>
        <CardDescription>
          Entre com seu email e senha para acessar seu controle financeiro
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="senha">Senha</Label>
              <a 
                href="#" 
                className="text-sm text-primary hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  toast.info("Função de recuperação de senha não implementada nesta versão");
                }}
              >
                Esqueceu a senha?
              </a>
            </div>
            <Input
              id="senha"
              type="password"
              placeholder="Sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col">
        <div className="mt-2 text-center text-sm">
          Não tem uma conta?{" "}
          <a href="/cadastro" className="text-primary hover:underline">
            Cadastre-se
          </a>
        </div>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
