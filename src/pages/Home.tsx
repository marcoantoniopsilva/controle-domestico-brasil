
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NavBar from "@/components/layout/NavBar";
import ResumoOrcamento from "@/components/financas/ResumoOrcamento";
import { categorias, calcularCicloAtual } from "@/utils/financas";
import { useCategoryBudgets } from "@/hooks/useCategoryBudgets";
import { useAuth } from "@/hooks/useAuth";

const Home = () => {
  const { usuario } = useAuth();
  const { getCategoriesWithCustomBudgets } = useCategoryBudgets();
  
  // Get the current financial cycle for the demo display
  const cicloAtual = calcularCicloAtual();
  
  // Para a página inicial, definimos um valor demo para totalDespesas
  const totalDespesas = 0; // Valor demonstrativo
  
  // Use categorias personalizadas se o usuário estiver logado, senão use as padrão
  const categoriasParaExibir = usuario ? getCategoriesWithCustomBudgets() : categorias;

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-1 container mx-auto px-4">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-white to-gray-50 py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Controle Financeiro Familiar
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Uma maneira simples e eficiente de gerenciar as finanças da sua família.
              Monitore suas despesas, estabeleça metas e tome decisões informadas.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/cadastro">
                <Button className="text-lg px-8 py-6">Comece agora</Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="text-lg px-8 py-6">
                  Já tenho uma conta
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Relatórios Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Relatórios</h2>
            <div className="grid grid-cols-1 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Orçamento por Categorias</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResumoOrcamento 
                    categorias={categoriasParaExibir} 
                    cicloAtual={cicloAtual}
                    totalDespesas={totalDespesas}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Funcionalidades
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M16 2v5h5"></path><path d="M21 6v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"></path><path d="M12 18v-6"></path><path d="M8 18v-1"></path><path d="M16 18v-3"></path></svg>
                </div>
                <h3 className="text-xl font-semibold text-center mb-2">Controle de Despesas</h3>
                <p className="text-gray-600 text-center">
                  Registre despesas facilmente e categorize-as para um melhor acompanhamento.
                </p>
              </div>
              
              <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M3 3v18h18"></path><path d="m19 9-5 5-4-4-3 3"></path></svg>
                </div>
                <h3 className="text-xl font-semibold text-center mb-2">Gráficos Detalhados</h3>
                <p className="text-gray-600 text-center">
                  Visualize suas finanças com gráficos intuitivos que mostram para onde vai seu dinheiro.
                </p>
              </div>
              
              <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M8 3H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-1"></path><path d="M12 17v.01"></path><path d="M12 11v4"></path><path d="M12 3v4"></path><path d="M8 3h8"></path></svg>
                </div>
                <h3 className="text-xl font-semibold text-center mb-2">Ciclo Personalizado</h3>
                <p className="text-gray-600 text-center">
                  Defina seu próprio ciclo contábil mensal de acordo com suas necessidades.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Call-to-action Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">
              Comece a controlar suas finanças hoje
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Junte-se a milhares de famílias que já estão economizando mais e 
              gerenciando melhor seu dinheiro.
            </p>
            <Link to="/cadastro">
              <Button size="lg">Criar minha conta</Button>
            </Link>
          </div>
        </section>
      </main>
      
      <footer className="bg-gray-100 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2025 ControleFinanceiro. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
