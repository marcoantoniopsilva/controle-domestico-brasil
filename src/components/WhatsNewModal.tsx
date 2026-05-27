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
import { Sparkles, Users, MessageCircle, Camera, CheckCircle2 } from "lucide-react";

const STORAGE_KEY = "whatsnew-v20260527-2";

interface Novidade {
  icone: React.ReactNode;
  titulo: string;
  descricao: string;
}

const novidades: Novidade[] = [
  {
    icone: <Users className="h-5 w-5 text-primary" />,
    titulo: "Responsáveis personalizáveis",
    descricao:
      "Agora você define quem aparece no campo 'Quem realizou'. Adicione os nomes que fizerem sentido pra você (ex: seu nome, seu cônjuge, dependentes) e escolha qual vem pré-selecionado por padrão em cada lançamento.",
  },
  {
    icone: <MessageCircle className="h-5 w-5 text-primary" />,
    titulo: "WhatsApp mais inteligente",
    descricao:
      "O assistente por WhatsApp parou de usar nomes fixos. As mensagens agora se adaptam ao seu perfil, sem mais referências pessoais de outras contas.",
  },
  {
    icone: <Camera className="h-5 w-5 text-primary" />,
    titulo: "Data corrigida na importação por foto",
    descricao:
      "Lançamentos feitos a partir de uma foto da fatura agora registram a data correta do dia em que a foto foi enviada, não mais do dia seguinte.",
  },
  {
    icone: <Sparkles className="h-5 w-5 text-primary" />,
    titulo: "Cadastro de WhatsApp nas preferências",
    descricao:
      "Na tela de Preferências você pode cadastrar seu número do WhatsApp para receber relatórios diários e conversar com o assistente financeiro.",
  },
];

const WhatsNewModal = () => {
  const [open, setOpen] = useState(false);
  const [naoMostrar, setNaoMostrar] = useState(false);

  useEffect(() => {
    const jaViu = localStorage.getItem(STORAGE_KEY);
    if (!jaViu) {
      setOpen(true);
    }
  }, []);

  const fechar = () => {
    if (naoMostrar) {
      localStorage.setItem(STORAGE_KEY, "1");
    }
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
