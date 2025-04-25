
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

  // Gera lista de ciclos disponíveis (aumentado para 12 meses para trás e 12 para frente)
  const getCiclosDisponiveis = () => {
    const ciclos: CicloFinanceiro[] = [];
    const hoje = new Date();

    console.log("Gerando ciclos disponíveis");
    
    // Adiciona ciclos específicos que queremos garantir que existam
    const ciclosEspecificos = [
      {
        inicio: new Date(2025, 2, 25), // Março (0-based index, então 2)
        fim: new Date(2025, 3, 24),    // Abril
        nome: "março 2025 - abril 2025"
      }
    ];
    
    console.log("Ciclos específicos adicionados:", ciclosEspecificos);
    ciclosEspecificos.forEach(ciclo => ciclos.push(ciclo));

    // Adiciona ciclos anteriores (12 meses para trás)
    for (let i = -12; i < 0; i++) {
      const dataBase = addMonths(hoje, i);
      const mesAnterior = dataBase.getMonth() === 0 ? 11 : dataBase.getMonth() - 1;
      const anoInicio = mesAnterior === 11 ? dataBase.getFullYear() - 1 : dataBase.getFullYear();
      
      const inicio = new Date(anoInicio, mesAnterior, 25);
      const fim = new Date(dataBase.getFullYear(), dataBase.getMonth(), 24);
      
      const nomeMesInicio = format(inicio, 'MMMM', { locale: ptBR });
      const nomeMesFim = format(fim, 'MMMM', { locale: ptBR });
      const nomeAnoInicio = format(inicio, 'yyyy');
      const nomeAnoFim = format(fim, 'yyyy');
      
      // Sempre mostrar o ano para evitar confusão
      const nomeCompleto = `${nomeMesInicio} ${nomeAnoInicio} - ${nomeMesFim} ${nomeAnoFim}`;
      
      ciclos.push({
        inicio: new Date(inicio),
        fim: new Date(fim),
        nome: nomeCompleto
      });
    }

    // Adiciona ciclo atual
    const nomeMesInicioAtual = format(cicloAtual.inicio, 'MMMM', { locale: ptBR });
    const nomeMesFimAtual = format(cicloAtual.fim, 'MMMM', { locale: ptBR });
    const nomeAnoInicioAtual = format(cicloAtual.inicio, 'yyyy');
    const nomeAnoFimAtual = format(cicloAtual.fim, 'yyyy');
    
    // Sempre mostrar o ano para evitar confusão
    const nomeCompletoAtual = `${nomeMesInicioAtual} ${nomeAnoInicioAtual} - ${nomeMesFimAtual} ${nomeAnoFimAtual}`;
    
    ciclos.push({
      inicio: new Date(cicloAtual.inicio),
      fim: new Date(cicloAtual.fim),
      nome: nomeCompletoAtual
    });

    // Adiciona ciclos futuros (12 meses para frente)
    for (let i = 1; i <= 12; i++) {
      const dataBase = addMonths(hoje, i);
      const inicio = new Date(dataBase.getFullYear(), dataBase.getMonth() - 1, 25);
      const proxMes = dataBase.getMonth();
      const anoFim = proxMes === 0 ? dataBase.getFullYear() + 1 : dataBase.getFullYear();
      const fim = new Date(anoFim, proxMes, 24);
      
      const nomeMesInicio = format(inicio, 'MMMM', { locale: ptBR });
      const nomeMesFim = format(fim, 'MMMM', { locale: ptBR });
      const nomeAnoInicio = format(inicio, 'yyyy');
      const nomeAnoFim = format(fim, 'yyyy');
      
      // Sempre mostrar o ano para evitar confusão
      const nomeCompleto = `${nomeMesInicio} ${nomeAnoInicio} - ${nomeMesFim} ${nomeAnoFim}`;
      
      ciclos.push({
        inicio: new Date(inicio),
        fim: new Date(fim),
        nome: nomeCompleto
      });
    }

    // Ordenar ciclos por data (mais antigos primeiro)
    ciclos.sort((a, b) => a.inicio.getTime() - b.inicio.getTime());

    // Verificar se março-abril 2025 está na lista e imprimir
    const encontrado = ciclos.some(c => {
      const isMarcoAbril2025 = c.inicio.getFullYear() === 2025 && c.inicio.getMonth() === 2;
      if (isMarcoAbril2025) {
        console.log("Ciclo março-abril 2025 encontrado na lista:", 
          c.nome, 
          "início:", c.inicio.toISOString(), 
          "fim:", c.fim.toISOString());
      }
      return isMarcoAbril2025;
    });

    if (!encontrado) {
      console.log("ERRO: Ciclo março-abril 2025 NÃO encontrado na lista após adição!");
    }

    // Imprimir todos os ciclos para depuração
    console.log("Total de ciclos disponíveis:", ciclos.length);
    ciclos.forEach((c, idx) => {
      console.log(`Ciclo ${idx}: ${c.nome}, início: ${c.inicio.toISOString()}, fim: ${c.fim.toISOString()}`);
    });
    
    return ciclos;
  };

  const ciclosDisponiveis = getCiclosDisponiveis();

  const handleCicloChange = (cicloIndex: string) => {
    const index = Number(cicloIndex);
    if (index >= 0 && index < ciclosDisponiveis.length) {
      const ciclo = ciclosDisponiveis[index];
      console.log("Selecionando ciclo:", ciclo.nome);
      console.log("Data início:", ciclo.inicio.toISOString());
      console.log("Data fim:", ciclo.fim.toISOString());
      
      // Criando nova instância do objeto para garantir que as datas sejam corretamente tratadas
      const cicloCopy = {
        inicio: new Date(ciclo.inicio),
        fim: new Date(ciclo.fim),
        nome: ciclo.nome
      };
      
      setCicloSelecionado(cicloCopy);
      onCicloChange(cicloCopy);
    } else {
      console.error("Índice de ciclo inválido:", index, "Total de ciclos:", ciclosDisponiveis.length);
    }
  };

  // Encontra o índice do ciclo atual na lista
  const cicloAtualIndex = ciclosDisponiveis.findIndex(
    c => isSameMonth(c.inicio, cicloSelecionado.inicio) && 
         c.inicio.getFullYear() === cicloSelecionado.inicio.getFullYear()
  );

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        onClick={() => {
          console.log("Botão 'Ciclo Atual' clicado");
          const cicloCopy = {
            inicio: new Date(cicloAtual.inicio),
            fim: new Date(cicloAtual.fim),
            nome: cicloAtual.nome
          };
          setCicloSelecionado(cicloCopy);
          onCicloChange(cicloCopy);
        }}
        disabled={
          isSameMonth(cicloSelecionado.inicio, cicloAtual.inicio) && 
          cicloSelecionado.inicio.getFullYear() === cicloAtual.inicio.getFullYear()
        }
      >
        Ciclo Atual
      </Button>
      
      <Select
        value={cicloAtualIndex !== -1 ? cicloAtualIndex.toString() : ""}
        onValueChange={handleCicloChange}
      >
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="Selecione o ciclo" />
        </SelectTrigger>
        <SelectContent>
          {ciclosDisponiveis.map((ciclo, index) => (
            <SelectItem key={index} value={index.toString()}>
              {ciclo.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SeletorCiclo;
