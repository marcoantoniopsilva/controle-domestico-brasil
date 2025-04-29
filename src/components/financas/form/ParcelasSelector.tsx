
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ParcelasSelectorProps {
  parcelas: string;
  onParcelasChange: (parcelas: string) => void;
}

const ParcelasSelector: React.FC<ParcelasSelectorProps> = ({ parcelas, onParcelasChange }) => {
  return (
    <div className="w-full space-y-2">
      <Label htmlFor="parcelas">Parcelas (1-12)</Label>
      <Select value={parcelas} onValueChange={onParcelasChange}>
        <SelectTrigger id="parcelas">
          <SelectValue placeholder="Selecione o número de parcelas" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
            <SelectItem key={num} value={num.toString()}>
              {num} {num === 1 ? "parcela" : "parcelas"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ParcelasSelector;
