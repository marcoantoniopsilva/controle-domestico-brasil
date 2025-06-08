
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ValueInputProps {
  valor: string;
  onValorChange: (valor: string) => void;
}

const ValueInput: React.FC<ValueInputProps> = ({ valor, onValorChange }) => {
  // Função para formatar o valor como moeda brasileira
  const formatarValorMoeda = (valor: string) => {
    // Remove todos os caracteres não numéricos exceto vírgula e ponto
    let valorLimpo = valor.replace(/[^\d,\.]/g, '');
    
    // Se o valor já contém vírgula ou ponto, trata como valor já formatado
    if (valorLimpo.includes(',') || valorLimpo.includes('.')) {
      // Substitui vírgula por ponto para processamento
      valorLimpo = valorLimpo.replace(',', '.');
      
      // Converte para número
      const valorNumerico = parseFloat(valorLimpo);
      
      if (isNaN(valorNumerico)) {
        return '0,00';
      }
      
      // Formata o número como moeda brasileira
      return valorNumerico.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    } else {
      // Se não contém vírgula/ponto, trata como centavos (comportamento original)
      const apenasNumeros = valorLimpo;
      const valorNumerico = parseInt(apenasNumeros || '0', 10) / 100;
      
      return valorNumerico.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
  };

  // Manipula a mudança no input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorDigitado = e.target.value;
    const valorFormatado = formatarValorMoeda(valorDigitado);
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
