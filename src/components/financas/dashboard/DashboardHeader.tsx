
import SeletorCiclo from "../SeletorCiclo";

interface DashboardHeaderProps {
  onCicloChange: (ciclo: any) => void;
}

const DashboardHeader = ({ onCicloChange }: DashboardHeaderProps) => {
  // Versão ultra-simplificada - apenas passa o ciclo para o componente pai sem processamento adicional
  const handleCicloChange = (ciclo: any) => {
    console.log("[DashboardHeader] Mudança de ciclo solicitada pelo usuário para:", ciclo.nome);
    // Apenas passamos o ciclo para o componente pai, sem processamento adicional
    onCicloChange(ciclo);
  };
  
  return (
    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
      <span className="text-label">Ciclo atual</span>
      <SeletorCiclo onCicloChange={handleCicloChange} />
    </div>
  );
};

export default DashboardHeader;
