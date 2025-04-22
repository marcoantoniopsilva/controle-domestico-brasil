
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Transacao } from "@/types";
import { formatarMoeda } from "@/utils/financas";

interface ListaTransacoesProps {
  transacoes: Transacao[];
  onExcluir?: (id: string) => void;
}

const ListaTransacoes: React.FC<ListaTransacoesProps> = ({ transacoes, onExcluir }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Transações Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transacoes.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              Nenhuma transação encontrada
            </div>
          ) : (
            transacoes.map((transacao) => (
              <div
                key={transacao.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex flex-col">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{transacao.categoria}</span>
                    <span className="text-xs text-muted-foreground">
                      • {format(new Date(transacao.data), "dd MMM yyyy", { locale: ptBR })}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {transacao.descricao && <span>{transacao.descricao} • </span>}
                    <span>{transacao.quemGastou}</span>
                    {transacao.parcelas > 1 && 
                      <span> • Parcela 1/{transacao.parcelas}</span>
                    }
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={transacao.valor < 0 ? "text-destructive" : "text-primary"}>
                    {formatarMoeda(transacao.valor)}
                  </span>
                  {onExcluir && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onExcluir(transacao.id)}
                      className="h-8 w-8 p-0"
                    >
                      ✕
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ListaTransacoes;
