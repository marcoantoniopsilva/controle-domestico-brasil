
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Categoria, CicloFinanceiro, Transacao } from "@/types";
import ResumoOrcamento from "../ResumoOrcamento";
import ListaTransacoes from "../ListaTransacoes";
import GraficoGastosDiarios from "../GraficoGastosDiarios";
import ProgressoCategoria from "../ProgressoCategoria";

interface DashboardTabsProps {
  transacoes: Transacao[];
  categorias: Categoria[];
  cicloAtual: CicloFinanceiro;
  onExcluirTransacao: (id: string) => Promise<void>;
  totalDespesasCategoria: number;
  orcamentoTotal: number;
  cacheKey?: string;
  updateKey?: number;
}

const DashboardTabs = ({
  transacoes,
  categorias,
  cicloAtual,
  onExcluirTransacao,
  totalDespesasCategoria,
  orcamentoTotal,
  cacheKey,
  updateKey
}: DashboardTabsProps) => {
  const [activeTab, setActiveTab] = useState("resumo");
  
  // Separamos categorias por tipo
  const categoriasDespesa = categorias.filter(cat => cat.tipo === "despesa");
  const categoriasReceita = categorias.filter(cat => cat.tipo === "receita");
  
  // Gerar chaves únicas para componentes baseadas no cacheKey para forçar re-renderização
  const generateKey = (prefix: string) => {
    return `${prefix}-${cacheKey || updateKey || Date.now()}`;
  };

  return (
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
  );
};

export default DashboardTabs;
