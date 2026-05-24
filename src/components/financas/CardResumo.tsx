
import { formatarMoeda } from "@/utils/financas";

interface CardResumoProps {
  titulo: string;
  valor: number;
  tipo: "primary" | "destructive" | "default";
}

const CardResumo: React.FC<CardResumoProps> = ({ titulo, valor, tipo }) => {
  const getTextColorClass = () => {
    switch (tipo) {
      case "primary":
        return "text-primary";
      case "destructive":
        return "text-destructive";
      default:
        return valor >= 0 ? "text-primary" : "text-destructive";
    }
  };

  return (
    <div className="bg-card rounded-2xl shadow-card p-6">
      <p className="text-label mb-2">{titulo}</p>
      <p className={`text-metric ${getTextColorClass()}`}>
        {formatarMoeda(valor)}
      </p>
    </div>
  );
};

export default CardResumo;
