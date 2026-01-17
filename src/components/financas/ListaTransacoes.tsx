import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Edit, RefreshCcw } from "lucide-react";
import { Transacao } from "@/types";
import { formatarMoeda } from "@/utils/financas";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EditTransacaoForm from "./EditTransacaoForm";
import { getCategoryIcon } from "@/utils/categoryIcons";

interface ListaTransacoesProps {
  transacoes: Transacao[];
  onExcluir: (id: string) => Promise<void>;
  onEditar?: (id: string, transacao: Omit<Transacao, "id">) => Promise<void>;
}

interface TransacaoPorData {
  data: string;
  transacoes: Transacao[];
}

const ListaTransacoes: React.FC<ListaTransacoesProps> = ({ transacoes, onExcluir, onEditar }) => {
  const [renderKey, setRenderKey] = useState<string>(Date.now().toString());
  const [transacaoEditando, setTransacaoEditando] = useState<Transacao | null>(null);
  const [dialogAberta, setDialogAberta] = useState(false);
  
  // Log to confirm we're receiving transactions
  useEffect(() => {
    console.log("[ListaTransacoes] Recebidas transações:", transacoes?.length || 0);
  }, [transacoes]);
  
  // Função para converter string YYYY-MM-DD em Date local (evita problema de timezone)
  const parseDataLocal = (dataString: string): Date => {
    const [ano, mes, dia] = dataString.split('-').map(Number);
    return new Date(ano, mes - 1, dia);
  };

  // Agrupar transações por data
  const transacoesAgrupadas: TransacaoPorData[] = React.useMemo(() => {
    if (!Array.isArray(transacoes) || transacoes.length === 0) {
      console.log("[ListaTransacoes] Não há transações para agrupar");
      return [];
    }
    
    const grupos: { [key: string]: Transacao[] } = {};
    
    console.log("[ListaTransacoes] Agrupando", transacoes.length, "transações por data");
    
    transacoes.forEach(transacao => {
      if (!transacao || !transacao.data) {
        console.error("[ListaTransacoes] Transação inválida ou sem data:", transacao);
        return;
      }
      
      // Garantir que a data seja um objeto Date
      let data;
      try {
        data = transacao.data instanceof Date 
          ? transacao.data 
          : new Date(transacao.data);
      } catch (error) {
        console.error(`[ListaTransacoes] Erro ao converter data para transação ${transacao.id}:`, error);
        return;
      }
      
      if (isNaN(data.getTime())) {
        console.error(`[ListaTransacoes] Data inválida para transação ${transacao.id}:`, transacao.data);
        return;
      }
      
      // Formatar a data para agrupar (apenas ano-mês-dia)
      const dataFormatada = format(data, 'yyyy-MM-dd');
      
      if (!grupos[dataFormatada]) {
        grupos[dataFormatada] = [];
      }
      
      grupos[dataFormatada].push(transacao);
    });
    
    // Converter o objeto em um array ordenado por data (mais recente primeiro)
    const resultado = Object.entries(grupos)
      .map(([data, transacoes]) => ({ 
        data, 
        transacoes 
      }))
      .sort((a, b) => parseDataLocal(b.data).getTime() - parseDataLocal(a.data).getTime());
    
    console.log("[ListaTransacoes] Agrupamento concluído:", resultado.length, "grupos de data");
    return resultado;
  }, [transacoes]);
  
  // Monitorar mudanças nas transações para debugging e forçar re-renderização
  useEffect(() => {
    console.log("[ListaTransacoes] Transações atualizadas:", transacoes?.length);
    setRenderKey(Date.now().toString());
  }, [transacoes]);

  // Função para abrir o diálogo de edição
  const handleEditarClick = (transacao: Transacao) => {
    setTransacaoEditando(transacao);
    setDialogAberta(true);
  };

  // Função para fechar o diálogo
  const handleDialogClose = () => {
    setDialogAberta(false);
    setTransacaoEditando(null);
  };

  // Função para salvar a transação editada
  const handleSalvarEdicao = async (transacao: Omit<Transacao, "id">) => {
    if (transacaoEditando && onEditar) {
      await onEditar(transacaoEditando.id, transacao);
      handleDialogClose();
    }
  };

  if (!Array.isArray(transacoes) || transacoes.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <p className="text-muted-foreground mb-4">Nenhuma transação encontrada.</p>
        <p className="text-xs text-gray-400">ID de renderização: {renderKey.substring(0, 8)}</p>
      </div>
    );
  }
  
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm">
      <div className="bg-gray-50 p-2 flex justify-between items-center">
        <span className="text-xs md:text-sm font-medium">{transacoes.length} transações</span>
        <span className="text-xs text-gray-400 hidden md:inline">ID: {renderKey.substring(0, 8)}</span>
      </div>

      {transacoesAgrupadas.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-muted-foreground">Nenhum grupo de transações encontrado.</p>
        </div>
      ) : (
        transacoesAgrupadas.map(grupo => (
          <div key={grupo.data} className="mb-4">
            <div className="bg-slate-100 p-2 md:p-3 font-medium text-slate-800 text-xs md:text-sm">
              {format(parseDataLocal(grupo.data), "EEE, dd/MM/yy", { locale: ptBR })}
              <span className="hidden md:inline">
                {" - "}
                {format(parseDataLocal(grupo.data), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs md:text-sm whitespace-nowrap">Categoria</TableHead>
                    <TableHead className="text-xs md:text-sm hidden sm:table-cell">Descrição</TableHead>
                    <TableHead className="text-xs md:text-sm hidden md:table-cell">Quem</TableHead>
                    <TableHead className="text-xs md:text-sm text-right whitespace-nowrap">Valor</TableHead>
                    <TableHead className="text-xs md:text-sm hidden sm:table-cell">Parcelas</TableHead>
                    <TableHead className="text-xs md:text-sm text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {grupo.transacoes.map((transacao) => {
                  const CategoryIcon = getCategoryIcon(transacao.categoria);
                  return (
                  <TableRow key={`${transacao.id}-${renderKey}`}>
                    <TableCell className="text-xs md:text-sm py-2 md:py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <CategoryIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span>{transacao.categoria}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs md:text-sm py-2 md:py-4 max-w-[120px] md:max-w-[200px] truncate hidden sm:table-cell">
                      {transacao.descricao || '-'}
                      {transacao.isParcela && (
                        <Badge variant="outline" className="ml-1 text-xs">P</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs md:text-sm py-2 md:py-4 hidden md:table-cell">{transacao.quemGastou}</TableCell>
                    <TableCell className={`text-xs md:text-sm py-2 md:py-4 text-right whitespace-nowrap ${transacao.valor < 0 ? 'text-destructive' : 'text-green-600'}`}>
                      {formatarMoeda(transacao.valor)}
                    </TableCell>
                    <TableCell className="text-xs md:text-sm py-2 md:py-4 hidden sm:table-cell">
                      {transacao.parcelas > 1 
                        ? `${transacao.parcelaAtual || 1}/${transacao.parcelas}`
                        : '-'
                      }
                    </TableCell>
                    <TableCell className="text-right py-2 md:py-4">
                      {!transacao.isParcela && (
                        <div className="flex justify-end gap-0.5 md:gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 md:h-8 md:w-8"
                            onClick={() => handleEditarClick(transacao)}
                            title="Editar transação"
                          >
                            <Edit className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 md:h-8 md:w-8"
                            onClick={async () => await onExcluir(transacao.id)}
                            title="Excluir transação"
                          >
                            <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            </div>
          </div>
        ))
      )}

      {/* Dialog para edição de transação */}
      <Dialog open={dialogAberta} onOpenChange={setDialogAberta}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Transação</DialogTitle>
          </DialogHeader>
          {transacaoEditando && (
            <EditTransacaoForm
              transacao={transacaoEditando}
              onSalvar={handleSalvarEdicao}
              onCancelar={handleDialogClose}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ListaTransacoes;
