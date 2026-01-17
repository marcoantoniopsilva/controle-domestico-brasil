import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Categoria } from "@/types";
import { getCategoryIcon } from "@/utils/categoryIcons";

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
  // Obtém o ícone da categoria selecionada para exibir no trigger
  const SelectedIcon = categoria ? getCategoryIcon(categoria) : null;
  
  return (
    <div className="w-full space-y-2">
      <Label htmlFor="categoria">Categoria</Label>
      <Select value={categoria} onValueChange={onCategoriaChange}>
        <SelectTrigger id="categoria" className="relative">
          <div className="flex items-center gap-2">
            {SelectedIcon && <SelectedIcon className="h-4 w-4 text-muted-foreground" />}
            <SelectValue placeholder="Selecione uma categoria" />
          </div>
        </SelectTrigger>
        <SelectContent 
          position="popper" 
          side="bottom"
          className="z-[99999] bg-popover border border-border"
        >
          {categoriasFiltradas.length === 0 ? (
            <SelectItem value="no-options" disabled>
              Nenhuma categoria encontrada
            </SelectItem>
          ) : (
            categoriasFiltradas.map((cat) => {
              const Icon = getCategoryIcon(cat.nome);
              return (
                <SelectItem key={cat.nome} value={cat.nome}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span>{cat.nome}</span>
                  </div>
                </SelectItem>
              );
            })
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CategorySelector;
