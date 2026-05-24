import { Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardInsight } from "@/hooks/useDashboardInsights";

interface InsightsCardProps {
  insights: DashboardInsight[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
}

const tipoStyle = {
  positivo: "border-l-primary",
  negativo: "border-l-destructive",
  dica: "border-l-secondary",
};

export function InsightsCard({ insights, isLoading, error, onRefresh }: InsightsCardProps) {
  return (
    <div className="bg-card rounded-2xl p-5 md:p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-semibold text-sm md:text-base">Insights do ciclo</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onRefresh} disabled={isLoading} className="text-xs">
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {isLoading && insights.length === 0 ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : error ? (
        <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 rounded-xl p-3">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-destructive" />
          <span>{error}</span>
        </div>
      ) : insights.length === 0 ? (
        <p className="text-sm text-muted-foreground">Adicione transações ao ciclo para receber insights personalizados.</p>
      ) : (
        <div className="grid gap-2 md:grid-cols-3">
          {insights.map((insight, i) => (
            <div
              key={i}
              className={`bg-background rounded-xl p-3 md:p-4 border-l-4 ${tipoStyle[insight.tipo] || tipoStyle.dica}`}
            >
              <div className="flex items-start gap-2">
                <span className="text-xl leading-none mt-0.5">{insight.emoji}</span>
                <p className="text-sm leading-snug">{insight.texto}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}