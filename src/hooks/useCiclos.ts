
import { useState, useEffect } from "react";
import { CicloFinanceiro } from "@/types";
import { calcularCicloAtual } from "@/utils/financas";
import { format, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

export const useCiclos = () => {
  const cicloAtual = calcularCicloAtual();
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
      
      // Adiciona ciclo março-abril 2025 explicitamente
      const marcoAbril2025Inicio = new Date(2025, 2, 25);
      const marcoAbril2025Fim = new Date(2025, 3, 24);
      
      const marcoAbril2025 = {
        inicio: marcoAbril2025Inicio,
        fim: marcoAbril2025Fim,
        nome: `março 2025 - abril 2025`
      };
      
      ciclos.push(marcoAbril2025);
      
      console.log("[useCiclos] Ciclo março-abril 2025 adicionado explicitamente:", 
        "início:", marcoAbril2025Inicio.toISOString(), 
        "fim:", marcoAbril2025Fim.toISOString(),
        "nome:", marcoAbril2025.nome);

      // Adiciona ciclos anteriores e posteriores
      for (let i = -12; i <= 12; i++) {
        const dataBase = addMonths(hoje, i);
        const inicio = new Date(dataBase.getFullYear(), dataBase.getMonth() - 1, 25);
        const fim = new Date(dataBase.getFullYear(), dataBase.getMonth(), 24);
        
        // Pula o ciclo março-abril 2025 que já foi adicionado explicitamente
        if (inicio.getFullYear() === 2025 && inicio.getMonth() === 2) {
          console.log("[useCiclos] Pulando ciclo março-abril 2025 que já foi adicionado");
          continue;
        }
        
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
  }, []);

  return {
    ciclosDisponiveis,
    cicloAtual
  };
};
