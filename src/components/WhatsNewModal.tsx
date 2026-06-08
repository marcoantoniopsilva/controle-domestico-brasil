import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Sparkles, CreditCard, PlusCircle, BarChart3, CheckCircle2, Target } from "lucide-react";

const STORAGE_KEY = "whatsnew-v20260608-cartoes";
// Pop-up reaparece por 3 dias mesmo sem marcar "não mostrar"
const DIAS_EXIBICAO = 3;

interface Novidade {
  icone: React.ReactNode;
  titulo: string;
  descricao: string;
}

const novidades: Novidade[] = [
  {
    icone: <CreditCard className="h-5 w-5 text-primary" />,
    titulo: "Cadastro de cartões de crédito",
    descricao:
      "Acesse o menu lateral em 'Cartões' para cadastrar seus cartões com apelido, bandeira, banco, cor, dia de fechamento e dia de vencimento. Você pode cadastrar quantos quiser.",
  },
  {
    icone: <PlusCircle className="h-5 w-5 text-primary" />,
    titulo: "Associe lançamentos a um cartão",
    descricao:
      "Ao adicionar uma nova despesa (manual ou pela importação de extrato/foto), aparece um seletor de cartão. O campo é opcional — lançamentos antigos continuam sem cartão e podem ser editados depois caso queira atribuir.",
  },
  {
    icone: <BarChart3 className="h-5 w-5 text-primary" />,
    titulo: "Relatório por fatura do cartão",
    descricao:
      "No relatório de Cartão de Crédito você alterna entre 'Todos os cartões' (visão do ciclo financeiro) e um cartão específico, que mostra os gastos agrupados pela fatura (do fechamento ao fechamento).",
  },
  {
    icone: <Target className="h-5 w-5 text-primary" />,
    titulo: "Metas independentes por cartão",
    descricao:
      "Defina, se quiser, uma meta mensal de consumo para cada cartão. As metas são independentes dos orçamentos por categoria — funcionam como um teto adicional só para acompanhar o uso do cartão.",
  },
];

const WhatsNewModal = () => {
  const [open, setOpen] = useState(false);
  const [naoMostrar, setNaoMostrar] = useState(false);

  useEffect(() => {
    const registro = localStorage.getItem(STORAGE_KEY);
    if (!registro) {
      // Primeira vez: registra timestamp e abre
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ firstSeen: Date.now(), dismissed: false }));
      setOpen(true);
      return;
    }
    try {
      const parsed = JSON.parse(registro);
      if (parsed.dismissed) return;
      const diasPassados = (Date.now() - parsed.firstSeen) / (1000 * 60 * 60 * 24);
      if (diasPassados < DIAS_EXIBICAO) {
        setOpen(true);
      }
    } catch {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ firstSeen: Date.now(), dismissed: false }));
      setOpen(true);
    }
  }, []);

  const fechar = () => {
    const registro = localStorage.getItem(STORAGE_KEY);
    let firstSeen = Date.now();
    try {
      if (registro) firstSeen = JSON.parse(registro).firstSeen ?? firstSeen;
    } catch {}
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ firstSeen, dismissed: naoMostrar })
    );
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) fechar(); }}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-primary" />
            Novidades do dia
          </DialogTitle>
          <DialogDescription>
            Veja o que mudou e ficou melhor no app hoje.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2 max-h-[60vh] overflow-y-auto pr-1">
          {novidades.map((item, idx) => (
            <div
              key={idx}
              className="flex gap-3 rounded-lg border p-3 bg-muted/30"
            >
              <div className="mt-0.5 shrink-0">{item.icone}</div>
              <div className="space-y-1">
                <p className="font-medium text-sm leading-tight">{item.titulo}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.descricao}
                </p>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mt-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="nao-mostrar"
              checked={naoMostrar}
              onCheckedChange={(v) => setNaoMostrar(!!v)}
            />
            <Label htmlFor="nao-mostrar" className="text-sm cursor-pointer">
              Não mostrar novamente
            </Label>
          </div>
          <Button onClick={fechar} className="gap-1">
            <CheckCircle2 className="h-4 w-4" />
            Entendi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WhatsNewModal;
