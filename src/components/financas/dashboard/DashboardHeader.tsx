
import SeletorCiclo from "../SeletorCiclo";
import { useRef } from "react";

interface DashboardHeaderProps {
  onCicloChange: (ciclo: any) => void;
}

const DashboardHeader = ({ onCicloChange }: DashboardHeaderProps) => {
  // Usar useRef para manter a referência do timeout entre renders
  const cicloTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Implementar debounce robusto para o manipulador de mudança de ciclo
  const handleCicloChange = (ciclo: any) => {
    // Limpar qualquer timeout pendente
    if (cicloTimeoutRef.current) {
      clearTimeout(cicloTimeoutRef.current);
      cicloTimeoutRef.current = null;
    }
    
    // Definir um novo timeout com um delay significativo
    cicloTimeoutRef.current = setTimeout(() => {
      console.log("[DashboardHeader] Aplicando mudança de ciclo após debounce");
      onCicloChange(ciclo);
      cicloTimeoutRef.current = null;
    }, 2000); // Aumentado para 2 segundos
  };
  
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold">Dashboard Financeiro</h2>
      <div className="flex items-center gap-2">
        <SeletorCiclo onCicloChange={handleCicloChange} />
      </div>
    </div>
  );
};

export default DashboardHeader;
