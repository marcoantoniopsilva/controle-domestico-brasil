
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import NavBar from "@/components/layout/NavBar";
import ProgressoCategoria from "@/components/financas/ProgressoCategoria";
import ResumoOrcamento from "@/components/financas/ResumoOrcamento";
import ListaTransacoes from "@/components/financas/ListaTransacoes";
import AddTransacaoForm from "@/components/financas/AddTransacaoForm";
import GraficoGastosDiarios from "@/components/financas/GraficoGastosDiarios";
import { Categoria, CicloFinanceiro, Transacao } from "@/types";
import { categorias as categoriasIniciais, calcularCicloAtual, formatarMoeda } from "@/utils/financas";

const Dashboard = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<any>(null);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>(categoriasIniciais);
  const [cicloAtual, setCicloAtual] = useState<CicloFinanceiro>(calcularCicloAtual());
  const [activeTab, setActiveTab] = useState("resumo");
  
  useEffect(() => {
    // Verificar se existe um usuário logado
    const usuarioLogadoJSON = localStorage.getItem("usuarioLogado");
    if (!usuarioLogadoJSON) {
      navigate("/login");
      return;
    }
    
    const usuarioLogado = JSON.parse(usuarioLogadoJSON);
    setUsuario(usuarioLogado);
    
    // Carregar transações do localStorage
    const transacoesJSON = localStorage.getItem("transacoes");
    if (transacoesJSON) {
      const transacoesCarregadas = JSON.parse(transacoesJSON);
      setTransacoes(transacoesCarregadas.map((t: any) => ({
        ...t,
        data: new Date(t.data)
      })));
    }
  }, [navigate]);
  
  // Atualizar categorias quando as transações mudarem
  useEffect(() => {
    if (transacoes.length > 0) {
      const categoriasAtualizadas = [...categoriasIniciais];
      
      // Filtrar transações para o ciclo atual e calcular gastos por categoria
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
  
  // Salvar transações no localStorage quando mudarem
  useEffect(() => {
    localStorage.setItem("transacoes", JSON.stringify(transacoes));
  }, [transacoes]);
  
  const handleAddTransacao = (novaTransacao: Omit<Transacao, "id">) => {
    const id = Date.now().toString();
    const transacaoCompleta = { ...novaTransacao, id };
    
    setTransacoes(prev => [...prev, transacaoCompleta]);
    
    // Se for uma transação parcelada, criar as parcelas futuras
    if (novaTransacao.parcelas > 1) {
      const valorParcela = novaTransacao.valor / novaTransacao.parcelas;
      
      const parcelasFuturas = Array.from({ length: novaTransacao.parcelas - 1 }, (_, i) => {
        const dataOriginal = new Date(novaTransacao.data);
        const dataParcela = new Date(dataOriginal);
        dataParcela.setMonth(dataOriginal.getMonth() + i + 1);
        
        return {
          ...novaTransacao,
          id: `${id}-parcela-${i+2}`,
          data: dataParcela,
          valor: valorParcela,
          descricao: novaTransacao.descricao ? `${novaTransacao.descricao} (Parcela ${i+2}/${novaTransacao.parcelas})` : `Parcela ${i+2}/${novaTransacao.parcelas}`
        };
      });
      
      setTransacoes(prev => [...prev, ...parcelasFuturas]);
    }
  };
  
  const handleExcluirTransacao = (id: string) => {
    setTransacoes(prev => prev.filter(t => t.id !== id));
    toast.success("Transação excluída com sucesso!");
  };
  
  // Filtrar transações para o ciclo atual
  const transacoesCicloAtual = transacoes.filter(t => {
    const data = new Date(t.data);
    return data >= cicloAtual.inicio && data <= cicloAtual.fim;
  });
  
  // Calcular total de receitas e despesas
  const totalReceitas = transacoesCicloAtual
    .filter(t => t.valor > 0)
    .reduce((acc, t) => acc + t.valor, 0);
    
  const totalDespesas = transacoesCicloAtual
    .filter(t => t.valor < 0)
    .reduce((acc, t) => acc + Math.abs(t.valor), 0);
    
  const saldo = totalReceitas - totalDespesas;
  const orcamentoTotal = categorias.reduce((acc, cat) => acc + cat.orcamento, 0);
  
  // Ordenar transações por data (mais recente primeiro)
  const transacoesOrdenadas = [...transacoesCicloAtual].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
  );
  
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
          
          <Dialog>
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
        
        {/* Cartões de resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border">
            <p className="text-sm text-muted-foreground">Receitas</p>
            <p className="text-2xl font-bold text-primary">{formatarMoeda(totalReceitas)}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 border">
            <p className="text-sm text-muted-foreground">Despesas</p>
            <p className="text-2xl font-bold text-destructive">{formatarMoeda(totalDespesas)}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 border">
            <p className="text-sm text-muted-foreground">Saldo</p>
            <p className={`text-2xl font-bold ${saldo >= 0 ? "text-primary" : "text-destructive"}`}>
              {formatarMoeda(saldo)}
            </p>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="categorias">Categorias</TabsTrigger>
            <TabsTrigger value="transacoes">Transações</TabsTrigger>
            <TabsTrigger value="graficos">Gráficos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="resumo" className="space-y-4">
            <ResumoOrcamento categorias={categorias} />
            <ListaTransacoes 
              transacoes={transacoesOrdenadas.slice(0, 5)} 
              onExcluir={handleExcluirTransacao}
            />
          </TabsContent>
          
          <TabsContent value="categorias">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {categorias.map((categoria) => (
                <ProgressoCategoria 
                  key={categoria.nome} 
                  categoria={categoria} 
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="transacoes">
            <ListaTransacoes 
              transacoes={transacoesOrdenadas} 
              onExcluir={handleExcluirTransacao}
            />
          </TabsContent>
          
          <TabsContent value="graficos">
            <div className="space-y-6">
              <GraficoGastosDiarios 
                transacoes={transacoesCicloAtual} 
                ciclo={cicloAtual} 
                orcamentoTotal={orcamentoTotal}
              />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
