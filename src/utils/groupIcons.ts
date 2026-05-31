import {
  Utensils, Car, Heart, Baby, User, Home, AlertTriangle,
  TrendingUp, PiggyBank, Folder, ShoppingBag, ShoppingCart,
  CreditCard, Banknote, Wifi, Stethoscope, Pill, Cat,
  Gamepad2, Briefcase, Gift, Landmark, BarChart3, HelpCircle,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Utensils, Car, Heart, Baby, User, Home, AlertTriangle,
  TrendingUp, PiggyBank, Folder, ShoppingBag, ShoppingCart,
  CreditCard, Banknote, Wifi, Stethoscope, Pill, Cat,
  Gamepad2, Briefcase, Gift, Landmark, BarChart3, HelpCircle,
};

export function getGroupIcon(name?: string | null): LucideIcon {
  if (!name) return Folder;
  return ICON_MAP[name] || Folder;
}