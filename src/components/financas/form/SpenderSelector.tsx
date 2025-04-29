
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SpenderSelectorProps {
  quemGastou: "Marco" | "Bruna";
  onQuemGastouChange: (quemGastou: "Marco" | "Bruna") => void;
}

const SpenderSelector: React.FC<SpenderSelectorProps> = ({ quemGastou, onQuemGastouChange }) => {
  return (
    <div className="w-full space-y-2">
      <Label htmlFor="quemGastou">Quem realizou</Label>
      <Select 
        value={quemGastou} 
        onValueChange={(value) => onQuemGastouChange(value as "Marco" | "Bruna")}
      >
        <SelectTrigger id="quemGastou">
          <SelectValue placeholder="Selecione quem realizou" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Marco">Marco</SelectItem>
          <SelectItem value="Bruna">Bruna</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default SpenderSelector;
