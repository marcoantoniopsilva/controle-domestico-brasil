
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AddTransacaoForm from "./AddTransacaoForm";
import { Usuario, Transacao } from "@/types";
import { useState } from "react";

interface DashboardHeaderProps {
  usuario: Usuario;
  onAddTransacao: (transacao: Omit<Transacao, "id">) => Promise<boolean>;
}

export function DashboardHeader({ usuario, onAddTransacao }: DashboardHeaderProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAddTransacao = async (transacao: Omit<Transacao, "id">) => {
    const success = await onAddTransacao(transacao);
    if (success) {
      setDialogOpen(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h1 className="text-2xl font-bold">Olá, {usuario?.nome || "usuário"}!</h1>
        <p className="text-muted-foreground">Bem-vindo ao seu dashboard financeiro</p>
      </div>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button>Adicionar Transação</Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Transação</DialogTitle>
          </DialogHeader>
          <AddTransacaoForm onAddTransacao={handleAddTransacao} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
