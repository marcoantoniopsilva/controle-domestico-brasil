import { Button } from "@/components/ui/button";
import { useSimulacaoOrcamento } from "@/hooks/useSimulacaoOrcamento";
import { useComparativoSimulacao } from "@/hooks/useComparativoSimulacao";
import { SimuladorResumo } from "@/components/simulador/SimuladorResumo";
import { SimuladorTabela } from "@/components/simulador/SimuladorTabela";
import { SimuladorSaldoAcumulado } from "@/components/simulador/SimuladorSaldoAcumulado";
import { ComparativoRealizado } from "@/components/simulador/ComparativoRealizado";
import { Skeleton } from "@/components/ui/skeleton";
import { RotateCcw, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import NavBar from "@/components/layout/NavBar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Simulador() {
  const {
    simulacao,
    loading,
    saving,
    salvarValor,
    resetarMes,
    resetarTudo,
    copiarParaTodosMeses,
    calcularTotais,
    calcularTotaisMes,
    calcularSaldosMensais,
    anoSimulacao
  } = useSimulacaoOrcamento();

  const { comparativos, loading: loadingComparativo } = useComparativoSimulacao(simulacao);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="container mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  const totais = calcularTotais();
  const saldosMensais = calcularSaldosMensais();

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">
                Simulador de Orçamento Anual {anoSimulacao}
              </h1>
              <p className="text-muted-foreground">
                Planeje e simule seu orçamento mensal para o ano de {anoSimulacao}
              </p>
            </div>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" disabled={saving}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Resetar Tudo
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Resetar toda a simulação?</AlertDialogTitle>
                <AlertDialogDescription>
                  Isso irá restaurar todos os valores para os orçamentos base definidos no seu planejamento financeiro.
                  Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={resetarTudo}>
                  Confirmar Reset
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Cards de Resumo */}
        <SimuladorResumo totais={totais} />

        {/* Tabela de Orçamentos */}
        <SimuladorTabela
          simulacao={simulacao}
          saving={saving}
          onSalvarValor={salvarValor}
          onResetarMes={resetarMes}
          onCopiarParaTodos={copiarParaTodosMeses}
          calcularTotaisMes={calcularTotaisMes}
        />

        {/* Saldo Projetado Acumulado */}
        <SimuladorSaldoAcumulado saldosMensais={saldosMensais} />

        {/* Comparativo Realizado */}
        {!loadingComparativo && (
          <ComparativoRealizado comparativos={comparativos} />
        )}
      </div>
    </div>
  );
}
