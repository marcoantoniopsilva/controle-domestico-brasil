import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Pencil, Trash2, CreditCard } from "lucide-react";
import { useCartoes } from "@/hooks/useCartoes";
import { CartaoForm } from "@/components/cartoes/CartaoForm";
import { CartaoIcone, getBancoLabel, getBandeiraLabel } from "@/utils/cardIcons";
import { CartaoCredito } from "@/types";
import { formatarMoeda } from "@/utils/financas";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Cartoes = () => {
  const { cartoes, loading, createCartao, updateCartao, deleteCartao } = useCartoes();
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<CartaoCredito | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<CartaoCredito | null>(null);

  const handleNew = () => {
    setEditing(null);
    setOpenForm(true);
  };

  const handleEdit = (c: CartaoCredito) => {
    setEditing(c);
    setOpenForm(true);
  };

  const handleSave = async (input: Omit<CartaoCredito, "id">) => {
    if (editing) return updateCartao(editing.id, input);
    return createCartao(input);
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <CreditCard className="h-7 w-7" /> Cartões de Crédito
          </h1>
          <p className="text-sm text-muted-foreground">
            Cadastre seus cartões para associar lançamentos e acompanhar gastos por fatura.
          </p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="h-4 w-4 mr-2" /> Novo cartão
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : cartoes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <CreditCard className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">Nenhum cartão cadastrado ainda.</p>
            <Button onClick={handleNew}>
              <Plus className="h-4 w-4 mr-2" /> Cadastrar primeiro cartão
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cartoes.map((c) => (
            <Card key={c.id} className={!c.ativo ? "opacity-60" : ""}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <CartaoIcone banco={c.banco} bandeira={c.bandeira} cor={c.cor} size={48} />
                    <div>
                      <p className="font-semibold">{c.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {[getBancoLabel(c.banco), getBandeiraLabel(c.bandeira)].filter(Boolean).join(" · ") || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(c)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setConfirmDelete(c)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-md bg-muted/50 p-2">
                    <p className="text-xs text-muted-foreground">Fechamento</p>
                    <p className="font-medium">Dia {c.diaFechamento}</p>
                  </div>
                  <div className="rounded-md bg-muted/50 p-2">
                    <p className="text-xs text-muted-foreground">Vencimento</p>
                    <p className="font-medium">Dia {c.diaVencimento}</p>
                  </div>
                </div>

                {c.metaMensal != null && c.metaMensal > 0 && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Meta mensal: </span>
                    <span className="font-medium">{formatarMoeda(c.metaMensal)}</span>
                  </div>
                )}

                {!c.ativo && (
                  <p className="text-xs text-muted-foreground italic">Inativo</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CartaoForm
        open={openForm}
        onOpenChange={setOpenForm}
        cartao={editing}
        onSave={handleSave}
      />

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cartão?</AlertDialogTitle>
            <AlertDialogDescription>
              O cartão "{confirmDelete?.nome}" será removido. Lançamentos associados ficarão sem cartão (não serão excluídos).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (confirmDelete) {
                  await deleteCartao(confirmDelete.id);
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

export default Cartoes;