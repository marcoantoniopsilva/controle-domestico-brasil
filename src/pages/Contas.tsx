import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Wallet } from "lucide-react";
import { useContas, TIPOS_CONTA } from "@/hooks/useContas";
import { useTransacoes } from "@/hooks/useTransacoes";
import { ContaForm } from "@/components/contas/ContaForm";
import { AccountSelector } from "@/components/financas/form/AccountSelector";
import { ContaBancaria } from "@/types";
import { formatarMoeda } from "@/utils/financas";
import { calcularSaldoConta, calcularSaldoTotal } from "@/utils/saldoContas";
import { useAuth } from "@/hooks/useAuth";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function tipoLabel(t: string) {
  return TIPOS_CONTA.find((x) => x.value === t)?.label || t;
}

const Contas = () => {
  const { contas, loading, createConta, updateConta, deleteConta } = useContas();
  const { transacoes } = useTransacoes();
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<ContaBancaria | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ContaBancaria | null>(null);
  const { usuario } = useAuth();
  const { preferences, loading: loadingPrefs, update } = useUserPreferences(usuario?.id);
  const [contaPadraoId, setContaPadraoId] = useState<string | null>(null);
  const [savingPadrao, setSavingPadrao] = useState(false);

  useEffect(() => {
    setContaPadraoId(preferences.contaPadraoId ?? null);
  }, [preferences.contaPadraoId]);

  const saveContaPadrao = async () => {
    setSavingPadrao(true);
    const ok = await update({ contaPadraoId });
    setSavingPadrao(false);
    if (ok) toast.success("Conta padrão atualizada.");
    else toast.error("Não foi possível salvar.");
  };

  const saldoTotal = calcularSaldoTotal(contas, transacoes);

  const handleSave = async (input: Omit<ContaBancaria, "id">) => {
    if (editing) return updateConta(editing.id, input);
    return createConta(input);
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Wallet className="h-7 w-7" /> Contas bancárias
          </h1>
          <p className="text-sm text-muted-foreground">
            Cadastre contas correntes, poupanças, carteiras e dinheiro para acompanhar o saldo real.
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setOpenForm(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Nova conta
        </Button>
      </div>

      {contas.length > 0 && (
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
          <CardHeader className="pb-2">
            <CardDescription>Saldo consolidado</CardDescription>
            <CardTitle className="text-3xl">{formatarMoeda(saldoTotal)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Soma de todas as contas marcadas como "incluir no saldo". Considera saldo inicial + receitas − despesas.
            </p>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : contas.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <Wallet className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">Nenhuma conta cadastrada ainda.</p>
            <Button onClick={() => { setEditing(null); setOpenForm(true); }}>
              <Plus className="h-4 w-4 mr-2" /> Cadastrar primeira conta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contas.map((c) => {
            const saldo = calcularSaldoConta(c, transacoes);
            return (
              <Card key={c.id} className={!c.ativo ? "opacity-60" : ""}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: c.cor }}
                      >
                        <Wallet className="h-6 w-6 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{c.nome}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {[tipoLabel(c.tipo), c.banco].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(c); setOpenForm(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setConfirmDelete(c)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <div className="rounded-md bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Saldo atual</p>
                    <p className={`text-xl font-semibold ${saldo < 0 ? "text-destructive" : ""}`}>
                      {formatarMoeda(saldo)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Inicial: {formatarMoeda(c.saldoInicial)}
                    </p>
                  </div>
                  {!c.incluirNoSaldo && (
                    <p className="text-xs text-muted-foreground italic">Não incluída no saldo consolidado</p>
                  )}
                  {!c.ativo && <p className="text-xs text-muted-foreground italic">Inativa</p>}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ContaForm open={openForm} onOpenChange={setOpenForm} conta={editing} onSave={handleSave} />

      {contas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Conta padrão</CardTitle>
            <CardDescription>
              Quando definida, será pré-selecionada automaticamente em todos os novos lançamentos
              (manuais ou via importação). Você pode trocar ou remover na hora de salvar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AccountSelector
              contaId={contaPadraoId}
              onChange={setContaPadraoId}
              label="Conta padrão para novos lançamentos"
            />
            <Button onClick={saveContaPadrao} disabled={savingPadrao || loadingPrefs}>
              {savingPadrao ? "Salvando..." : "Salvar conta padrão"}
            </Button>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conta?</AlertDialogTitle>
            <AlertDialogDescription>
              A conta "{confirmDelete?.nome}" será removida. Lançamentos associados ficarão sem conta (não serão excluídos).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (confirmDelete) {
                  await deleteConta(confirmDelete.id);
                  setConfirmDelete(null);
                }
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Contas;
