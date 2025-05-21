
import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, RefreshCcw } from "lucide-react";
import { Transacao } from "@/types";
import { formatarMoeda } from "@/utils/financas";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ListaTransacoesProps {
  transacoes: Transacao[];
  onExcluir: (id: string) => Promise<void>;
}

const ListaTransacoes: React.FC<ListaTransacoesProps> = ({ transacoes, onExcluir }) => {
  const [renderKey, setRenderKey] = useState<string>(Date.now().toString());
  
  // Monitorar mudanças nas transações para debugging e forçar re-renderização
  useEffect(() => {
    console.log("[ListaTransacoes] Transações atualizadas:", transacoes.length);
    setRenderKey(Date.now().toString());
  }, [transacoes]);

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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Quem realizou</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead>Parcelas</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transacoes.map((transacao) => (
            <TableRow key={`${transacao.id}-${renderKey}`}>
              <TableCell>
                {format(new Date(transacao.data), 'dd/MM/yyyy', { locale: ptBR })}
              </TableCell>
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
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={async () => await onExcluir(transacao.id)}
                    title="Excluir transação"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ListaTransacoes;
