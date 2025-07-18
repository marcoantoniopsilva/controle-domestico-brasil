import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ValueInputProps {
  valor: string;
  onValorChange: (valor: string) => void;
}

const ValueInput: React.FC<ValueInputProps> = ({ valor, onValorChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;
    
    // Remove tudo exceto números e vírgula
    input = input.replace(/[^\d,]/g, '');
    
    // Permite apenas uma vírgula
    const parts = input.split(',');
    if (parts.length > 2) {
      input = parts[0] + ',' + parts[1];
    }
    
    // Limita a 2 casas decimais após a vírgula
    if (parts[1] && parts[1].length > 2) {
      input = parts[0] + ',' + parts[1].substring(0, 2);
    }
    
    console.log('[ValueInput] Valor digitado:', input);
    onValorChange(input);
  };

  return (
    <div className="w-full space-y-2">
      <Label htmlFor="valor">Valor (R$)</Label>
      <Input
        id="valor"
        type="text"
        placeholder="0,00"
        value={valor}
        onChange={handleChange}
      />
    </div>
  );
};

export default ValueInput;