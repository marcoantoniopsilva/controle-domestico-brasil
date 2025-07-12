
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transacao } from "@/types";
import { formatarMoedaInvestimento } from "@/utils/investimentos";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  const investimentos = transacoes
    .filter(t => t.tipo === 'investimento')
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

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
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seus Investimentos ({investimentos.length})</CardTitle>
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
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <span>
                      <strong>Investido:</strong> {formatarMoedaInvestimento(Math.abs(investimento.valor))}
                    </span>
                    
                    {investimento.ganhos !== undefined && investimento.ganhos !== 0 && (
                      <span className={investimento.ganhos >= 0 ? 'text-green-600' : 'text-red-600'}>
                        <strong>Ganhos:</strong> {formatarMoedaInvestimento(investimento.ganhos)}
                      </span>
                    )}
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <strong>Saldo Total:</strong> {formatarMoedaInvestimento(
                      Math.abs(investimento.valor) + (investimento.ganhos || 0)
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {onEditar && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (onEditar) {
                        const { id, ...transacaoSemId } = investimento;
                        onEditar(id, transacaoSemId);
                      }
                    }}
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
  );
};

export default InvestmentsList;
