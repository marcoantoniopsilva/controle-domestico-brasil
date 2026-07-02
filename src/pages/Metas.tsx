import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Target } from "lucide-react";
import { useMetas } from "@/hooks/useMetas";
import { MetaForm } from "@/components/metas/MetaForm";
import { AporteDialog } from "@/components/metas/AporteDialog";
import { MetaCard } from "@/components/metas/MetaCard";
import { MetaFinanceira } from "@/types";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Metas = () => {
  const {
    metas, loading, progressoPorMeta,
    createMeta, updateMeta, deleteMeta, addAporte,
  } = useMetas();
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<MetaFinanceira | null>(null);
  const [aportando, setAportando] = useState<MetaFinanceira | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<MetaFinanceira | null>(null);

  const handleNew = () => { setEditing(null); setOpenForm(true); };
  const handleEdit = (m: MetaFinanceira) => { setEditing(m); setOpenForm(true); };

  const handleSave = async (
    input: Omit<MetaFinanceira, "id" | "concluida" | "ordem">
  ) => {
    if (editing) return updateMeta(editing.id, input);
    return createMeta(input);
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Target className="h-7 w-7" /> Metas & Reservas
          </h1>
          <p className="text-sm text-muted-foreground">
            Defina objetivos, acompanhe o progresso e receba sugestões de aporte mensal.
          </p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="h-4 w-4 mr-2" /> Nova meta
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : metas.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <Target className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">
              Nenhuma meta cadastrada ainda. Crie sua primeira reserva financeira ou objetivo.
            </p>
            <Button onClick={handleNew}>
              <Plus className="h-4 w-4 mr-2" /> Criar primeira meta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metas.map((m) => (
            <MetaCard
              key={m.id}
              meta={m}
              acumulado={progressoPorMeta.get(m.id) || 0}
              onAportar={() => setAportando(m)}
              onEdit={() => handleEdit(m)}
              onDelete={() => setConfirmDelete(m)}
            />
          ))}
        </div>
      )}

      <MetaForm open={openForm} onOpenChange={setOpenForm} meta={editing} onSave={handleSave} />
      <AporteDialog
        open={!!aportando}
        onOpenChange={(o) => !o && setAportando(null)}
        meta={aportando}
        onSave={async (valor, data, obs) => {
          if (!aportando) return false;
          return addAporte(aportando.id, valor, data, obs);
        }}
      />

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir meta?</AlertDialogTitle>
            <AlertDialogDescription>
              A meta "{confirmDelete?.nome}" e todos os aportes registrados serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (confirmDelete) {
                  await deleteMeta(confirmDelete.id);
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

export default Metas;