
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
  
  // Agrupar transações por data
  const transacoesAgrupadas: TransacaoPorData[] = React.useMemo(() => {
    const grupos: { [key: string]: Transacao[] } = {};
    
    transacoes.forEach(transacao => {
      // Garantir que a data seja um objeto Date
      const data = transacao.data instanceof Date 
        ? transacao.data 
        : new Date(transacao.data);
      
      // Formatar a data para agrupar (apenas ano-mês-dia)
      const dataFormatada = format(data, 'yyyy-MM-dd');
      
      if (!grupos[dataFormatada]) {
        grupos[dataFormatada] = [];
      }
      
      grupos[dataFormatada].push(transacao);
    });
    
    // Converter o objeto em um array ordenado por data (mais recente primeiro)
    return Object.entries(grupos)
      .map(([data, transacoes]) => ({ 
        data, 
        transacoes 
      }))
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [transacoes]);
  
  // Monitorar mudanças nas transações para debugging e forçar re-renderização
  useEffect(() => {
    console.log("[ListaTransacoes] Transações atualizadas:", transacoes.length);
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

  if (transacoes.length === 0) {
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
        <span className="text-sm font-medium">{transacoes.length} transações</span>
        <span className="text-xs text-gray-400">ID: {renderKey.substring(0, 8)}</span>
      </div>

      {transacoesAgrupadas.map(grupo => (
        <div key={grupo.data} className="mb-4">
          <div className="bg-slate-100 p-3 font-medium text-slate-800">
            {format(new Date(grupo.data), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categoria</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Quem realizou</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Parcelas</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grupo.transacoes.map((transacao) => (
                <TableRow key={`${transacao.id}-${renderKey}`}>
                  <TableCell>{transacao.categoria}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {transacao.descricao || '-'}
                    {transacao.isParcela && (
                      <Badge variant="outline" className="ml-2">Projeção</Badge>
                    )}
                  </TableCell>
                  <TableCell>{transacao.quemGastou}</TableCell>
                  <TableCell className={`text-right ${transacao.valor < 0 ? 'text-destructive' : 'text-green-600'}`}>
                    {formatarMoeda(transacao.valor)}
                  </TableCell>
                  <TableCell>
                    {transacao.parcelas > 1 
                      ? `${transacao.parcelaAtual || 1}/${transacao.parcelas}`
                      : '-'
                    }
                  </TableCell>
                  <TableCell className="text-right">
                    {!transacao.isParcela && (
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditarClick(transacao)}
                          title="Editar transação"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={async () => await onExcluir(transacao.id)}
                          title="Excluir transação"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}

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
