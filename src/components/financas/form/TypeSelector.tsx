
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TypeSelectorProps {
  tipo: "despesa" | "receita";
  onTipoChange: (tipo: "despesa" | "receita") => void;
}

const TypeSelector: React.FC<TypeSelectorProps> = ({ tipo, onTipoChange }) => {
  return (
    <div className="w-full space-y-2">
      <Label htmlFor="tipo">Tipo</Label>
      <Select 
        value={tipo} 
        onValueChange={(value) => onTipoChange(value as "despesa" | "receita")}
      >
        <SelectTrigger id="tipo">
          <SelectValue placeholder="Selecione o tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="despesa">Despesa</SelectItem>
          <SelectItem value="receita">Receita</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default TypeSelector;
