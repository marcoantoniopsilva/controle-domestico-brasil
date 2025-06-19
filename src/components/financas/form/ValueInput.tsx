
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ValueInputProps {
  valor: string;
  onValorChange: (valor: string) => void;
}

const ValueInput: React.FC<ValueInputProps> = ({ valor, onValorChange }) => {
  // Função simplificada para formatar o valor
  const formatarValor = (input: string): string => {
    // Remove tudo exceto números
    const apenasNumeros = input.replace(/\D/g, '');
    
    if (!apenasNumeros) return '';
    
    // Converte para número (centavos)
    const valorEmCentavos = parseInt(apenasNumeros, 10);
    const valorEmReais = valorEmCentavos / 100;
    
    // Formata como moeda brasileira
    return valorEmReais.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const valorFormatado = formatarValor(inputValue);
    onValorChange(valorFormatado);
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
