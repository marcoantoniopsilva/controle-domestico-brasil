
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Transacao, CicloFinanceiro, Categoria } from "@/types";
import { formatarMoeda } from "@/utils/financas";
import { differenceInDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TrendingUp, TrendingDown, AlertTriangle, Target, Calendar, Wallet } from "lucide-react";

interface PrevisaoFechamentoCicloProps {
  transacoes: Transacao[];
  cicloAtual: CicloFinanceiro;
  orcamentoTotal: number;
}

const PrevisaoFechamentoCiclo = ({
  transacoes,
  cicloAtual,
  orcamentoTotal
}: PrevisaoFechamentoCicloProps) => {
  const hoje = new Date();
  
  // Calcular dias do ciclo
  const totalDiasCiclo = differenceInDays(cicloAtual.fim, cicloAtual.inicio) + 1;
  const diasPassados = Math.max(0, differenceInDays(hoje, cicloAtual.inicio) + 1);
  const diasRestantes = Math.max(0, differenceInDays(cicloAtual.fim, hoje));
  
  // Calcular gastos atuais (apenas despesas)
  const despesas = transacoes.filter(t => t.tipo === "despesa");
  const totalGastoAtual = despesas.reduce((acc, t) => acc + Math.abs(t.valor), 0);
  
  // Calcular média diária atual
  const mediaDiariaAtual = diasPassados > 0 ? totalGastoAtual / diasPassados : 0;
  
  // Projeção de gastos até o fim do ciclo
  const projecaoGastos = totalGastoAtual + (mediaDiariaAtual * diasRestantes);
  
  // Limite diário ideal
  const limiteDiarioIdeal = orcamentoTotal / totalDiasCiclo;
  
  // Limite diário recomendado (considerando o que já gastou)
  const orcamentoRestante = orcamentoTotal - totalGastoAtual;
  const limiteDiarioRecomendado = diasRestantes > 0 ? orcamentoRestante / diasRestantes : 0;
  
  // Percentual do orçamento já utilizado
  const percentualUtilizado = orcamentoTotal > 0 ? (totalGastoAtual / orcamentoTotal) * 100 : 0;
  
  // Status do ciclo
  const getStatus = () => {
    const percentualDias = (diasPassados / totalDiasCiclo) * 100;
    
    if (projecaoGastos <= orcamentoTotal * 0.9) {
      return { 
        tipo: "success", 
        mensagem: "No caminho certo! Você deve fechar dentro do orçamento.",
        cor: "text-green-600",
        bgCor: "bg-green-50",
        borderCor: "border-green-200"
      };
    } else if (projecaoGastos <= orcamentoTotal * 1.05) {
      return { 
        tipo: "warning", 
        mensagem: "Atenção! Projeção próxima do limite do orçamento.",
        cor: "text-amber-600",
        bgCor: "bg-amber-50",
        borderCor: "border-amber-200"
      };
    } else {
      return { 
        tipo: "danger", 
        mensagem: "Alerta! Projeção acima do orçamento. Reduza os gastos.",
        cor: "text-red-600",
        bgCor: "bg-red-50",
        borderCor: "border-red-200"
      };
    }
  };
  
  const status = getStatus();
  
  // Economia/Estouro projetado
  const diferencaProjetada = orcamentoTotal - projecaoGastos;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Previsão de Fechamento do Ciclo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Alert */}
        <div className={`p-4 rounded-lg border ${status.bgCor} ${status.borderCor}`}>
          <div className="flex items-center gap-2">
            {status.tipo === "success" && <TrendingDown className={`h-5 w-5 ${status.cor}`} />}
            {status.tipo === "warning" && <AlertTriangle className={`h-5 w-5 ${status.cor}`} />}
            {status.tipo === "danger" && <TrendingUp className={`h-5 w-5 ${status.cor}`} />}
            <span className={`font-medium ${status.cor}`}>{status.mensagem}</span>
          </div>
        </div>

        {/* Progresso do ciclo */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso do ciclo</span>
            <span className="font-medium">{diasPassados} de {totalDiasCiclo} dias</span>
          </div>
          <Progress value={(diasPassados / totalDiasCiclo) * 100} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{format(cicloAtual.inicio, "dd/MM", { locale: ptBR })}</span>
            <span>{diasRestantes} dias restantes</span>
            <span>{format(cicloAtual.fim, "dd/MM", { locale: ptBR })}</span>
          </div>
        </div>

        {/* Progresso do orçamento */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Utilização do orçamento</span>
            <span className="font-medium">{percentualUtilizado.toFixed(1)}%</span>
          </div>
          <Progress 
            value={Math.min(percentualUtilizado, 100)} 
            className={`h-2 ${percentualUtilizado > 100 ? '[&>div]:bg-red-500' : ''}`}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatarMoeda(totalGastoAtual)}</span>
            <span>de {formatarMoeda(orcamentoTotal)}</span>
          </div>
        </div>

        {/* Cards de métricas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Wallet className="h-4 w-4" />
              Projeção Final
            </div>
            <div className={`text-xl font-bold ${projecaoGastos > orcamentoTotal ? 'text-red-600' : 'text-green-600'}`}>
              {formatarMoeda(projecaoGastos)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {diferencaProjetada >= 0 
                ? `Economia de ${formatarMoeda(diferencaProjetada)}`
                : `Estouro de ${formatarMoeda(Math.abs(diferencaProjetada))}`
              }
            </div>
          </div>

          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Calendar className="h-4 w-4" />
              Média Diária
            </div>
            <div className={`text-xl font-bold ${mediaDiariaAtual > limiteDiarioIdeal ? 'text-red-600' : 'text-green-600'}`}>
              {formatarMoeda(mediaDiariaAtual)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Ideal: {formatarMoeda(limiteDiarioIdeal)}/dia
            </div>
          </div>
        </div>

        {/* Recomendação */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="text-sm font-medium text-primary mb-1">
            💡 Limite diário recomendado
          </div>
          <div className="text-2xl font-bold text-primary">
            {formatarMoeda(Math.max(0, limiteDiarioRecomendado))}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Para fechar o ciclo dentro do orçamento
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrevisaoFechamentoCiclo;
