
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { Transacao } from "@/types";
import { formatarMoeda } from "@/utils/financas";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ListaTransacoesProps {
  transacoes: Transacao[];
  onExcluir: (id: string) => Promise<void>;
}

const ListaTransacoes: React.FC<ListaTransacoesProps> = ({ transacoes, onExcluir }) => {
  if (transacoes.length === 0) {
    return <p className="text-center py-6 text-muted-foreground">Nenhuma transação encontrada.</p>;
  }
  
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm">
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
            <TableRow key={transacao.id}>
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
                    onClick={() => onExcluir(transacao.id)}
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
