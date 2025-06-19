
import React from "react";
import { Button } from "@/components/ui/button";
import { Transacao } from "@/types";
import { useTransacaoForm } from "./form/useTransacaoForm";
import DateSelector from "./form/DateSelector";
import TypeSelector from "./form/TypeSelector";
import CategorySelector from "./form/CategorySelector";
import ValueInput from "./form/ValueInput";
import ParcelasSelector from "./form/ParcelasSelector";
import DescriptionInput from "./form/DescriptionInput";

interface EditTransacaoFormProps {
  transacao: Transacao;
  onSalvar: (transacao: Omit<Transacao, "id">) => Promise<void>;
  onCancelar: () => void;
}

const EditTransacaoForm: React.FC<EditTransacaoFormProps> = ({ 
  transacao, 
  onSalvar,
  onCancelar 
}) => {
  console.log(`[EditTransacaoForm] Data da transação: ${transacao.data.toDateString()}`);

  const {
    data,
    setData,
    categoria,
    setCategoria,
    valor,
    setValor,
    parcelas,
    setParcelas,
    descricao,
    setDescricao,
    tipo,
    handleTipoChange,
    isSubmitting,
    categoriasFiltradas,
    handleSubmit
  } = useTransacaoForm({ 
    onAddTransacao: onSalvar,
    initialValues: {
      ...transacao,
      valor: Math.abs(transacao.valor) // Pass the numeric value, not formatted string
    },
    isEditing: true
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/2">
          <DateSelector 
            date={data} 
            onDateChange={setData} 
          />
        </div>
        
        <div className="w-full md:w-1/2">
          <TypeSelector 
            tipo={tipo} 
            onTipoChange={handleTipoChange} 
          />
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/2">
          <CategorySelector 
            categoria={categoria} 
            onCategoriaChange={setCategoria} 
            categoriasFiltradas={categoriasFiltradas} 
          />
        </div>
        
        <div className="w-full md:w-1/2">
          <ValueInput 
            valor={valor} 
            onValorChange={setValor} 
          />
        </div>
      </div>
      
      <ParcelasSelector 
        parcelas={parcelas} 
        onParcelasChange={setParcelas} 
      />
      
      <DescriptionInput 
        descricao={descricao} 
        onDescricaoChange={setDescricao}
        isObrigatorio={categoria === "Outros"}
        categoria={categoria}
      />
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>
    </form>
  );
};

export default EditTransacaoForm;
