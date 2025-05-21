
import SeletorCiclo from "../SeletorCiclo";

interface DashboardHeaderProps {
  onCicloChange: (ciclo: any) => void;
}

const DashboardHeader = ({ onCicloChange }: DashboardHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold">Dashboard Financeiro</h2>
      <div className="flex items-center gap-2">
        <SeletorCiclo onCicloChange={onCicloChange} />
      </div>
    </div>
  );
};

export default DashboardHeader;
