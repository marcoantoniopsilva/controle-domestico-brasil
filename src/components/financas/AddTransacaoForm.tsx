
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransacaoForm } from "@/hooks/useTransacaoForm";
import { Transacao } from "@/types";
import DateSelector from "./form/DateSelector";
import TypeSelector from "./form/TypeSelector";
import CategorySelector from "./form/CategorySelector";
import ValueInput from "./form/ValueInput";
import ParcelasSelector from "./form/ParcelasSelector";
import DescriptionInput from "./form/DescriptionInput";
import GanhosInput from "./form/GanhosInput";

interface AddTransacaoFormProps {
  onAddTransacao: (transacao: Omit<Transacao, "id">) => Promise<boolean>;
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
    ganhos,
    setGanhos,
    handleTipoChange,
    isSubmitting,
    categoriasFiltradas,
    handleSubmit,
  } = useTransacaoForm({ onAddTransacao });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adicionar Nova Transação</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DateSelector date={data} onDateChange={setData} />
            <TypeSelector tipo={tipo} onTipoChange={handleTipoChange} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CategorySelector
              categoria={categoria}
              onCategoriaChange={setCategoria}
              categoriasFiltradas={categoriasFiltradas}
            />
            <ValueInput valor={valor} onValorChange={setValor} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ParcelasSelector parcelas={parcelas} onParcelasChange={setParcelas} />
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

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Adicionando..." : "Adicionar Transação"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddTransacaoForm;
