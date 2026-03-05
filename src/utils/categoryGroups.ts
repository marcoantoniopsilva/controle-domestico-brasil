import {
  Utensils,
  Car,
  Heart,
  Baby,
  User,
  Home,
  AlertTriangle,
  LucideIcon,
} from "lucide-react";

export interface CategoryGroup {
  nome: string;
  icon: LucideIcon;
  categorias: string[];
}

export const categoryGroups: CategoryGroup[] = [
  {
    nome: "Alimentação",
    icon: Utensils,
    categorias: ["Aplicativos e restaurantes", "Supermercado"],
  },
  {
    nome: "Deslocamento",
    icon: Car,
    categorias: ["Seguro e manutenção", "Uber", "Recarga carro", "Estacionamento"],
  },
  {
    nome: "Saúde",
    icon: Heart,
    categorias: ["Farmácia", "Saúde"],
  },
  {
    nome: "Aurora",
    icon: Baby,
    categorias: ["Atividades Aurora", "Fórmula e leite Aurora", "Presentes/roupas Aurora"],
  },
  {
    nome: "Pessoais",
    icon: User,
    categorias: ["Lazer", "Compras da Bruna", "Compras do Marco", "Compras parceladas Bruna", "Compras parceladas Marco"],
  },
  {
    nome: "Essenciais",
    icon: Home,
    categorias: ["Casa", "Serviços de internet", "Academia", "Gato"],
  },
  {
    nome: "Extraordinários",
    icon: AlertTriangle,
    categorias: ["Gastos extraordinários", "Viagens", "Impostos, taxas e multas", "Outros"],
  },
];
