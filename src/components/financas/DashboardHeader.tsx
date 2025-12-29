import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AddTransacaoForm from "./AddTransacaoForm";
import { EditarOrcamentos } from "./EditarOrcamentos";
import { ImportarLancamentos } from "./ImportarLancamentos";
import { Usuario, Transacao } from "@/types";
import { useState } from "react";
import { Settings, Camera } from "lucide-react";

interface DashboardHeaderProps {
  usuario: Usuario;
  onAddTransacao: (transacao: Omit<Transacao, "id">) => Promise<boolean>;
}

export function DashboardHeader({ usuario, onAddTransacao }: DashboardHeaderProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [budgetsOpen, setBudgetsOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const handleAddTransacao = async (transacao: Omit<Transacao, "id">): Promise<boolean> => {
    const success = await onAddTransacao(transacao);
    if (success) {
      setDialogOpen(false);
    }
    return success;
  };

  const handleImportarTransacoes = async (transacoes: Array<Omit<Transacao, "id">>): Promise<boolean> => {
    console.log(`[DashboardHeader] Importando ${transacoes.length} transações...`);
    let allSuccess = true;
    for (const transacao of transacoes) {
      console.log(`[DashboardHeader] Adicionando transação:`, transacao);
      const success = await onAddTransacao(transacao);
      if (!success) {
        console.error(`[DashboardHeader] Falha ao adicionar transação:`, transacao);
        allSuccess = false;
      }
    }
    console.log(`[DashboardHeader] Resultado final: ${allSuccess ? 'sucesso' : 'com erros'}`);
    return allSuccess;
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-8 gap-3 md:gap-4">
      <div>
        <h1 className="text-lg md:text-2xl font-bold">Olá, {usuario?.nome || "usuário"}!</h1>
        <p className="text-sm md:text-base text-muted-foreground">Bem-vindo ao seu dashboard</p>
      </div>
      
      <div className="flex flex-wrap gap-1.5 md:gap-2 w-full md:w-auto">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setImportOpen(true)}
          className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-4"
        >
          <Camera className="h-3 w-3 md:h-4 md:w-4" />
          <span className="hidden sm:inline">Importar</span> Extrato
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setBudgetsOpen(true)}
          className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-4"
        >
          <Settings className="h-3 w-3 md:h-4 md:w-4" />
          <span className="hidden sm:inline">Editar</span> Orçamentos
        </Button>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="text-xs md:text-sm px-2 md:px-4">+ Transação</Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] md:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Transação</DialogTitle>
            </DialogHeader>
            <AddTransacaoForm onAddTransacao={handleAddTransacao} />
          </DialogContent>
        </Dialog>
      </div>
      
      <EditarOrcamentos 
        isOpen={budgetsOpen} 
        onClose={() => setBudgetsOpen(false)} 
      />

      <ImportarLancamentos
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        onImportar={handleImportarTransacoes}
      />
    </div>
  );
}
