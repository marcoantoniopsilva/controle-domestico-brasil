
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuRadioGroup, 
  DropdownMenuRadioItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ChevronDown, ChevronUp } from "lucide-react";
import { CicloFinanceiro } from "@/types";

interface CicloSelectorProps {
  ciclosDisponiveis: CicloFinanceiro[];
  cicloSelecionado: string;
  onCicloChange: (value: string) => void;
  onCicloAnterior: () => void;
  onProximoCiclo: () => void;
}

const CicloSelector: React.FC<CicloSelectorProps> = ({
  ciclosDisponiveis,
  cicloSelecionado,
  onCicloChange,
  onCicloAnterior,
  onProximoCiclo
}) => {
  // Determina o texto a ser exibido no botão baseado no ciclo selecionado
  const selectedIndex = cicloSelecionado !== "" ? Number(cicloSelecionado) : -1;
  
  // Garante que o índice é válido antes de usar
  const isValidIndex = selectedIndex >= 0 && selectedIndex < ciclosDisponiveis.length;
  const displayText = isValidIndex 
    ? ciclosDisponiveis[selectedIndex].nome 
    : "Selecione o ciclo";
    
  // Verificar se pode navegar para ciclos anterior/posterior baseado no índice selecionado
  const canGoPrevious = selectedIndex > 0;
  const canGoNext = selectedIndex >= 0 && selectedIndex < ciclosDisponiveis.length - 1;
    
  console.log("[CicloSelector] Renderizando com ciclo selecionado:", cicloSelecionado);
  console.log("[CicloSelector] Índice selecionado:", selectedIndex);
  console.log("[CicloSelector] É índice válido:", isValidIndex);
  console.log("[CicloSelector] Nome do ciclo exibido:", displayText);
  console.log("[CicloSelector] Total de ciclos disponíveis:", ciclosDisponiveis.length);
  console.log("[CicloSelector] Pode ir anterior:", canGoPrevious, "Pode ir próximo:", canGoNext);

  return (
    <div className="flex items-center gap-0.5 md:gap-1">
      {/* Botão para ciclo anterior */}
      <Button
        variant="outline"
        size="icon"
        onClick={onCicloAnterior}
        disabled={!canGoPrevious}
        className="h-8 w-8 md:h-10 md:w-10"
      >
        <ChevronUp className="h-3 w-3 md:h-4 md:w-4" />
      </Button>

      {/* Seletor de ciclo principal */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="min-w-[120px] md:min-w-[200px] justify-between text-xs md:text-sm px-2 md:px-4 h-8 md:h-10">
            <span className="truncate max-w-[100px] md:max-w-[180px]">{displayText}</span>
            <ChevronDown className="h-3 w-3 md:h-4 md:w-4 opacity-50 ml-1 flex-shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[250px] md:w-[300px] max-h-[400px] overflow-y-auto bg-white border border-gray-200 shadow-lg z-50">
          <DropdownMenuRadioGroup value={cicloSelecionado} onValueChange={onCicloChange}>
            {ciclosDisponiveis.map((ciclo, index) => (
              <DropdownMenuRadioItem key={index} value={index.toString()} className="cursor-pointer text-sm">
                {ciclo.nome}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Botão para próximo ciclo */}
      <Button
        variant="outline"
        size="icon"
        onClick={onProximoCiclo}
        disabled={!canGoNext}
        className="h-8 w-8 md:h-10 md:w-10"
      >
        <ChevronDown className="h-3 w-3 md:h-4 md:w-4" />
      </Button>
    </div>
  );
};

export default CicloSelector;
