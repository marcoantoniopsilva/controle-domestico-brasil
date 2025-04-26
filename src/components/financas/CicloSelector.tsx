
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuRadioGroup, 
  DropdownMenuRadioItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { CicloFinanceiro } from "@/types";

interface CicloSelectorProps {
  ciclosDisponiveis: CicloFinanceiro[];
  cicloSelecionado: string;
  onCicloChange: (value: string) => void;
}

const CicloSelector: React.FC<CicloSelectorProps> = ({
  ciclosDisponiveis,
  cicloSelecionado,
  onCicloChange
}) => {
  // Determina o texto a ser exibido no botão
  const displayText = cicloSelecionado !== "" && Number(cicloSelecionado) < ciclosDisponiveis.length
    ? ciclosDisponiveis[Number(cicloSelecionado)]?.nome
    : "Selecione o ciclo";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="min-w-[200px] justify-between">
          {displayText}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[300px] max-h-[400px] overflow-y-auto">
        <DropdownMenuRadioGroup value={cicloSelecionado} onValueChange={onCicloChange}>
          {ciclosDisponiveis.map((ciclo, index) => (
            <DropdownMenuRadioItem key={index} value={index.toString()} className="cursor-pointer">
              {ciclo.nome}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CicloSelector;
