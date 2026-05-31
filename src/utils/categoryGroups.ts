import type { LucideIcon } from "lucide-react";

export interface CategoryGroup {
  id?: string;
  nome: string;
  icon: LucideIcon;
  categorias: string[];
}

