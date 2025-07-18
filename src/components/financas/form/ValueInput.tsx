
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ValueInputProps {
  valor: string;
  onValorChange: (valor: string) => void;
}

const ValueInput: React.FC<ValueInputProps> = ({ valor, onValorChange }) => {
  // Função para formatar o valor permitindo entrada direta em formato brasileiro
  const formatarValor = (input: string): string => {
    // Se já contém vírgula, assumir que é formato brasileiro (ex: 1281,33)
    if (input.includes(',')) {
      // Remove pontos (separadores de milhares) e mantém vírgula
      const valorLimpo = input.replace(/\./g, '');
      // Valida se está no formato correto (números, vírgula e 2 casas decimais)
      const regex = /^\d+,\d{0,2}$/;
      if (regex.test(valorLimpo)) {
        const partes = valorLimpo.split(',');
        const inteiro = parseInt(partes[0], 10);
        const decimal = partes[1] || '00';
        const decimalPadded = decimal.padEnd(2, '0');
        return inteiro.toLocaleString('pt-BR') + ',' + decimalPadded;
      }
      return input; // Retorna o input original se não estiver no formato correto
    }
    
    // Se não contém vírgula, tratar como centavos (comportamento atual)
    const apenasNumeros = input.replace(/\D/g, '');
    if (!apenasNumeros) return '';
    
    const valorEmCentavos = parseInt(apenasNumeros, 10);
    return (valorEmCentavos / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    console.log('[ValueInput] Input digitado:', inputValue);
    const valorFormatado = formatarValor(inputValue);
    console.log('[ValueInput] Valor formatado:', valorFormatado);
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
