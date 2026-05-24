import { Usuario } from "@/types";
import { formatarMoeda } from "@/utils/financas";

interface GreetingHeaderProps {
  usuario: Usuario;
  saldo: number;
  totalReceitas: number;
  totalDespesas: number;
}

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
};

export function GreetingHeader({ usuario, saldo, totalReceitas, totalDespesas }: GreetingHeaderProps) {
  const nome = usuario?.nome?.split(" ")[0] || "por aqui";
  const economia = totalReceitas - totalDespesas;

  let subtitle: React.ReactNode;
  if (totalReceitas === 0 && totalDespesas === 0) {
    subtitle = <span className="text-muted-foreground">Adicione transações para começar a visualizar seu ciclo.</span>;
  } else if (economia >= 0) {
    subtitle = (
      <>
        Você economizou{" "}
        <span className="font-semibold text-primary">{formatarMoeda(economia)}</span> neste ciclo.
      </>
    );
  } else {
    subtitle = (
      <>
        Você está{" "}
        <span className="font-semibold text-destructive">{formatarMoeda(Math.abs(economia))}</span> acima do orçamento.
      </>
    );
  }

  return (
    <div className="space-y-1.5">
      <h1 className="text-display">
        {getGreeting()}, {nome} <span className="inline-block">👋</span>
      </h1>
      <p className="text-base md:text-lg text-muted-foreground">{subtitle}</p>
    </div>
  );
}