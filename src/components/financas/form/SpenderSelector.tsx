
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SpenderSelectorProps {
  quemGastou: string;
  onQuemGastouChange: (quemGastou: string) => void;
  opcoes: string[];
}

const SpenderSelector: React.FC<SpenderSelectorProps> = ({ quemGastou, onQuemGastouChange, opcoes }) => {
  const lista = opcoes && opcoes.length > 0 ? opcoes : ["Você"];
  return (
    <div className="w-full space-y-2">
      <Label htmlFor="quemGastou">Quem realizou</Label>
      <Select value={quemGastou || lista[0]} onValueChange={onQuemGastouChange}>
        <SelectTrigger id="quemGastou">
          <SelectValue placeholder="Selecione quem realizou" />
        </SelectTrigger>
        <SelectContent>
          {lista.map((nome) => (
            <SelectItem key={nome} value={nome}>{nome}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SpenderSelector;
