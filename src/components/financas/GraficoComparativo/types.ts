
export interface DadosCiclo {
  ciclo: string;
  cicloCompleto: string;
  temLancamentos: boolean;
  [categoria: string]: string | number | boolean;
}
