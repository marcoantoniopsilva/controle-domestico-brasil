import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import NavBar from "@/components/layout/NavBar";
import AddTransacaoForm from "@/components/financas/AddTransacaoForm";
import { Categoria, CicloFinanceiro, Transacao } from "@/types";
import { categorias as categoriasIniciais, calcularCicloAtual } from "@/utils/financas";
import { supabase } from "@/integrations/supabase/client";
import DashboardContent from "@/components/financas/DashboardContent";

const Dashboard = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<any>(null);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>(categoriasIniciais);
  const [cicloAtual, setCicloAtual] = useState<CicloFinanceiro>(calcularCicloAtual());
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate("/login");
        return;
      }
      
      setUsuario({
        id: session.user.id,
        nome: session.user.email?.split("@")[0],
        email: session.user.email
      });
      
      fetchTransacoes();
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

  const fetchTransacoes = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("lancamentos")
        .select("*");
        
      if (error) {
        console.error("Erro ao carregar lançamentos:", error);
        toast.error("Erro ao carregar lançamentos: " + error.message);
      } else {
        setTransacoes((data || []).map((t: any) => ({
          id: t.id.toString(),
          data: new Date(t.data),
          categoria: t.categoria,
          valor: Number(t.valor),
          parcelas: t.parcelas,
          quemGastou: t.quem_gastou,
          descricao: t.descricao,
          tipo: t.tipo,
        })));
      }
    } catch (error: any) {
      console.error("Erro ao buscar transações:", error);
      toast.error("Erro ao buscar transações: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (transacoes.length > 0) {
      const categoriasAtualizadas = [...categoriasIniciais];
      
      transacoes.forEach(transacao => {
        const dataTransacao = new Date(transacao.data);
        
        if (dataTransacao >= cicloAtual.inicio && dataTransacao <= cicloAtual.fim && transacao.valor < 0) {
          const categoriaIndex = categoriasAtualizadas.findIndex(c => c.nome === transacao.categoria);
          if (categoriaIndex !== -1) {
            categoriasAtualizadas[categoriaIndex].gastosAtuais += Math.abs(transacao.valor);
          }
        }
      });
      
      setCategorias(categoriasAtualizadas);
    }
  }, [transacoes, cicloAtual]);

  const handleAddTransacao = async (novaTransacao: Omit<Transacao, "id">) => {
    if (!usuario) {
      toast.error("Usuário não autenticado");
      return;
    }
    
    try {
      const insertObj = {
        data: novaTransacao.data.toISOString().split('T')[0],
        categoria: novaTransacao.categoria,
        valor: novaTransacao.valor,
        parcelas: novaTransacao.parcelas,
        quem_gastou: novaTransacao.quemGastou,
        descricao: novaTransacao.descricao || null,
        tipo: novaTransacao.tipo,
        usuario_id: usuario.id,
      };
      
      const { error } = await supabase.from("lancamentos").insert([insertObj]);
      
      if (error) {
        console.error("Erro ao adicionar transação:", error);
        toast.error("Erro ao adicionar transação: " + error.message);
        return;
      }
      
      await fetchTransacoes();
      toast.success("Transação registrada com sucesso!");
      setDialogOpen(false);
    } catch (error: any) {
      console.error("Erro ao adicionar transação:", error);
      toast.error("Erro ao adicionar transação: " + error.message);
    }
  };

  const handleExcluirTransacao = async (id: string) => {
    try {
      const { error } = await supabase
        .from("lancamentos")
        .delete()
        .eq("id", Number(id));
        
      if (error) {
        console.error("Erro ao excluir transação:", error);
        toast.error("Erro ao excluir transação: " + error.message);
        return;
      }
      
      await fetchTransacoes();
      toast.success("Transação excluída com sucesso!");
    } catch (error: any) {
      console.error("Erro ao excluir transação:", error);
      toast.error("Erro ao excluir transação: " + error.message);
    }
  };

  const handleCicloChange = (novoCiclo: CicloFinanceiro) => {
    setCicloAtual(novoCiclo);
  };

  const transacoesCicloAtual = transacoes.filter(t => {
    const data = new Date(t.data);
    return data >= cicloAtual.inicio && data <= cicloAtual.fim;
  }).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  
  const totalReceitas = transacoesCicloAtual
    .filter(t => t.valor > 0)
    .reduce((acc, t) => acc + t.valor, 0);
    
  const totalDespesas = transacoesCicloAtual
    .filter(t => t.valor < 0)
    .reduce((acc, t) => acc + Math.abs(t.valor), 0);
    
  const saldo = totalReceitas - totalDespesas;
  const orcamentoTotal = categorias.reduce((acc, cat) => acc + cat.orcamento, 0);

  if (isLoading && !usuario) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-1 flex items-center justify-center">
          <p>Carregando...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Olá, {usuario?.nome || "usuário"}!</h1>
            <p className="text-muted-foreground">
              Ciclo atual: {cicloAtual.nome}
            </p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>Adicionar Transação</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Nova Transação</DialogTitle>
              </DialogHeader>
              <AddTransacaoForm onAddTransacao={handleAddTransacao} />
            </DialogContent>
          </Dialog>
        </div>
        
        <DashboardContent 
          transacoes={transacoesCicloAtual}
          categorias={categorias}
          cicloAtual={cicloAtual}
          onExcluirTransacao={handleExcluirTransacao}
          totalReceitas={totalReceitas}
          totalDespesas={totalDespesas}
          saldo={saldo}
          orcamentoTotal={orcamentoTotal}
          isLoading={isLoading}
          onCicloChange={handleCicloChange}
        />
      </main>
    </div>
  );
};

export default Dashboard;
