import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Repeat, PlayCircle, PauseCircle, CalendarClock } from "lucide-react";
import { useRecorrentes } from "@/hooks/useRecorrentes";
import { RecorrenteForm } from "@/components/recorrentes/RecorrenteForm";
import { LancamentoRecorrente } from "@/types";
import { formatarMoeda } from "@/utils/financas";
import { descreverFrequencia, parseLocalDate } from "@/utils/recorrencias";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Recorrentes = () => {
  const { recorrentes, loading, create, update, remove, toggleAtivo, refetch } = useRecorrentes();
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<LancamentoRecorrente | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<LancamentoRecorrente | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSave = async (input: Omit<LancamentoRecorrente, "id" | "ultimaExecucao">) => {
    if (editing) return update(editing.id, input);
    return create(input);
  };

  const processarAgora = async () => {
    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("processar-recorrentes", { body: {} });
      if (error) throw error;
      const criados = (data as any)?.criados ?? 0;
      toast.success(criados > 0 ? `${criados} lançamento(s) gerado(s)` : "Nada pendente no momento");
      await refetch();
    } catch (e: any) {
      toast.error("Erro ao processar: " + (e.message || e));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Repeat className="h-7 w-7" /> Lançamentos recorrentes
          </h1>
          <p className="text-sm text-muted-foreground">
            Automatize assinaturas, salário, aluguel e outras cobranças fixas.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={processarAgora} disabled={processing}>
            <CalendarClock className="h-4 w-4 mr-2" />
            {processing ? "Processando..." : "Processar agora"}
          </Button>
          <Button onClick={() => { setEditing(null); setOpenForm(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Nova
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : recorrentes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <Repeat className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">Nenhuma recorrência cadastrada.</p>
            <Button onClick={() => { setEditing(null); setOpenForm(true); }}>
              <Plus className="h-4 w-4 mr-2" /> Criar primeira
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recorrentes.map((r) => {
            const prox = parseLocalDate(r.proximaExecucao).toLocaleDateString("pt-BR");
            const valorAbs = Math.abs(r.valor);
            const cor = r.tipo === "receita" ? "text-green-600" : r.tipo === "despesa" ? "text-destructive" : "";
            return (
              <Card key={r.id} className={!r.ativo ? "opacity-60" : ""}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold truncate">{r.descricao}</p>
                        <Badge variant="outline" className="text-xs">{r.categoria}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {descreverFrequencia(r)}
                      </p>
                      <p className={`text-xl font-bold mt-1 ${cor}`}>
                        {r.tipo === "despesa" ? "-" : "+"}{formatarMoeda(valorAbs)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Próxima execução: <span className="font-medium text-foreground">{prox}</span>
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setEditing(r); setOpenForm(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setConfirmDelete(r)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        {r.ativo ? <PlayCircle className="h-4 w-4 text-green-600" /> : <PauseCircle className="h-4 w-4 text-muted-foreground" />}
                        <Switch checked={r.ativo} onCheckedChange={() => toggleAtivo(r)} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <RecorrenteForm open={openForm} onOpenChange={setOpenForm} recorrente={editing} onSave={handleSave} />

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir recorrência?</AlertDialogTitle>
            <AlertDialogDescription>
              "{confirmDelete?.descricao}" será removida. Lançamentos já gerados não serão apagados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              if (confirmDelete) { await remove(confirmDelete.id); setConfirmDelete(null); }
            }}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Recorrentes;