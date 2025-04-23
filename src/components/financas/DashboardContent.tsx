
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Categoria, Transacao } from "@/types";
import CardResumo from "./CardResumo";
import ResumoOrcamento from "./ResumoOrcamento";
import ListaTransacoes from "./ListaTransacoes";
import GraficoGastosDiarios from "./GraficoGastosDiarios";
import ProgressoCategoria from "./ProgressoCategoria";
import SeletorCiclo from "./SeletorCiclo";
import { CicloFinanceiro } from "@/types";

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
  onCicloChange
}) => {
  const [activeTab, setActiveTab] = useState("resumo");

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Dashboard Financeiro</h2>
        <SeletorCiclo onCicloChange={onCicloChange} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CardResumo titulo="Receitas" valor={totalReceitas} tipo="primary" />
        <CardResumo titulo="Despesas" valor={totalDespesas} tipo="destructive" />
        <CardResumo titulo="Saldo" valor={saldo} tipo="default" />
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
            transacoes={transacoes.slice(0, 5)} 
            onExcluir={onExcluirTransacao}
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
            transacoes={transacoes} 
            onExcluir={onExcluirTransacao}
          />
        </TabsContent>
        
        <TabsContent value="graficos">
          <div className="space-y-6">
            <GraficoGastosDiarios 
              transacoes={transacoes} 
              ciclo={cicloAtual} 
              orcamentoTotal={orcamentoTotal}
            />
          </div>
        </TabsContent>
      </Tabs>
      
      {isLoading && <div className="text-center py-6">Carregando dados...</div>}
    </div>
  );
};

export default DashboardContent;
