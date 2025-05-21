
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Categoria, Transacao } from "@/types";
import CardResumo from "./CardResumo";
import ResumoOrcamento from "./ResumoOrcamento";
import ListaTransacoes from "./ListaTransacoes";
import GraficoGastosDiarios from "./GraficoGastosDiarios";
import ProgressoCategoria from "./ProgressoCategoria";
import SeletorCiclo from "./SeletorCiclo";
import { CicloFinanceiro } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, TrendingUp, TrendingDown, RefreshCcw } from "lucide-react";
import { formatarMoeda } from "@/utils/financas";
import { Button } from "@/components/ui/button";

interface DashboardContentProps {
  transacoes: Transacao[];
  categorias: Categoria[];
  cicloAtual: CicloFinanceiro;
  onExcluirTransacao: (id: string) => Promise<void>;
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  orcamentoTotal: number;
  isLoading?: boolean;
  onCicloChange: (ciclo: CicloFinanceiro) => void;
  updateKey?: number; // Propriedade para forçar re-renderização
  cacheKey?: string; // Nova propriedade para controle de cache
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  transacoes,
  categorias,
  cicloAtual,
  onExcluirTransacao,
  totalReceitas,
  totalDespesas,
  saldo,
  orcamentoTotal,
  isLoading,
  onCicloChange,
  updateKey,
  cacheKey
}) => {
  const [activeTab, setActiveTab] = useState("resumo");
  
  // Forçar re-renderização quando updateKey ou cacheKey mudar
  useEffect(() => {
    if (cacheKey) {
      console.log("[DashboardContent] Nova versão de cache detectada:", cacheKey);
    }
    console.log("[DashboardContent] Forçando re-renderização com updateKey:", updateKey);
  }, [updateKey, cacheKey]);
  
  // Separamos categorias por tipo
  const categoriasDespesa = categorias.filter(cat => cat.tipo === "despesa");
  const categoriasReceita = categorias.filter(cat => cat.tipo === "receita");
  
  // Calcular o total real de despesas (soma dos gastos atuais em todas as categorias de despesa)
  const totalDespesasCategoria = categoriasDespesa.reduce((acc, cat) => acc + cat.gastosAtuais, 0);
  // Calcular o saldo real com base nos totais das categorias
  const saldoReal = totalReceitas - totalDespesasCategoria;
  
  console.log("[DashboardContent] Renderizando dashboard com dados atualizados");
  console.log("[DashboardContent] Total de receitas:", totalReceitas);
  console.log("[DashboardContent] Total de despesas (de transações):", totalDespesas);
  console.log("[DashboardContent] Total de despesas (soma categorias):", totalDespesasCategoria);
  console.log("[DashboardContent] Saldo:", saldoReal);

  // Gerar chaves únicas para componentes baseadas no cacheKey para forçar re-renderização
  const generateKey = (prefix: string) => {
    return `${prefix}-${cacheKey || updateKey || Date.now()}`;
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Dashboard Financeiro</h2>
        <div className="flex items-center gap-2">
          <SeletorCiclo onCicloChange={onCicloChange} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Receitas do Ciclo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">
              {formatarMoeda(totalReceitas)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-destructive" />
              Despesas do Ciclo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-destructive">
              {formatarMoeda(totalDespesasCategoria)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChart className="h-5 w-5 text-slate-700" />
              Saldo do Ciclo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${saldoReal >= 0 ? "text-primary" : "text-destructive"}`}>
              {formatarMoeda(saldoReal)}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full flex flex-wrap justify-start">
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="despesas">Despesas</TabsTrigger>
          <TabsTrigger value="receitas">Receitas</TabsTrigger>
          <TabsTrigger value="transacoes">Transações</TabsTrigger>
          <TabsTrigger value="graficos">Gráficos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="resumo" className="space-y-4">
          <ResumoOrcamento 
            categorias={categorias} 
            cicloAtual={cicloAtual}
            totalDespesas={totalDespesasCategoria}
            key={generateKey('resumo')}
          />
          <ListaTransacoes 
            transacoes={transacoes.slice(0, 5)} 
            onExcluir={onExcluirTransacao}
            key={generateKey('lista-resumo')}
          />
        </TabsContent>
        
        <TabsContent value="despesas">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categoriasDespesa.map((categoria) => (
              <ProgressoCategoria 
                key={`${categoria.nome}-${generateKey('cat-desp')}`}
                categoria={categoria} 
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="receitas">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categoriasReceita.map((categoria) => (
              <ProgressoCategoria 
                key={`${categoria.nome}-${generateKey('cat-rec')}`}
                categoria={categoria} 
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="transacoes">
          <ListaTransacoes 
            transacoes={transacoes} 
            onExcluir={onExcluirTransacao}
            key={generateKey('lista-all')}
          />
        </TabsContent>
        
        <TabsContent value="graficos">
          <div className="space-y-6">
            <GraficoGastosDiarios 
              transacoes={transacoes} 
              ciclo={cicloAtual} 
              orcamentoTotal={orcamentoTotal}
              key={generateKey('grafico')}
            />
          </div>
        </TabsContent>
      </Tabs>
      
      {isLoading && <div className="text-center py-6">Carregando dados...</div>}
    </div>
  );
};

export default DashboardContent;
