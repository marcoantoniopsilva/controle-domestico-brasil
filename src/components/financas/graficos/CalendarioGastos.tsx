import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transacao, CicloFinanceiro } from "@/types";
import { formatarMoeda } from "@/utils/financas";
import { CalendarDays } from "lucide-react";
import { eachDayOfInterval, format, isToday, isFuture } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";

interface CalendarioGastosProps {
  transacoes: Transacao[];
  ciclo: CicloFinanceiro;
}

const CalendarioGastos = ({ transacoes, ciclo }: CalendarioGastosProps) => {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const hoje = new Date();

  const dias = eachDayOfInterval({
    start: new Date(ciclo.inicio),
    end: new Date(ciclo.fim),
  });

  // Calculate daily spending
  const gastosDiarios = dias.map(dia => {
    const diaStr = format(dia, "yyyy-MM-dd");
    const gastos = transacoes
      .filter(t => {
        const dt = new Date(t.data);
        return format(dt, "yyyy-MM-dd") === diaStr && t.tipo === "despesa";
      })
      .reduce((acc, t) => acc + Math.abs(t.valor), 0);

    return { dia, diaStr, gastos, futuro: isFuture(dia), hoje: isToday(dia) };
  });

  const maxGasto = Math.max(...gastosDiarios.map(d => d.gastos), 1);

  // Get intensity class (0-4 scale)
  const getIntensity = (gastos: number): number => {
    if (gastos === 0) return 0;
    const ratio = gastos / maxGasto;
    if (ratio < 0.25) return 1;
    if (ratio < 0.5) return 2;
    if (ratio < 0.75) return 3;
    return 4;
  };

  const intensityColors = [
    "bg-muted",
    "bg-emerald-200",
    "bg-amber-300",
    "bg-orange-400",
    "bg-red-500",
  ];

  const selectedDayData = selectedDay
    ? gastosDiarios.find(d => d.diaStr === selectedDay)
    : null;

  const selectedDayTransacoes = selectedDay
    ? transacoes.filter(t => {
        const dt = new Date(t.data);
        return format(dt, "yyyy-MM-dd") === selectedDay && t.tipo === "despesa";
      })
    : [];

  // Group days by week
  const firstDay = dias[0];
  const startDow = firstDay.getDay(); // 0=Sun

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="h-5 w-5 text-primary" />
          Calendário de Gastos
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Intensidade de gastos por dia do ciclo
        </p>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex items-center gap-1.5 mb-4 text-xs text-muted-foreground">
          <span>Menos</span>
          {intensityColors.map((color, i) => (
            <div key={i} className={`w-4 h-4 rounded-sm ${color}`} />
          ))}
          <span>Mais</span>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {["D", "S", "T", "Q", "Q", "S", "S"].map((day, i) => (
            <div key={i} className="text-[10px] text-center text-muted-foreground font-medium">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for alignment */}
          {Array.from({ length: startDow }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {gastosDiarios.map((d) => {
            const intensity = d.futuro ? -1 : getIntensity(d.gastos);
            const isSelected = d.diaStr === selectedDay;

            return (
              <button
                key={d.diaStr}
                onClick={() => setSelectedDay(isSelected ? null : d.diaStr)}
                className={`
                  aspect-square rounded-sm flex items-center justify-center text-[10px] font-medium
                  transition-all duration-200 relative
                  ${d.futuro ? "bg-muted/40 text-muted-foreground/30 cursor-default" : "cursor-pointer hover:ring-2 hover:ring-primary/30"}
                  ${isSelected ? "ring-2 ring-primary shadow-md scale-110" : ""}
                  ${d.hoje ? "ring-1 ring-primary/50" : ""}
                  ${!d.futuro ? intensityColors[intensity] : ""}
                  ${intensity >= 3 ? "text-white" : "text-foreground"}
                `}
              >
                {format(d.dia, "d")}
              </button>
            );
          })}
        </div>

        {/* Selected day details */}
        {selectedDayData && (
          <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold">
                {format(selectedDayData.dia, "dd 'de' MMMM", { locale: ptBR })}
              </span>
              <span className="text-sm font-bold text-destructive">
                {formatarMoeda(selectedDayData.gastos)}
              </span>
            </div>
            {selectedDayTransacoes.length > 0 ? (
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {selectedDayTransacoes.map((t) => (
                  <div key={t.id} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">{t.categoria}</span>
                      {t.descricao && (
                        <span className="text-muted-foreground/70">· {t.descricao}</span>
                      )}
                    </div>
                    <span className="font-medium">{formatarMoeda(Math.abs(t.valor))}</span>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">Nenhum gasto neste dia</span>
            )}
          </div>
        )}

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {(() => {
            const diasComGasto = gastosDiarios.filter(d => d.gastos > 0 && !d.futuro);
            const diasSemGasto = gastosDiarios.filter(d => d.gastos === 0 && !d.futuro);
            const mediaDiaria = diasComGasto.length > 0
              ? diasComGasto.reduce((acc, d) => acc + d.gastos, 0) / diasComGasto.length
              : 0;
            const diaRecorde = gastosDiarios.reduce((max, d) => d.gastos > max.gastos ? d : max, gastosDiarios[0]);

            return (
              <>
                <div className="text-center p-2 rounded-lg bg-muted/30">
                  <div className="text-lg font-bold text-primary">{diasSemGasto.length}</div>
                  <div className="text-[10px] text-muted-foreground">Dias sem gastos</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-muted/30">
                  <div className="text-lg font-bold">{formatarMoeda(mediaDiaria)}</div>
                  <div className="text-[10px] text-muted-foreground">Média/dia gasto</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-muted/30">
                  <div className="text-lg font-bold text-destructive">{formatarMoeda(diaRecorde.gastos)}</div>
                  <div className="text-[10px] text-muted-foreground">
                    Recorde ({format(diaRecorde.dia, "dd/MM")})
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarioGastos;
