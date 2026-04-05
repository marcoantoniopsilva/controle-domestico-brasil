
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transacao } from "@/types";
import { formatarMoedaInvestimento } from "@/utils/investimentos";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EditTransacaoForm from "../EditTransacaoForm";

interface InvestmentsListProps {
  transacoes: Transacao[];
  onExcluir: (id: string) => Promise<void>;
  onEditar?: (id: string, transacao: Omit<Transacao, "id">) => Promise<void>;
}

const InvestmentsList: React.FC<InvestmentsListProps> = ({ 
  transacoes, 
  onExcluir, 
  onEditar 
}) => {
  const [transacaoEditando, setTransacaoEditando] = useState<Transacao | null>(null);
  const [dialogAberta, setDialogAberta] = useState(false);

  const investimentos = transacoes
    .filter(t => t.tipo === 'investimento')
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  const handleEditarClick = (investimento: Transacao) => {
    setTransacaoEditando(investimento);
    setDialogAberta(true);
  };

  const handleDialogClose = () => {
    setDialogAberta(false);
    setTransacaoEditando(null);
  };

  const handleSalvarEdicao = async (transacao: Omit<Transacao, "id">) => {
    if (transacaoEditando && onEditar) {
      await onEditar(transacaoEditando.id, transacao);
      handleDialogClose();
    }
  };

  if (investimentos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Seus Investimentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhum investimento registrado ainda.</p>
            <p className="text-sm">Comece adicionando seu primeiro investimento!</p>
            <p className="text-xs mt-2">Dica: para atualizar o valor de um investimento, edite o lançamento existente ao invés de criar um novo.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Seus Investimentos ({investimentos.length})</CardTitle>
          <p className="text-sm text-muted-foreground">
            Para atualizar ganhos ou perdas, edite o valor do investimento existente.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {investimentos.map((investimento) => (
              <div
                key={investimento.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="secondary">{investimento.categoria}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(investimento.data).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    {investimento.descricao && (
                      <p className="text-sm font-medium">{investimento.descricao}</p>
                    )}
                    
                    <div className="text-sm">
                      <span className="font-semibold text-blue-600">
                        Valor atual: {formatarMoedaInvestimento(Math.abs(investimento.valor))}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {onEditar && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditarClick(investimento)}
                      title="Editar valor atual"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onExcluir(investimento.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog para edição de investimento */}
      <Dialog open={dialogAberta} onOpenChange={setDialogAberta}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Investimento</DialogTitle>
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
    </>
  );
};

export default InvestmentsList;
