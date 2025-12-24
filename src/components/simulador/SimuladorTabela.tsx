import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { SimulacaoMes, MESES_ABREV } from "@/types/simulacao";
import { formatarMoeda } from "@/utils/financas";
import { Copy, RotateCcw } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface SimuladorTabelaProps {
  simulacao: SimulacaoMes[];
  saving: boolean;
  onSalvarValor: (mes: number, categoriaNome: string, categoriaTipo: string, valor: number) => void;
  onResetarMes: (mes: number) => void;
  onCopiarParaTodos: (mesOrigem: number) => void;
  calcularTotaisMes: (mes: number) => { receitas: number; despesas: number; investimentos: number; saldo: number };
}

type TipoAba = "despesa" | "receita" | "investimento";

export function SimuladorTabela({
  simulacao,
  saving,
  onSalvarValor,
  onResetarMes,
  onCopiarParaTodos,
  calcularTotaisMes
}: SimuladorTabelaProps) {
  const [abaAtiva, setAbaAtiva] = useState<TipoAba>("despesa");
  const [editando, setEditando] = useState<{ mes: number; categoria: string } | null>(null);
  const [valorTemp, setValorTemp] = useState<string>("");

  // Obter categorias únicas por tipo
  const obterCategoriasPorTipo = useCallback((tipo: TipoAba) => {
    if (simulacao.length === 0) return [];
    
    const categorias = simulacao[0].categorias
      .filter(c => c.categoriaTipo === tipo)
      .map(c => c.categoriaNome);
    
    return [...new Set(categorias)];
  }, [simulacao]);

  // Obter valor de uma categoria em um mês específico
  const obterValor = useCallback((mes: number, categoriaNome: string, tipo: TipoAba) => {
    const mesData = simulacao.find(m => m.mes === mes);
    if (!mesData) return 0;

    const categoria = mesData.categorias.find(
      c => c.categoriaNome === categoriaNome && c.categoriaTipo === tipo
    );
    return categoria?.valorPrevisto || 0;
  }, [simulacao]);

  // Calcular total anual de uma categoria
  const calcularTotalCategoria = useCallback((categoriaNome: string, tipo: TipoAba) => {
    return simulacao.reduce((total, mes) => {
      const valor = obterValor(mes.mes, categoriaNome, tipo);
      return total + valor;
    }, 0);
  }, [simulacao, obterValor]);

  // Calcular total mensal por tipo
  const calcularTotalMensal = useCallback((mes: number, tipo: TipoAba) => {
    const mesData = simulacao.find(m => m.mes === mes);
    if (!mesData) return 0;

    return mesData.categorias
      .filter(c => c.categoriaTipo === tipo)
      .reduce((total, c) => total + c.valorPrevisto, 0);
  }, [simulacao]);

  // Handler para iniciar edição
  const iniciarEdicao = (mes: number, categoria: string, valorAtual: number) => {
    setEditando({ mes, categoria });
    setValorTemp(valorAtual.toString());
  };

  // Handler para confirmar edição
  const confirmarEdicao = () => {
    if (!editando) return;

    const valor = parseFloat(valorTemp.replace(',', '.')) || 0;
    onSalvarValor(editando.mes, editando.categoria, abaAtiva, valor);
    setEditando(null);
    setValorTemp("");
  };

  // Handler para cancelar edição
  const cancelarEdicao = () => {
    setEditando(null);
    setValorTemp("");
  };

  const renderTabela = (tipo: TipoAba) => {
    const categorias = obterCategoriasPorTipo(tipo);

    return (
      <ScrollArea className="w-full">
        <div className="min-w-[1200px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-background z-10 min-w-[150px]">
                  Categoria
                </TableHead>
                {MESES_ABREV.map((mes, idx) => (
                  <TableHead key={mes} className="text-center min-w-[100px]">
                    <div className="flex flex-col items-center gap-1">
                      <span>{mes}</span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          title="Copiar para todos os meses"
                          onClick={() => onCopiarParaTodos(idx + 1)}
                          disabled={saving}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          title="Resetar mês"
                          onClick={() => onResetarMes(idx + 1)}
                          disabled={saving}
                        >
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </TableHead>
                ))}
                <TableHead className="text-center font-bold min-w-[120px] bg-muted">
                  Total Anual
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categorias.map(categoria => (
                <TableRow key={categoria}>
                  <TableCell className="sticky left-0 bg-background z-10 font-medium">
                    {categoria}
                  </TableCell>
                  {simulacao.map(mes => {
                    const valor = obterValor(mes.mes, categoria, tipo);
                    const isEditando = editando?.mes === mes.mes && editando?.categoria === categoria;

                    return (
                      <TableCell key={mes.mes} className="text-center p-1">
                        {isEditando ? (
                          <Input
                            type="number"
                            value={valorTemp}
                            onChange={(e) => setValorTemp(e.target.value)}
                            onBlur={confirmarEdicao}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') confirmarEdicao();
                              if (e.key === 'Escape') cancelarEdicao();
                            }}
                            className="h-8 text-center text-sm"
                            autoFocus
                            disabled={saving}
                          />
                        ) : (
                          <button
                            className="w-full h-8 px-2 text-sm hover:bg-muted rounded transition-colors cursor-pointer"
                            onClick={() => iniciarEdicao(mes.mes, categoria, valor)}
                            disabled={saving}
                          >
                            {formatarMoeda(valor)}
                          </button>
                        )}
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-center font-bold bg-muted">
                    {formatarMoeda(calcularTotalCategoria(categoria, tipo))}
                  </TableCell>
                </TableRow>
              ))}
              
              {/* Linha de totais */}
              <TableRow className="bg-muted/50 font-bold">
                <TableCell className="sticky left-0 bg-muted/50 z-10">
                  Total {tipo === 'despesa' ? 'Despesas' : tipo === 'receita' ? 'Receitas' : 'Investimentos'}
                </TableCell>
                {simulacao.map(mes => (
                  <TableCell key={mes.mes} className="text-center">
                    {formatarMoeda(calcularTotalMensal(mes.mes, tipo))}
                  </TableCell>
                ))}
                <TableCell className="text-center bg-muted">
                  {formatarMoeda(
                    simulacao.reduce((total, mes) => total + calcularTotalMensal(mes.mes, tipo), 0)
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orçamento por Categoria e Mês</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={abaAtiva} onValueChange={(v) => setAbaAtiva(v as TipoAba)}>
          <TabsList className="mb-4">
            <TabsTrigger value="despesa">Despesas</TabsTrigger>
            <TabsTrigger value="receita">Receitas</TabsTrigger>
            <TabsTrigger value="investimento">Investimentos</TabsTrigger>
          </TabsList>

          <TabsContent value="despesa">
            {renderTabela("despesa")}
          </TabsContent>

          <TabsContent value="receita">
            {renderTabela("receita")}
          </TabsContent>

          <TabsContent value="investimento">
            {renderTabela("investimento")}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
