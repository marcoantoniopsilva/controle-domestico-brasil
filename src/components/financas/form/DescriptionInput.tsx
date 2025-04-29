
import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface DescriptionInputProps {
  descricao: string;
  onDescricaoChange: (descricao: string) => void;
  isObrigatorio: boolean;
  categoria: string;
}

const DescriptionInput: React.FC<DescriptionInputProps> = ({ 
  descricao, 
  onDescricaoChange,
  isObrigatorio,
  categoria
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="descricao">
        Descrição (opcional{categoria === "Outros" ? ", mas obrigatória para categoria 'Outros'" : ""})
      </Label>
      <Textarea
        id="descricao"
        placeholder="Descreva detalhes sobre esta transação"
        value={descricao}
        onChange={(e) => onDescricaoChange(e.target.value)}
      />
    </div>
  );
};

export default DescriptionInput;
