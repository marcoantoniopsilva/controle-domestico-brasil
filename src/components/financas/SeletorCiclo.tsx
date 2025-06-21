
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

  // Este useEffect inicializa o ciclo selecionado quando o componente é montado
  useEffect(() => {
    if (ciclosDisponiveis.length > 0) {
      const cicloAtualIndex = ciclosDisponiveis.findIndex(c => 
        c.inicio.getMonth() === cicloAtual.inicio.getMonth() && 
        c.inicio.getFullYear() === cicloAtual.inicio.getFullYear()
      );
      
      if (cicloAtualIndex !== -1) {
        console.log("[SeletorCiclo] Inicializando com ciclo atual:", cicloAtualIndex, ciclosDisponiveis[cicloAtualIndex].nome);
        setCicloSelecionado(cicloAtualIndex.toString());
        
        // Propagar a mudança inicial para o componente pai
        const cicloInicial = ciclosDisponiveis[cicloAtualIndex];
        const cicloCopy = {
          inicio: new Date(cicloInicial.inicio),
          fim: new Date(cicloInicial.fim),
          nome: cicloInicial.nome
        };
        onCicloChange(cicloCopy);
      }
    }
  }, [ciclosDisponiveis, cicloAtual, onCicloChange]);

  const handleCicloChange = (value: string) => {
    console.log("[SeletorCiclo] Alterando para o índice:", value);
    
    // Atualiza imediatamente o estado local para refletir a seleção na UI
    setCicloSelecionado(value);
    
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
      
      // Propaga a alteração para o componente pai
      onCicloChange(cicloCopy);
    }
  };

  const handleCicloAtual = () => {
    console.log("[SeletorCiclo] Botão 'Ciclo Atual' clicado");
    
    const cicloAtualIndex = ciclosDisponiveis.findIndex(c => 
      c.inicio.getMonth() === cicloAtual.inicio.getMonth() && 
      c.inicio.getFullYear() === cicloAtual.inicio.getFullYear()
    );
    
    if (cicloAtualIndex !== -1) {
      console.log("[SeletorCiclo] Selecionando ciclo atual no índice:", cicloAtualIndex);
      handleCicloChange(cicloAtualIndex.toString());
    }
  };

  // Função para navegar para o ciclo anterior
  const handleCicloAnterior = () => {
    const currentIndex = Number(cicloSelecionado);
    console.log("[SeletorCiclo] Navegando para ciclo anterior. Índice atual:", currentIndex);
    
    if (currentIndex > 0) {
      const novoIndex = currentIndex - 1;
      console.log("[SeletorCiclo] Novo índice anterior:", novoIndex);
      handleCicloChange(novoIndex.toString());
    } else {
      console.log("[SeletorCiclo] Já está no primeiro ciclo disponível");
    }
  };

  // Função para navegar para o próximo ciclo
  const handleProximoCiclo = () => {
    const currentIndex = Number(cicloSelecionado);
    console.log("[SeletorCiclo] Navegando para próximo ciclo. Índice atual:", currentIndex);
    
    if (currentIndex >= 0 && currentIndex < ciclosDisponiveis.length - 1) {
      const novoIndex = currentIndex + 1;
      console.log("[SeletorCiclo] Novo índice próximo:", novoIndex);
      handleCicloChange(novoIndex.toString());
    } else {
      console.log("[SeletorCiclo] Já está no último ciclo disponível");
    }
  };

  console.log("[SeletorCiclo] Renderizando com cicloSelecionado:", cicloSelecionado);
  console.log("[SeletorCiclo] Total de ciclos:", ciclosDisponiveis.length);

  return (
    <div className="flex items-center gap-2">
      <CicloAtualButton onCicloAtual={handleCicloAtual} />
      <CicloSelector 
        ciclosDisponiveis={ciclosDisponiveis}
        cicloSelecionado={cicloSelecionado}
        onCicloChange={handleCicloChange}
        onCicloAnterior={handleCicloAnterior}
        onProximoCiclo={handleProximoCiclo}
      />
    </div>
  );
};

export default SeletorCiclo;
