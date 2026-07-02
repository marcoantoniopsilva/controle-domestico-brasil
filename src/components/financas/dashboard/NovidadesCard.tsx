import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, X, Wallet, Target, Repeat } from "lucide-react";

const STORAGE_KEY = "novidades-card-dismissed-v1";

export function NovidadesCard() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) !== "true") setVisible(true);
  }, []);

  const fechar = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  };

  if (!visible) return null;

  const itens = [
    {
      icone: <Wallet className="h-4 w-4 text-primary" />,
      titulo: "Contas bancárias",
      texto:
        "Cadastre suas contas (corrente, poupança, carteira) em 'Contas' e acompanhe o saldo real consolidado no dashboard.",
    },
    {
      icone: <Target className="h-4 w-4 text-primary" />,
      titulo: "Metas e reservas",
      texto:
        "Crie metas financeiras (reserva de emergência, viagem, compra) e registre aportes em 'Metas' para acompanhar o progresso.",
    },
    {
      icone: <Repeat className="h-4 w-4 text-primary" />,
      titulo: "Lançamentos recorrentes",
      texto:
        "Configure despesas e receitas fixas em 'Recorrentes' — o app cria os lançamentos automaticamente na frequência escolhida.",
    },
  ];

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-primary" />
          Novidades no app
        </CardTitle>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={fechar} aria-label="Fechar novidades">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-3">
        {itens.map((i) => (
          <div key={i.titulo} className="rounded-lg border bg-background/60 p-3 space-y-1">
            <div className="flex items-center gap-2">
              {i.icone}
              <p className="text-sm font-medium">{i.titulo}</p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{i.texto}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}