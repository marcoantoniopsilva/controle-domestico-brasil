
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Categoria } from "@/types";

interface CategorySelectorProps {
  categoria: string;
  onCategoriaChange: (categoria: string) => void;
  categoriasFiltradas: Categoria[];
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ 
  categoria, 
  onCategoriaChange,
  categoriasFiltradas
}) => {
  return (
    <div className="w-full space-y-2">
      <Label htmlFor="categoria">Categoria</Label>
      <Select value={categoria} onValueChange={onCategoriaChange}>
        <SelectTrigger id="categoria">
          <SelectValue placeholder="Selecione uma categoria" />
        </SelectTrigger>
        <SelectContent>
          {categoriasFiltradas.map((cat) => (
            <SelectItem key={cat.nome} value={cat.nome}>
              {cat.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CategorySelector;
