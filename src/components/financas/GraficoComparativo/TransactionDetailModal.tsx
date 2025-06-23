
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Transacao } from "@/types";
import { formatarMoeda } from "@/utils/financas";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoria: string;
  ciclo: string;
  transacoes: Transacao[];
  totalValue: number;
}

const TransactionDetailModal = ({ 
  isOpen, 
  onClose, 
  categoria, 
  ciclo, 
  transacoes, 
  totalValue 
}: TransactionDetailModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Transações: {categoria}</span>
            <Badge variant="outline">{ciclo}</Badge>
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Total: <span className="font-semibold text-destructive">{formatarMoeda(totalValue)}</span>
            {" • "}
            {transacoes.length} transação{transacoes.length !== 1 ? 'ões' : ''}
          </p>
        </DialogHeader>
        
        <div className="mt-4">
          {transacoes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma transação encontrada para esta categoria neste ciclo.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Quem realizou</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Parcelas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transacoes.map((transacao) => (
                  <TableRow key={transacao.id}>
                    <TableCell>
                      {format(
                        transacao.data instanceof Date ? transacao.data : new Date(transacao.data),
                        "dd/MM/yyyy",
                        { locale: ptBR }
                      )}
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <div className="truncate">
                        {transacao.descricao || '-'}
                      </div>
                      {transacao.isParcela && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          Projeção
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{transacao.quemGastou}</TableCell>
                    <TableCell className="text-right font-medium text-destructive">
                      {formatarMoeda(Math.abs(transacao.valor))}
                    </TableCell>
                    <TableCell>
                      {transacao.parcelas > 1 
                        ? `${transacao.parcelaAtual || 1}/${transacao.parcelas}`
                        : '-'
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDetailModal;
