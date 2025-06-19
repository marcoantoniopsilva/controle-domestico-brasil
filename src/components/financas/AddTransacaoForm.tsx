
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

interface AddTransacaoFormProps {
  onAddTransacao: (transacao: Omit<Transacao, "id">) => void;
}

const AddTransacaoForm: React.FC<AddTransacaoFormProps> = ({ onAddTransacao }) => {
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
  } = useTransacaoForm({ onAddTransacao });

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
      
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Adicionando..." : `Adicionar ${tipo === "despesa" ? "Despesa" : "Receita"}`}
      </Button>
    </form>
  );
};

export default AddTransacaoForm;
