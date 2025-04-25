
import { useState, useEffect } from "react";
import { CicloFinanceiro } from "@/types";
import { useCiclos } from "@/hooks/useCiclos";
import CicloAtualButton from "./CicloAtualButton";
import CicloSelector from "./CicloSelector";

interface SeletorCicloProps {
  onCicloChange: (ciclo: CicloFinanceiro) => void;
}

const SeletorCiclo: React.FC<SeletorCicloProps> = ({ onCicloChange }) => {
  const { ciclosDisponiveis, cicloAtual } = useCiclos();
  const [cicloSelecionado, setCicloSelecionado] = useState<string>("");

  useEffect(() => {
    if (ciclosDisponiveis.length > 0) {
      const cicloAtualIndex = ciclosDisponiveis.findIndex(c => 
        c.inicio.getMonth() === cicloAtual.inicio.getMonth() && 
        c.inicio.getFullYear() === cicloAtual.inicio.getFullYear()
      );
      
      if (cicloAtualIndex !== -1) {
        setCicloSelecionado(cicloAtualIndex.toString());
      }
    }
  }, [ciclosDisponiveis, cicloAtual]);

  const handleCicloChange = (value: string) => {
    const index = Number(value);
    if (index >= 0 && index < ciclosDisponiveis.length) {
      const ciclo = ciclosDisponiveis[index];
      console.log("[SeletorCiclo] Selecionando ciclo:", ciclo.nome);
      console.log("[SeletorCiclo] Data início:", ciclo.inicio.toISOString());
      console.log("[SeletorCiclo] Data fim:", ciclo.fim.toISOString());
      
      const cicloCopy = {
        inicio: new Date(ciclo.inicio),
        fim: new Date(ciclo.fim),
        nome: ciclo.nome
      };
      
      setCicloSelecionado(value);
      onCicloChange(cicloCopy);
    }
  };

  const handleCicloAtual = () => {
    console.log("[SeletorCiclo] Botão 'Ciclo Atual' clicado");
    const novoCiclo = {
      inicio: new Date(cicloAtual.inicio),
      fim: new Date(cicloAtual.fim),
      nome: cicloAtual.nome
    };
    
    const cicloAtualIndex = ciclosDisponiveis.findIndex(c => 
      c.inicio.getMonth() === cicloAtual.inicio.getMonth() && 
      c.inicio.getFullYear() === cicloAtual.inicio.getFullYear()
    );
    
    if (cicloAtualIndex !== -1) {
      setCicloSelecionado(cicloAtualIndex.toString());
    }
    
    onCicloChange(novoCiclo);
  };

  return (
    <div className="flex items-center gap-4">
      <CicloAtualButton onCicloAtual={handleCicloAtual} />
      <CicloSelector 
        ciclosDisponiveis={ciclosDisponiveis}
        cicloSelecionado={cicloSelecionado}
        onCicloChange={handleCicloChange}
      />
    </div>
  );
};

export default SeletorCiclo;
