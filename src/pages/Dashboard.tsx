
import { useState, useEffect, useMemo } from "react";
import NavBar from "@/components/layout/NavBar";
import { calcularCicloAtual, categorias } from "@/utils/financas";
import DashboardContent from "@/components/financas/DashboardContent";
import { useTransacoes } from "@/hooks/useTransacoes";
import { useAuth } from "@/hooks/useAuth";
import { DashboardHeader } from "@/components/financas/DashboardHeader";
import { CicloFinanceiro } from "@/types";
import { useParcelasFuturas } from "@/hooks/useParcelasFuturas";

const Dashboard = () => {
  const { usuario } = useAuth();
  const { transacoes, isLoading, handleAddTransacao, handleExcluirTransacao, fetchTransacoes } = useTransacoes();
  const [cicloAtual, setCicloAtual] = useState<CicloFinanceiro>(calcularCicloAtual());
  
  // Obter as parcelas futuras projetadas
  const parcelasFuturas = useParcelasFuturas(transacoes, cicloAtual);

  const handleCicloChange = (novoCiclo: CicloFinanceiro) => {
    console.log("Alterando ciclo para:", novoCiclo.nome);
    console.log("Nova data de início:", novoCiclo.inicio);
    console.log("Nova data de fim:", novoCiclo.fim);
    setCicloAtual(novoCiclo);
  };

  // Recarregar transações quando o componente é montado ou quando o usuário muda
  useEffect(() => {
    if (usuario) {
      console.log("Recarregando transações para o usuário:", usuario.id);
      fetchTransacoes();
    }
  }, [usuario, fetchTransacoes]);

  // Filtragem de transações memorizada para melhor performance
  const transacoesFiltradas = useMemo(() => {
    console.log("Filtrando transações para ciclo:", cicloAtual.nome);
    
    // Filtrar transações do ciclo atual - garantir conversão para datas
    const transacoesCicloAtual = transacoes.filter(t => {
      const data = new Date(t.data);
      const inicio = new Date(cicloAtual.inicio);
      const fim = new Date(cicloAtual.fim);
      
      const estaNoCiclo = data >= inicio && data <= fim;
      return estaNoCiclo;
    });
    
    // Filtrar parcelas futuras para este ciclo
    const parcelasFuturasCicloAtual = parcelasFuturas.filter(t => {
      const data = new Date(t.data);
      const inicio = new Date(cicloAtual.inicio);
      const fim = new Date(cicloAtual.fim);
      
      return data >= inicio && data <= fim;
    });
    
    console.log("Transações do ciclo atual:", transacoesCicloAtual.length);
    console.log("Parcelas futuras do ciclo atual:", parcelasFuturasCicloAtual.length);
    
    // Combinar transações reais e parcelas futuras para este ciclo
    return [
      ...transacoesCicloAtual,
      ...parcelasFuturasCicloAtual
    ].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    
  }, [transacoes, parcelasFuturas, cicloAtual]);
  
  // Cálculo dos totais por categoria e totais gerais
  const {
    categoriasAtualizadas,
    totalReceitas,
    totalDespesas,
    saldo
  } = useMemo(() => {
    // Calcular totais para cada categoria
    const categoriasAtuais = categorias.map(cat => {
      const gastosNaCategoria = transacoesFiltradas
        .filter(t => t.categoria === cat.nome && t.valor < 0)
        .reduce((acc, t) => acc + Math.abs(t.valor), 0);
      
      return {
        ...cat,
        gastosAtuais: gastosNaCategoria
      };
    });
    
    const receitas = transacoesFiltradas
      .filter(t => t.valor > 0)
      .reduce((acc, t) => acc + t.valor, 0);
      
    const despesas = transacoesFiltradas
      .filter(t => t.valor < 0)
      .reduce((acc, t) => acc + Math.abs(t.valor), 0);
    
    return {
      categoriasAtualizadas: categoriasAtuais,
      totalReceitas: receitas,
      totalDespesas: despesas,
      saldo: receitas - despesas
    };
    
  }, [transacoesFiltradas]);

  console.log("Ciclo atual:", cicloAtual.nome);
  console.log("Data início do ciclo:", cicloAtual.inicio);
  console.log("Data fim do ciclo:", cicloAtual.fim);
  console.log("Total de transações combinadas:", transacoesFiltradas.length);
  console.log("Total de transações carregadas:", transacoes.length);
  console.log("Total de parcelas futuras:", parcelasFuturas.length);
  
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
        {usuario && (
          <>
            <DashboardHeader 
              usuario={usuario}
              onAddTransacao={(transacao) => handleAddTransacao(transacao, usuario.id)}
            />
            
            <DashboardContent 
              transacoes={transacoesFiltradas}
              categorias={categoriasAtualizadas}
              cicloAtual={cicloAtual}
              onExcluirTransacao={handleExcluirTransacao}
              totalReceitas={totalReceitas}
              totalDespesas={totalDespesas}
              saldo={saldo}
              orcamentoTotal={categorias.reduce((acc, cat) => acc + cat.orcamento, 0)}
              isLoading={isLoading}
              onCicloChange={handleCicloChange}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
