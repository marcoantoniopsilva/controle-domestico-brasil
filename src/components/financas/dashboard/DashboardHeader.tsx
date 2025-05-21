
import SeletorCiclo from "../SeletorCiclo";

interface DashboardHeaderProps {
  onCicloChange: (ciclo: any) => void;
}

const DashboardHeader = ({ onCicloChange }: DashboardHeaderProps) => {
  // Versão ultra-simplificada sem nenhuma lógica que possa causar loops
  const handleCicloChange = (ciclo: any) => {
    console.log("[DashboardHeader] Mudança de ciclo solicitada pelo usuário");
    console.log("[STABLE BUILD] Atualização manual solicitada pelo usuário");
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
