/**
 * Lógica de faturas de cartão de crédito.
 * - Dado um dia de fechamento F e uma data d:
 *   - se d.dia <= F → fatura "atual" cobre (mês anterior, F+1) até (mês atual, F)
 *   - caso contrário → fatura cobre (mês atual, F+1) até (mês seguinte, F)
 * - Vencimento: dia de vencimento do mês em que a fatura fecha. Se V < F,
 *   o vencimento cai no mês seguinte ao fechamento.
 */
export interface FaturaPeriodo {
  inicio: Date;
  fim: Date;
  vencimento: Date;
  label: string;
}

function clampDay(year: number, month: number, day: number): Date {
  // month é 0-indexed
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(day, lastDayOfMonth));
}

export function getFaturaPeriodo(
  diaFechamento: number,
  diaVencimento: number,
  refDate: Date = new Date()
): FaturaPeriodo {
  const refDay = refDate.getDate();
  const refMonth = refDate.getMonth();
  const refYear = refDate.getFullYear();

  let fimMonth: number, fimYear: number;
  if (refDay <= diaFechamento) {
    fimMonth = refMonth;
    fimYear = refYear;
  } else {
    fimMonth = refMonth + 1;
    fimYear = refYear;
    if (fimMonth > 11) {
      fimMonth = 0;
      fimYear += 1;
    }
  }

  const fim = clampDay(fimYear, fimMonth, diaFechamento);
  // início = dia seguinte ao fechamento anterior
  let inicioMonth = fimMonth - 1;
  let inicioYear = fimYear;
  if (inicioMonth < 0) {
    inicioMonth = 11;
    inicioYear -= 1;
  }
  const fechamentoAnterior = clampDay(inicioYear, inicioMonth, diaFechamento);
  const inicio = new Date(
    fechamentoAnterior.getFullYear(),
    fechamentoAnterior.getMonth(),
    fechamentoAnterior.getDate() + 1
  );

  // vencimento
  let vencMonth = fimMonth;
  let vencYear = fimYear;
  if (diaVencimento < diaFechamento) {
    vencMonth += 1;
    if (vencMonth > 11) {
      vencMonth = 0;
      vencYear += 1;
    }
  }
  const vencimento = clampDay(vencYear, vencMonth, diaVencimento);

  const meses = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez",
  ];
  const label = `Fatura ${meses[fim.getMonth()]}/${fim.getFullYear()}`;

  return { inicio, fim, vencimento, label };
}

export function getFaturasAnteriores(
  diaFechamento: number,
  diaVencimento: number,
  quantidade: number,
  refDate: Date = new Date()
): FaturaPeriodo[] {
  const resultado: FaturaPeriodo[] = [];
  const atual = getFaturaPeriodo(diaFechamento, diaVencimento, refDate);
  resultado.push(atual);
  let cursor = new Date(atual.inicio);
  cursor.setDate(cursor.getDate() - 1);
  for (let i = 0; i < quantidade - 1; i++) {
    const f = getFaturaPeriodo(diaFechamento, diaVencimento, cursor);
    resultado.push(f);
    cursor = new Date(f.inicio);
    cursor.setDate(cursor.getDate() - 1);
  }
  return resultado;
}

export function isDateInFatura(date: Date, fatura: FaturaPeriodo): boolean {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const i = new Date(fatura.inicio.getFullYear(), fatura.inicio.getMonth(), fatura.inicio.getDate()).getTime();
  const f = new Date(fatura.fim.getFullYear(), fatura.fim.getMonth(), fatura.fim.getDate()).getTime();
  return d >= i && d <= f;
}