
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Categoria, CicloFinanceiro, Transacao } from "@/types";
import ResumoOrcamento from "../ResumoOrcamento";
import ListaTransacoes from "../ListaTransacoes";
import GraficoGastosDiarios from "../GraficoGastosDiarios";
import ProgressoCategoria from "../ProgressoCategoria";
import RelatorioCartaoCredito from "../RelatorioCartaoCredito";
import GraficoComparativoMensal from "../GraficoComparativoMensal";

interface DashboardTabsProps {
  transacoes: Transacao[];
  categorias: Categoria[];
  cicloAtual: CicloFinanceiro;
  onExcluirTransacao: (id: string) => Promise<void>;
  onEditarTransacao?: (id: string, transacao: Omit<Transacao, "id">) => Promise<void>;
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
  onEditarTransacao,
  totalDespesasCategoria,
  orcamentoTotal
}: DashboardTabsProps) => {
  const [activeTab, setActiveTab] = useState("resumo");
  
  // Separamos categorias por tipo
  const categoriasDespesa = categorias.filter(cat => cat.tipo === "despesa");
  const categoriasReceita = categorias.filter(cat => cat.tipo === "receita");

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
        />
        
        {/* Adicionar relatório de cartão de crédito no dashboard */}
        <RelatorioCartaoCredito
          transacoes={transacoes}
          categorias={categorias}
          cicloAtual={cicloAtual}
        />
        
        <ListaTransacoes 
          transacoes={transacoes.slice(0, 5)} 
          onExcluir={onExcluirTransacao}
          onEditar={onEditarTransacao}
        />
      </TabsContent>
      
      <TabsContent value="despesas">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {categoriasDespesa.map((categoria) => (
            <ProgressoCategoria 
              key={categoria.nome}
              categoria={categoria} 
            />
          ))}
        </div>
      </TabsContent>
      
      <TabsContent value="receitas">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {categoriasReceita.map((categoria) => (
            <ProgressoCategoria 
              key={categoria.nome}
              categoria={categoria} 
            />
          ))}
        </div>
      </TabsContent>
      
      <TabsContent value="transacoes">
        <ListaTransacoes 
          transacoes={transacoes} 
          onExcluir={onExcluirTransacao}
          onEditar={onEditarTransacao}
        />
      </TabsContent>
      
      <TabsContent value="graficos" className="space-y-6">
        {/* Relatório de Cartão de Crédito */}
        <RelatorioCartaoCredito
          transacoes={transacoes}
          categorias={categorias}
          cicloAtual={cicloAtual}
        />
        
        {/* Gráfico Comparativo Mensal */}
        <GraficoComparativoMensal
          transacoes={transacoes}
          categorias={categorias}
        />
        
        {/* Gráfico de Gastos Diários (mantido) */}
        <GraficoGastosDiarios 
          transacoes={transacoes} 
          ciclo={cicloAtual} 
          orcamentoTotal={orcamentoTotal}
        />
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;
