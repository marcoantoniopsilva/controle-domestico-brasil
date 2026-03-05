import {
  Utensils,
  Baby,
  Home,
  ShoppingBag,
  CreditCard,
  Banknote,
  Car,
  Pill,
  Cat,
  Gamepad2,
  HelpCircle,
  Wifi,
  ShoppingCart,
  Stethoscope,
  Briefcase,
  TrendingUp,
  RotateCcw,
  Gift,
  BarChart3,
  PiggyBank,
  Landmark,
  Bitcoin,
  Heart,
  User,
  AlertTriangle,
  LucideIcon,
} from "lucide-react";

// Mapeamento de categorias para ícones
export const categoryIcons: Record<string, LucideIcon> = {
  // Despesas
  "Aplicativos e restaurantes": Utensils,
  "Atividades Aurora": Baby,
  "Casa": Home,
  "Compras da Bruna": ShoppingBag,
  "Compras do Marco": ShoppingBag,
  "Compras parceladas Bruna": CreditCard,
  "Compras parceladas Marco": CreditCard,
  "Despesas fixas no dinheiro": Banknote,
  "Estacionamento": Car,
  "Farmácia": Pill,
  "Recarga carro": Car,
  "Gato": Cat,
  "Lazer": Gamepad2,
  "Outros": HelpCircle,
  "Serviços de internet": Wifi,
  "Supermercado": ShoppingCart,
  "Seguro e manutenção": Car,
  "Uber": Car,
  
  // Receitas
  "Salário": Briefcase,
  "Rendimentos": TrendingUp,
  "Reembolso": RotateCcw,
  "Receita Extra": Gift,
  
  // Investimentos
  "Ações": BarChart3,
  "Fundos": BarChart3,
  "Tesouro Direto": Landmark,
  "Poupança": PiggyBank,
  "Crypto": Bitcoin,
  
  // Grupos
  "Alimentação": Utensils,
  "Deslocamento": Car,
  "Saúde": Heart,
  "Aurora": Baby,
  "Pessoais": User,
  "Essenciais": Home,
  "Extraordinários": AlertTriangle,
};
export const getCategoryIcon = (categoryName: string): LucideIcon => {
  return categoryIcons[categoryName] || HelpCircle;
};
