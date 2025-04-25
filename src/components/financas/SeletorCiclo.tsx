
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuRadioGroup, 
  DropdownMenuRadioItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { CicloFinanceiro } from "@/types";
import { calcularCicloAtual } from "@/utils/financas";
import { format, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronDown } from "lucide-react";

interface SeletorCicloProps {
  onCicloChange: (ciclo: CicloFinanceiro) => void;
}

const SeletorCiclo: React.FC<SeletorCicloProps> = ({ onCicloChange }) => {
  const cicloAtual = calcularCicloAtual();
  const [ciclosDisponiveis, setCiclosDisponiveis] = useState<CicloFinanceiro[]>([]);
  const [cicloSelecionado, setCicloSelecionado] = useState<string>("");

  // Gera lista de ciclos disponíveis
  useEffect(() => {
    const gerarCiclos = () => {
      const ciclos: CicloFinanceiro[] = [];
      const hoje = new Date();
      
      console.log("[SeletorCiclo] Gerando ciclos disponíveis");
      
      // Adiciona ciclo março-abril 2025 explicitamente
      // IMPORTANTE: Criando objeto Date diretamente com valores específicos
      const marcoAbril2025Inicio = new Date(2025, 2, 25); // Março (0-based index, então 2)
      const marcoAbril2025Fim = new Date(2025, 3, 24);    // Abril
      
      const marcoAbril2025 = {
        inicio: marcoAbril2025Inicio,
        fim: marcoAbril2025Fim,
        nome: `março 2025 - abril 2025`
      };
      
      ciclos.push(marcoAbril2025);
      
      console.log("[SeletorCiclo] Ciclo março-abril 2025 adicionado explicitamente:", 
        "início:", marcoAbril2025Inicio.toISOString(), 
        "fim:", marcoAbril2025Fim.toISOString(),
        "nome:", marcoAbril2025.nome);

      // Adiciona ciclos anteriores (12 meses para trás)
      for (let i = -12; i <= 12; i++) {
        // Pula o ciclo especial março-abril 2025 que já foi adicionado
        if (i === 11 && hoje.getFullYear() === 2024) continue;
        
        const dataBase = addMonths(hoje, i);
        
        // Lógica para ciclos que começam no dia 25 do mês anterior
        const inicio = new Date(dataBase.getFullYear(), dataBase.getMonth() - 1, 25);
        const fim = new Date(dataBase.getFullYear(), dataBase.getMonth(), 24);
        
        const nomeMesInicio = format(inicio, 'MMMM', { locale: ptBR });
        const nomeMesFim = format(fim, 'MMMM', { locale: ptBR });
        const anoInicio = format(inicio, 'yyyy');
        const anoFim = format(fim, 'yyyy');
        
        // Sempre incluir os anos no nome
        const nome = `${nomeMesInicio} ${anoInicio} - ${nomeMesFim} ${anoFim}`;
        
        ciclos.push({
          inicio: new Date(inicio),
          fim: new Date(fim),
          nome: nome
        });
      }

      // Ordenar ciclos por data (mais antigos primeiro)
      ciclos.sort((a, b) => a.inicio.getTime() - b.inicio.getTime());
      
      // Log detalhado para todos os ciclos gerados
      console.log("[SeletorCiclo] Total de ciclos disponíveis:", ciclos.length);
      ciclos.forEach((c, idx) => {
        console.log(`[SeletorCiclo] Ciclo ${idx}: ${c.nome}, início: ${c.inicio.toISOString()}, fim: ${c.fim.toISOString()}`);
      });
      
      return ciclos;
    };

    const ciclos = gerarCiclos();
    setCiclosDisponiveis(ciclos);
    
    // Selecionar o ciclo atual por padrão
    const cicloAtualIndex = ciclos.findIndex(c => 
      c.inicio.getMonth() === cicloAtual.inicio.getMonth() && 
      c.inicio.getFullYear() === cicloAtual.inicio.getFullYear()
    );
    
    if (cicloAtualIndex !== -1) {
      setCicloSelecionado(cicloAtualIndex.toString());
    }
  }, [cicloAtual]);

  const handleCicloChange = (value: string) => {
    const index = Number(value);
    if (index >= 0 && index < ciclosDisponiveis.length) {
      const ciclo = ciclosDisponiveis[index];
      console.log("[SeletorCiclo] Selecionando ciclo:", ciclo.nome);
      console.log("[SeletorCiclo] Data início:", ciclo.inicio.toISOString());
      console.log("[SeletorCiclo] Data fim:", ciclo.fim.toISOString());
      
      // Criando nova instância do objeto para garantir que as datas sejam corretamente tratadas
      const cicloCopy = {
        inicio: new Date(ciclo.inicio),
        fim: new Date(ciclo.fim),
        nome: ciclo.nome
      };
      
      setCicloSelecionado(value);
      onCicloChange(cicloCopy);
    } else {
      console.error("[SeletorCiclo] Índice de ciclo inválido:", index, "Total de ciclos:", ciclosDisponiveis.length);
    }
  };

  const handleCicloAtual = () => {
    console.log("[SeletorCiclo] Botão 'Ciclo Atual' clicado");
    const novoCiclo = {
      inicio: new Date(cicloAtual.inicio),
      fim: new Date(cicloAtual.fim),
      nome: cicloAtual.nome
    };
    
    // Encontrar o índice do ciclo atual na lista
    const cicloAtualIndex = ciclosDisponiveis.findIndex(c => 
      c.inicio.getMonth() === cicloAtual.inicio.getMonth() && 
      c.inicio.getFullYear() === cicloAtual.inicio.getFullYear()
    );
    
    if (cicloAtualIndex !== -1) {
      setCicloSelecionado(cicloAtualIndex.toString());
    }
    
    onCicloChange(novoCiclo);
  };

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        onClick={handleCicloAtual}
      >
        Ciclo Atual
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="min-w-[200px] justify-between">
            {cicloSelecionado ? 
              ciclosDisponiveis[Number(cicloSelecionado)]?.nome || "Selecione o ciclo" 
              : "Selecione o ciclo"}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[300px] max-h-[400px] overflow-y-auto">
          <DropdownMenuRadioGroup value={cicloSelecionado} onValueChange={handleCicloChange}>
            {ciclosDisponiveis.map((ciclo, index) => (
              <DropdownMenuRadioItem key={index} value={index.toString()} className="cursor-pointer">
                {ciclo.nome}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default SeletorCiclo;
