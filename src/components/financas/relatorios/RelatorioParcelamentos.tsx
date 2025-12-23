
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Transacao } from "@/types";
import { formatarMoeda } from "@/utils/financas";
import { format, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CreditCard, Calendar, TrendingUp, Clock } from "lucide-react";

interface RelatorioParcelamentosProps {
  transacoes: Transacao[];
}

interface ParcelamentoAtivo {
  id: string;
  descricao: string;
  categoria: string;
  valorTotal: number;
  valorParcela: number;
  parcelasTotal: number;
  parcelaAtual: number;
  parcelasRestantes: number;
  dataInicio: Date;
  dataFim: Date;
  quemGastou: string;
}

const RelatorioParcelamentos = ({ transacoes }: RelatorioParcelamentosProps) => {
  // Filtrar transações parceladas (parcelas > 1) e calcular parcelamentos ativos
  const parcelamentosAtivos: ParcelamentoAtivo[] = transacoes
    .filter(t => t.parcelas > 1 && t.tipo === "despesa" && !t.isParcela)
    .map(t => {
      const dataInicio = new Date(t.data);
      const dataFim = addMonths(dataInicio, t.parcelas - 1);
      const hoje = new Date();
      
      // Calcular parcela atual baseado na diferença de meses
      const mesesPassados = (hoje.getFullYear() - dataInicio.getFullYear()) * 12 + 
                           (hoje.getMonth() - dataInicio.getMonth());
      const parcelaAtual = Math.min(Math.max(1, mesesPassados + 1), t.parcelas);
      const parcelasRestantes = t.parcelas - parcelaAtual;
      
      return {
        id: t.id,
        descricao: t.descricao || t.categoria,
        categoria: t.categoria,
        valorTotal: Math.abs(t.valor) * t.parcelas,
        valorParcela: Math.abs(t.valor),
        parcelasTotal: t.parcelas,
        parcelaAtual,
        parcelasRestantes,
        dataInicio,
        dataFim,
        quemGastou: t.quemGastou
      };
    })
    .filter(p => p.parcelasRestantes >= 0)
    .sort((a, b) => a.parcelasRestantes - b.parcelasRestantes);

  // Calcular totais
  const totalCompromissoMensal = parcelamentosAtivos.reduce((acc, p) => acc + p.valorParcela, 0);
  const totalDividaRestante = parcelamentosAtivos.reduce((acc, p) => acc + (p.valorParcela * p.parcelasRestantes), 0);
  const totalParcelamentos = parcelamentosAtivos.length;

  // Agrupar por quem gastou
  const porPessoa = parcelamentosAtivos.reduce((acc, p) => {
    if (!acc[p.quemGastou]) acc[p.quemGastou] = { total: 0, quantidade: 0 };
    acc[p.quemGastou].total += p.valorParcela;
    acc[p.quemGastou].quantidade += 1;
    return acc;
  }, {} as Record<string, { total: number; quantidade: number }>);

  // Encontrar parcelamentos que terminam em breve (próximos 3 meses)
  const hoje = new Date();
  const proximosTresMeses = addMonths(hoje, 3);
  const terminandoEmBreve = parcelamentosAtivos.filter(p => p.dataFim <= proximosTresMeses);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Relatório de Parcelamentos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cards de resumo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="text-sm text-muted-foreground">Parcelamentos Ativos</div>
            <div className="text-2xl font-bold">{totalParcelamentos}</div>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="text-sm text-muted-foreground">Compromisso Mensal</div>
            <div className="text-2xl font-bold text-amber-600">{formatarMoeda(totalCompromissoMensal)}</div>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="text-sm text-muted-foreground">Dívida Restante</div>
            <div className="text-2xl font-bold text-red-600">{formatarMoeda(totalDividaRestante)}</div>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="text-sm text-muted-foreground">Terminam em Breve</div>
            <div className="text-2xl font-bold text-green-600">{terminandoEmBreve.length}</div>
          </div>
        </div>

        {/* Distribuição por pessoa */}
        {Object.keys(porPessoa).length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Distribuição por Pessoa</div>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(porPessoa).map(([pessoa, dados]) => (
                <div key={pessoa} className="p-3 rounded-lg border">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{pessoa}</span>
                    <Badge variant="outline">{dados.quantidade} parcelamentos</Badge>
                  </div>
                  <div className="text-lg font-bold text-primary mt-1">
                    {formatarMoeda(dados.total)}/mês
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lista de parcelamentos */}
        <div className="space-y-3">
          <div className="text-sm font-medium">Parcelamentos Ativos</div>
          
          {parcelamentosAtivos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum parcelamento ativo no momento
            </div>
          ) : (
            <div className="space-y-3">
              {parcelamentosAtivos.map(p => (
                <div key={p.id} className="p-4 rounded-lg border space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{p.descricao}</div>
                      <div className="text-sm text-muted-foreground">{p.categoria}</div>
                    </div>
                    <Badge variant={p.parcelasRestantes <= 2 ? "default" : "secondary"}>
                      {p.parcelaAtual}/{p.parcelasTotal}
                    </Badge>
                  </div>
                  
                  <Progress 
                    value={(p.parcelaAtual / p.parcelasTotal) * 100} 
                    className="h-2"
                  />
                  
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {p.parcelasRestantes} parcelas restantes
                    </div>
                    <div className="font-medium">{formatarMoeda(p.valorParcela)}/mês</div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Início: {format(p.dataInicio, "MMM/yy", { locale: ptBR })}</span>
                    <span>Fim: {format(p.dataFim, "MMM/yy", { locale: ptBR })}</span>
                    <span>Total: {formatarMoeda(p.valorTotal)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alerta para parcelamentos terminando */}
        {terminandoEmBreve.length > 0 && (
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <div className="flex items-center gap-2 text-green-700 font-medium">
              <TrendingUp className="h-4 w-4" />
              {terminandoEmBreve.length} parcelamento(s) terminam nos próximos 3 meses
            </div>
            <div className="text-sm text-green-600 mt-1">
              Você liberará {formatarMoeda(terminandoEmBreve.reduce((acc, p) => acc + p.valorParcela, 0))}/mês
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RelatorioParcelamentos;
