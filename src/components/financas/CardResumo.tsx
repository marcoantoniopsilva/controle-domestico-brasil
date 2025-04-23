
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
    <div className="bg-white rounded-lg shadow p-6 border">
      <p className="text-sm text-muted-foreground">{titulo}</p>
      <p className={`text-2xl font-bold ${getTextColorClass()}`}>
        {formatarMoeda(valor)}
      </p>
    </div>
  );
};

export default CardResumo;
