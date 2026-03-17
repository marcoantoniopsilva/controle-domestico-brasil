
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transacao } from "@/types";
import { formatarMoedaInvestimento } from "@/utils/investimentos";
import { PiggyBank, TrendingUp } from "lucide-react";

interface InvestmentSummaryCardsProps {
  transacoes: Transacao[];
}

const InvestmentSummaryCards: React.FC<InvestmentSummaryCardsProps> = ({ transacoes }) => {
  const investimentos = transacoes.filter(t => t.tipo === 'investimento');
  
  // Saldo atual = soma dos valores atuais de cada investimento (valor representa o saldo atual)
  const saldoAtual = investimentos.reduce((acc, inv) => acc + Math.abs(inv.valor), 0);
  
  // Quantidade de investimentos ativos
  const qtdInvestimentos = investimentos.length;

  // Agrupar por categoria para ver distribuição
  const porCategoria = investimentos.reduce((acc, inv) => {
    acc[inv.categoria] = (acc[inv.categoria] || 0) + Math.abs(inv.valor);
    return acc;
  }, {} as Record<string, number>);

  const categorias = Object.entries(porCategoria).sort((a, b) => b[1] - a[1]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Patrimônio Investido</CardTitle>
          <PiggyBank className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {formatarMoedaInvestimento(saldoAtual)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {qtdInvestimentos} investimento{qtdInvestimentos !== 1 ? 's' : ''} ativo{qtdInvestimentos !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Distribuição</CardTitle>
          <TrendingUp className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          {categorias.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum investimento registrado</p>
          ) : (
            <div className="space-y-1">
              {categorias.slice(0, 4).map(([cat, valor]) => (
                <div key={cat} className="flex justify-between text-sm">
                  <span className="text-muted-foreground truncate mr-2">{cat}</span>
                  <span className="font-medium">{formatarMoedaInvestimento(valor)}</span>
                </div>
              ))}
              {categorias.length > 4 && (
                <p className="text-xs text-muted-foreground">+{categorias.length - 4} categorias</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvestmentSummaryCards;
