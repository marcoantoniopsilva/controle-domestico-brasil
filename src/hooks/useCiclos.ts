
import { useState, useEffect } from "react";
import { CicloFinanceiro } from "@/types";
import { calcularCicloAtual, DEFAULT_CYCLE_START_DAY } from "@/utils/financas";
import { format, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

export const useCiclos = (cycleStartDay: number = DEFAULT_CYCLE_START_DAY) => {
  const startDay = Math.max(1, Math.min(28, cycleStartDay || DEFAULT_CYCLE_START_DAY));
  const cicloAtual = calcularCicloAtual(startDay);
  const [ciclosDisponiveis, setCiclosDisponiveis] = useState<CicloFinanceiro[]>([]);
  
  useEffect(() => {
    const gerarCiclos = () => {
      const ciclos: CicloFinanceiro[] = [];
      const hoje = new Date();
      
      console.log("[useCiclos] Gerando ciclos disponíveis");
      
      // Verifica se já existe um ciclo com a mesma data
      const cicloJaExiste = (inicio: Date, ciclos: CicloFinanceiro[]): boolean => {
        return ciclos.some(c => 
          c.inicio.getMonth() === inicio.getMonth() && 
          c.inicio.getFullYear() === inicio.getFullYear()
        );
      };

      // Adiciona ciclos anteriores e posteriores
      for (let i = -12; i <= 12; i++) {
        const dataBase = addMonths(hoje, i);
        const inicio = new Date(dataBase.getFullYear(), dataBase.getMonth() - 1, startDay);
        const fim = new Date(dataBase.getFullYear(), dataBase.getMonth(), startDay - 1);
        
        // Verifica se este ciclo já existe antes de adicionar
        if (cicloJaExiste(inicio, ciclos)) {
          console.log(`[useCiclos] Pulando ciclo duplicado para ${format(inicio, 'MMMM yyyy', { locale: ptBR })}`);
          continue;
        }
        
        const nomeMesInicio = format(inicio, 'MMMM', { locale: ptBR });
        const nomeMesFim = format(fim, 'MMMM', { locale: ptBR });
        const anoInicio = format(inicio, 'yyyy');
        const anoFim = format(fim, 'yyyy');
        
        const nome = `${nomeMesInicio} ${anoInicio} - ${nomeMesFim} ${anoFim}`;
        
        ciclos.push({
          inicio: new Date(inicio),
          fim: new Date(fim),
          nome: nome
        });
      }

      ciclos.sort((a, b) => a.inicio.getTime() - b.inicio.getTime());
      
      console.log("[useCiclos] Total de ciclos disponíveis:", ciclos.length);
      return ciclos;
    };

    setCiclosDisponiveis(gerarCiclos());
  }, [startDay]);

  return {
    ciclosDisponiveis,
    cicloAtual
  };
};
