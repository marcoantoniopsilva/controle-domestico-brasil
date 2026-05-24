
import React from "react";
import { formatarMoeda } from "@/utils/financas";
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react";

interface SummaryCardsProps {
  totalReceitas: number;
  totalDespesas: number;
  totalInvestimentos?: number;
  saldo: number;
  orcamentoTotal: number;
}

interface MetricCardProps {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  accent?: "primary" | "destructive" | "secondary" | "neutral";
  hint?: string;
}

function MetricCard({ label, value, icon: Icon, accent = "neutral", hint }: MetricCardProps) {
  const accentClass = {
    primary: "text-primary",
    destructive: "text-destructive",
    secondary: "text-secondary",
    neutral: "text-foreground",
  }[accent];

  return (
    <div className="bg-card rounded-2xl p-4 md:p-6 shadow-card hover:shadow-elevated transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-label">{label}</span>
        <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center ${accentClass}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className={`text-metric ${accentClass}`}>{formatarMoeda(value)}</div>
      {hint && <p className="text-xs text-muted-foreground mt-2">{hint}</p>}
    </div>
  );
}

const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalReceitas,
  totalDespesas,
  totalInvestimentos = 0,
  saldo,
  orcamentoTotal,
}) => {
  const pctOrcado = orcamentoTotal > 0 ? Math.round((totalDespesas / orcamentoTotal) * 100) : 0;

  return (
    <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
      <MetricCard label="Saldo do ciclo" value={saldo} icon={Wallet} accent={saldo >= 0 ? "primary" : "destructive"} hint="Receitas − Despesas" />
      <MetricCard label="Receitas" value={totalReceitas} icon={TrendingUp} accent="primary" />
      <MetricCard label="Despesas" value={totalDespesas} icon={TrendingDown} accent="destructive" hint={orcamentoTotal > 0 ? `${pctOrcado}% de ${formatarMoeda(orcamentoTotal)} orçado` : undefined} />
      <MetricCard label="Investimentos" value={totalInvestimentos} icon={PiggyBank} accent="secondary" hint="Saldo acumulado" />
    </div>
  );
};

export default SummaryCards;
