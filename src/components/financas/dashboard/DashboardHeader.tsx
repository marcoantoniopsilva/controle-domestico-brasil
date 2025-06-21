
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
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold">Dashboard Financeiro</h2>
      <div className="flex items-center gap-2">
        <SeletorCiclo onCicloChange={handleCicloChange} />
      </div>
    </div>
  );
};

export default DashboardHeader;
