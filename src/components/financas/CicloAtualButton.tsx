
import React from "react";
import { Button } from "@/components/ui/button";
import { CicloFinanceiro } from "@/types";

interface CicloAtualButtonProps {
  onCicloAtual: () => void;
}

const CicloAtualButton: React.FC<CicloAtualButtonProps> = ({ onCicloAtual }) => {
  return (
    <Button
      variant="outline"
      onClick={onCicloAtual}
    >
      Ciclo Atual
    </Button>
  );
};

export default CicloAtualButton;
