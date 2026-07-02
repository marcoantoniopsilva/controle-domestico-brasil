import { FrequenciaRecorrencia } from "@/types";

/** Parse YYYY-MM-DD as local date to avoid timezone shifts. */
export function parseLocalDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

/**
 * Calcula a próxima data de execução a partir de uma data base.
 * - mensal: mesmo dia do mês seguinte (ou último dia se não existir)
 * - semanal: +7 dias
 * - anual: +1 ano (mesmo dia/mês)
 */
export function calcularProximaExecucao(
  atual: Date,
  frequencia: FrequenciaRecorrencia,
  diaMes?: number | null,
  diaSemana?: number | null,
  mesAno?: number | null,
): Date {
  const d = new Date(atual);
  if (frequencia === "semanal") {
    d.setDate(d.getDate() + 7);
    return d;
  }
  if (frequencia === "anual") {
    d.setFullYear(d.getFullYear() + 1);
    return d;
  }
  // mensal
  const alvoDia = diaMes || d.getDate();
  const proxMes = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  const ultimoDiaProx = new Date(proxMes.getFullYear(), proxMes.getMonth() + 1, 0).getDate();
  proxMes.setDate(Math.min(alvoDia, ultimoDiaProx));
  return proxMes;
}

export const FREQUENCIAS: { value: FrequenciaRecorrencia; label: string }[] = [
  { value: "mensal", label: "Mensal" },
  { value: "semanal", label: "Semanal" },
  { value: "anual", label: "Anual" },
];

export function descreverFrequencia(r: {
  frequencia: FrequenciaRecorrencia;
  diaMes?: number | null;
  diaSemana?: number | null;
  mesAno?: number | null;
}): string {
  if (r.frequencia === "mensal") return `Todo dia ${r.diaMes || "?"} do mês`;
  if (r.frequencia === "semanal") {
    const dias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    return `Toda ${dias[r.diaSemana ?? 1]}`;
  }
  return `Anualmente em ${String(r.diaMes || 1).padStart(2, "0")}/${String(r.mesAno || 1).padStart(2, "0")}`;
}