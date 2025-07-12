
import React from "react";
import { Button } from "@/components/ui/button";
import { Transacao } from "@/types";
import { useTransacaoForm } from "@/hooks/useTransacaoForm";
import DateSelector from "./form/DateSelector";
import TypeSelector from "./form/TypeSelector";
import CategorySelector from "./form/CategorySelector";
import ValueInput from "./form/ValueInput";
import ParcelasSelector from "./form/ParcelasSelector";
import DescriptionInput from "./form/DescriptionInput";
import GanhosInput from "./form/GanhosInput";

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
    ganhos,
    setGanhos,
    handleTipoChange,
    isSubmitting,
    categoriasFiltradas,
    handleSubmit
  } = useTransacaoForm({ 
    onAddTransacao: async (transacao) => {
      await onSalvar(transacao);
      return true;
    },
    initialValues: transacao,
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ParcelasSelector 
          parcelas={parcelas} 
          onParcelasChange={setParcelas} 
        />
        {tipo === "investimento" && (
          <GanhosInput
            ganhos={ganhos}
            onGanhosChange={setGanhos}
            tipo={tipo}
          />
        )}
      </div>
      
      <DescriptionInput 
        descricao={descricao} 
        onDescricaoChange={setDescricao}
        isObrigatorio={categoria.includes("Outros") || categoria === "Outros"}
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
