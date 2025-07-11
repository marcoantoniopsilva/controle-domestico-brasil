
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface GanhosInputProps {
  ganhos: string;
  onGanhosChange: (ganhos: string) => void;
  tipo: "despesa" | "receita" | "investimento";
}

const GanhosInput: React.FC<GanhosInputProps> = ({ ganhos, onGanhosChange, tipo }) => {
  // Só mostra o campo de ganhos para investimentos
  if (tipo !== "investimento") {
    return null;
  }

  const formatarValor = (valor: string) => {
    // Remove tudo que não é número, vírgula ou ponto
    const valorLimpo = valor.replace(/[^\d,.-]/g, '');
    
    // Se está vazio, retorna vazio
    if (!valorLimpo) return '';
    
    // Converte vírgula para ponto para processamento
    const valorNumerico = parseFloat(valorLimpo.replace(',', '.'));
    
    if (isNaN(valorNumerico)) return '';
    
    // Formata como moeda brasileira
    return valorNumerico.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormatado = formatarValor(e.target.value);
    onGanhosChange(valorFormatado);
  };

  return (
    <div className="w-full space-y-2">
      <Label htmlFor="ganhos">Ganhos/Perdas (R$)</Label>
      <Input
        id="ganhos"
        type="text"
        placeholder="0,00"
        value={ganhos}
        onChange={handleChange}
        className="text-right"
        title="Informe os ganhos ou perdas deste investimento. Use valores negativos para perdas."
      />
      <p className="text-xs text-muted-foreground">
        Valores positivos para ganhos, negativos para perdas
      </p>
    </div>
  );
};

export default GanhosInput;
