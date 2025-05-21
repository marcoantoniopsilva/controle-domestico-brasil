
import SeletorCiclo from "../SeletorCiclo";

interface DashboardHeaderProps {
  onCicloChange: (ciclo: any) => void;
}

const DashboardHeader = ({ onCicloChange }: DashboardHeaderProps) => {
  // Adicionar debounce para o manipulador de mudança de ciclo
  const handleCicloChange = (ciclo: any) => {
    // Prevenimos múltiplas atualizações em sequência
    if (window._cicloChangeTimeout) {
      clearTimeout(window._cicloChangeTimeout);
    }
    
    window._cicloChangeTimeout = setTimeout(() => {
      onCicloChange(ciclo);
    }, 1000); // Aumentado para 1 segundo
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

// Adicionamos a tipagem para as propriedades globais do window
declare global {
  interface Window {
    _cicloChangeTimeout?: ReturnType<typeof setTimeout>;
  }
}

export default DashboardHeader;
