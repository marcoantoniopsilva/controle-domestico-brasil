
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
    console.log("Nova data de início:", novoCiclo.inicio instanceof Date ? novoCiclo.inicio.toISOString() : novoCiclo.inicio);
    console.log("Nova data de fim:", novoCiclo.fim instanceof Date ? novoCiclo.fim.toISOString() : novoCiclo.fim);
    
    // Criar novas instâncias de Date para evitar referências de objeto
    const cicloAtualizado: CicloFinanceiro = {
      inicio: novoCiclo.inicio instanceof Date ? new Date(novoCiclo.inicio) : new Date(novoCiclo.inicio),
      fim: novoCiclo.fim instanceof Date ? new Date(novoCiclo.fim) : new Date(novoCiclo.fim),
      nome: novoCiclo.nome
    };
    
    setCicloAtual(cicloAtualizado);
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
    console.log("Data início do ciclo:", cicloAtual.inicio instanceof Date ? cicloAtual.inicio.toISOString() : cicloAtual.inicio);
    console.log("Data fim do ciclo:", cicloAtual.fim instanceof Date ? cicloAtual.fim.toISOString() : cicloAtual.fim);
    
    // Garantir que estamos trabalhando com objetos Date
    const inicio = cicloAtual.inicio instanceof Date ? new Date(cicloAtual.inicio) : new Date(cicloAtual.inicio);
    const fim = cicloAtual.fim instanceof Date ? new Date(cicloAtual.fim) : new Date(cicloAtual.fim);
    
    inicio.setHours(0, 0, 0, 0);
    fim.setHours(23, 59, 59, 999);
    
    // Filtrar transações do ciclo atual
    const transacoesCicloAtual = transacoes.filter(t => {
      const data = new Date(t.data);
      data.setHours(0, 0, 0, 0);
      
      const estaNoCiclo = data >= inicio && data <= fim;
      
      if (estaNoCiclo) {
        console.log(`Transação ${t.id} (${t.descricao || t.categoria}) está no ciclo ${cicloAtual.nome}`);
        console.log(`Data da transação: ${data.toISOString()}`);
      }
      
      return estaNoCiclo;
    });
    
    console.log(`Encontradas ${transacoesCicloAtual.length} transações no ciclo ${cicloAtual.nome}`);
    
    // Filtrar parcelas futuras para este ciclo
    const parcelasFuturasCicloAtual = parcelasFuturas.filter(t => {
      const data = new Date(t.data);
      data.setHours(0, 0, 0, 0);
      
      const estaNoCiclo = data >= inicio && data <= fim;
      
      if (estaNoCiclo) {
        console.log(`Parcela futura ${t.id} (${t.descricao}) está no ciclo ${cicloAtual.nome}`);
        console.log(`Data da parcela: ${data.toISOString()}`);
      }
      
      return estaNoCiclo;
    });
    
    console.log("Transações do ciclo atual:", transacoesCicloAtual.length);
    console.log("Parcelas futuras do ciclo atual:", parcelasFuturasCicloAtual.length);
    
    // Combinar transações reais e parcelas futuras para este ciclo
    const todasTransacoes = [
      ...transacoesCicloAtual,
      ...parcelasFuturasCicloAtual
    ].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    
    console.log(`Total combinado de transações para o ciclo ${cicloAtual.nome}: ${todasTransacoes.length}`);
    
    return todasTransacoes;
    
  }, [transacoes, parcelasFuturas, cicloAtual]);
  
  // Cálculo dos totais por categoria e totais gerais
  const {
    categoriasAtualizadas,
    totalReceitas,
    totalDespesas,
    saldo
  } = useMemo(() => {
    console.log(`Calculando totais para o ciclo ${cicloAtual.nome} com ${transacoesFiltradas.length} transações`);
    
    // Calcular totais para cada categoria
    const categoriasAtuais = categorias.map(cat => {
      const gastosNaCategoria = transacoesFiltradas
        .filter(t => t.categoria === cat.nome && t.valor < 0)
        .reduce((acc, t) => acc + Math.abs(t.valor), 0);
      
      console.log(`Categoria ${cat.nome}: ${gastosNaCategoria}`);
      
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
    
    console.log(`Receitas: ${receitas}, Despesas: ${despesas}, Saldo: ${receitas - despesas}`);
    
    return {
      categoriasAtualizadas: categoriasAtuais,
      totalReceitas: receitas,
      totalDespesas: despesas,
      saldo: receitas - despesas
    };
    
  }, [transacoesFiltradas, cicloAtual]);

  console.log("Renderizando Dashboard com ciclo:", cicloAtual.nome);
  
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
