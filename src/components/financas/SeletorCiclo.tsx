
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CicloFinanceiro } from "@/types";
import { calcularCicloAtual } from "@/utils/financas";
import { addMonths, format, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SeletorCicloProps {
  onCicloChange: (ciclo: CicloFinanceiro) => void;
}

const SeletorCiclo: React.FC<SeletorCicloProps> = ({ onCicloChange }) => {
  const cicloAtual = calcularCicloAtual();
  const [cicloSelecionado, setCicloSelecionado] = useState<CicloFinanceiro>(cicloAtual);

  // Gera lista de ciclos disponíveis (aumentado para 6 meses para trás e 12 para frente)
  const getCiclosDisponiveis = () => {
    const ciclos: CicloFinanceiro[] = [];
    const hoje = new Date();

    // Adiciona ciclos anteriores (6 meses para trás)
    for (let i = -6; i < 0; i++) {
      const dataBase = addMonths(hoje, i);
      const mesAnterior = dataBase.getMonth() === 0 ? 11 : dataBase.getMonth() - 1;
      const anoInicio = mesAnterior === 11 ? dataBase.getFullYear() - 1 : dataBase.getFullYear();
      
      const inicio = new Date(anoInicio, mesAnterior, 25);
      const fim = new Date(dataBase.getFullYear(), dataBase.getMonth(), 24);
      
      const nomeMesInicio = format(inicio, 'MMMM', { locale: ptBR });
      const nomeMesFim = format(fim, 'MMMM', { locale: ptBR });
      const nomeAnoInicio = format(inicio, 'yyyy', { locale: ptBR });
      const nomeAnoFim = format(fim, 'yyyy', { locale: ptBR });
      
      // Adiciona o ano quando mudar de ano
      const nomeCompleto = nomeAnoInicio === nomeAnoFim 
        ? `${nomeMesInicio} - ${nomeMesFim} ${nomeAnoInicio}` 
        : `${nomeMesInicio} ${nomeAnoInicio} - ${nomeMesFim} ${nomeAnoFim}`;
      
      ciclos.push({
        inicio,
        fim,
        nome: nomeCompleto
      });
    }

    // Adiciona ciclo atual
    ciclos.push(cicloAtual);

    // Adiciona ciclos futuros (12 meses para frente)
    for (let i = 1; i <= 12; i++) {
      const dataBase = addMonths(hoje, i);
      const inicio = new Date(dataBase.getFullYear(), dataBase.getMonth() - 1, 25);
      const proxMes = dataBase.getMonth();
      const anoFim = proxMes === 0 ? dataBase.getFullYear() + 1 : dataBase.getFullYear();
      const fim = new Date(anoFim, proxMes, 24);
      
      const nomeMesInicio = format(inicio, 'MMMM', { locale: ptBR });
      const nomeMesFim = format(fim, 'MMMM', { locale: ptBR });
      const nomeAnoInicio = format(inicio, 'yyyy', { locale: ptBR });
      const nomeAnoFim = format(fim, 'yyyy', { locale: ptBR });
      
      // Adiciona o ano quando mudar de ano
      const nomeCompleto = nomeAnoInicio === nomeAnoFim 
        ? `${nomeMesInicio} - ${nomeMesFim} ${nomeAnoInicio}` 
        : `${nomeMesInicio} ${nomeAnoInicio} - ${nomeMesFim} ${nomeAnoFim}`;
      
      ciclos.push({
        inicio,
        fim,
        nome: nomeCompleto
      });
    }

    return ciclos;
  };

  const ciclosDisponiveis = getCiclosDisponiveis();

  const handleCicloChange = (cicloIndex: string) => {
    const ciclo = ciclosDisponiveis[Number(cicloIndex)];
    console.log("Alterando para ciclo:", ciclo.nome);
    console.log("Data início:", ciclo.inicio);
    console.log("Data fim:", ciclo.fim);
    setCicloSelecionado(ciclo);
    onCicloChange(ciclo);
  };

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        onClick={() => {
          setCicloSelecionado(cicloAtual);
          onCicloChange(cicloAtual);
        }}
        disabled={isSameMonth(cicloSelecionado.inicio, cicloAtual.inicio)}
      >
        Ciclo Atual
      </Button>
      
      <Select
        value={ciclosDisponiveis.findIndex(c => 
          isSameMonth(c.inicio, cicloSelecionado.inicio)).toString()}
        onValueChange={handleCicloChange}
      >
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="Selecione o ciclo" />
        </SelectTrigger>
        <SelectContent>
          {ciclosDisponiveis.map((ciclo, index) => (
            <SelectItem key={ciclo.nome} value={index.toString()}>
              {ciclo.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SeletorCiclo;
