import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { useCategorias, TipoCategoria, CategoriaDB } from "@/hooks/useCategorias";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatarMoeda } from "@/utils/financas";

const tipos: TipoCategoria[] = ["despesa", "receita", "investimento"];

const Categorias = () => {
  const {
    categorias, grupos, loading,
    createCategoria, updateCategoria, deleteCategoria, countLancamentos,
    createGrupo, updateGrupo, deleteGrupo,
  } = useCategorias();

  const [editingCat, setEditingCat] = useState<CategoriaDB | null>(null);
  const [creatingTipo, setCreatingTipo] = useState<TipoCategoria | null>(null);
  const [groupDialog, setGroupDialog] = useState<{ id?: string; nome: string; icone: string } | null>(null);

  const byTipo = (t: TipoCategoria) => categorias.filter(c => c.tipo === t);

  const handleSaveCat = async (form: { nome: string; tipo: TipoCategoria; orcamento: number; grupo_id: string | null }) => {
    if (!form.nome.trim()) {
      toast.error("Nome obrigatório");
      return;
    }
    if (editingCat) {
      const oldName = editingCat.nome;
      const ok = await updateCategoria(
        editingCat.id,
        { nome: form.nome.trim(), orcamento: form.orcamento, grupo_id: form.grupo_id, tipo: form.tipo },
        oldName !== form.nome.trim() ? { renameInLancamentos: { oldName, tipo: editingCat.tipo } } : undefined
      );
      if (ok) {
        toast.success("Categoria atualizada");
        setEditingCat(null);
      }
    } else if (creatingTipo) {
      const ok = await createCategoria({
        nome: form.nome.trim(), tipo: creatingTipo, orcamento: form.orcamento,
        grupo_id: form.grupo_id, ordem: 99, ativa: true, is_default: false,
      });
      if (ok) {
        toast.success("Categoria criada");
        setCreatingTipo(null);
      }
    }
  };

  const handleDelete = async (c: CategoriaDB) => {
    const count = await countLancamentos(c.nome, c.tipo);
    if (count > 0) {
      const opcoes = categorias.filter(x => x.tipo === c.tipo && x.id !== c.id);
      const novoNome = prompt(
        `Esta categoria tem ${count} lançamento(s). Digite o nome de outra categoria do mesmo tipo para migrar os lançamentos, ou cancele.\nOpções: ${opcoes.map(o => o.nome).join(", ")}`
      );
      if (!novoNome) return;
      const destino = opcoes.find(o => o.nome === novoNome.trim());
      if (!destino) {
        toast.error("Categoria não encontrada");
        return;
      }
      await deleteCategoria(c.id, { migrateTo: destino.nome, nome: c.nome, tipo: c.tipo });
      toast.success(`Lançamentos migrados para "${destino.nome}"`);
    } else {
      if (!confirm(`Excluir a categoria "${c.nome}"?`)) return;
      await deleteCategoria(c.id);
      toast.success("Categoria excluída");
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-3 md:px-6 py-6 max-w-5xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Categorias e grupos</CardTitle>
            <CardDescription>
              Crie, renomeie ou exclua categorias. Renomeações são propagadas para os lançamentos existentes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Carregando…</p>
            ) : (
              <Tabs defaultValue="despesa">
                <TabsList>
                  {tipos.map(t => (
                    <TabsTrigger key={t} value={t} className="capitalize">{t}s</TabsTrigger>
                  ))}
                  <TabsTrigger value="grupos">Grupos</TabsTrigger>
                </TabsList>

                {tipos.map(t => (
                  <TabsContent key={t} value={t} className="space-y-3 mt-4">
                    <div className="flex justify-end">
                      <Button size="sm" onClick={() => setCreatingTipo(t)}>
                        <Plus className="h-4 w-4 mr-1" /> Nova categoria
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {byTipo(t).map(c => (
                        <div key={c.id} className="flex items-center gap-2 p-2 border rounded-md">
                          <div className="flex-1">
                            <div className="font-medium">{c.nome}</div>
                            <div className="text-xs text-muted-foreground">
                              {grupos.find(g => g.id === c.grupo_id)?.nome ?? "Sem grupo"}
                              {t === "despesa" && (
                                <> · Orçamento: {formatarMoeda(Number(c.orcamento))}</>
                              )}
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => setEditingCat(c)} aria-label="Editar">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(c)} aria-label="Excluir">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                ))}

                <TabsContent value="grupos" className="space-y-3 mt-4">
                  <div className="flex justify-end">
                    <Button size="sm" onClick={() => setGroupDialog({ nome: "", icone: "Folder" })}>
                      <Plus className="h-4 w-4 mr-1" /> Novo grupo
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {grupos.map(g => (
                      <div key={g.id} className="flex items-center gap-2 p-2 border rounded-md">
                        <div className="flex-1">
                          <div className="font-medium">{g.nome}</div>
                          <div className="text-xs text-muted-foreground">Ícone: {g.icone}</div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setGroupDialog({ id: g.id, nome: g.nome, icone: g.icone })}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost" size="icon"
                          onClick={async () => {
                            if (!confirm(`Excluir o grupo "${g.nome}"? As categorias dele ficarão sem grupo.`)) return;
                            await deleteGrupo(g.id);
                            toast.success("Grupo excluído");
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>

      <CategoriaDialog
        open={!!editingCat || !!creatingTipo}
        cat={editingCat}
        tipoInicial={creatingTipo}
        grupos={grupos}
        onClose={() => { setEditingCat(null); setCreatingTipo(null); }}
        onSave={handleSaveCat}
      />

      <GrupoDialog
        state={groupDialog}
        onClose={() => setGroupDialog(null)}
        onSave={async ({ id, nome, icone }) => {
          if (!nome.trim()) { toast.error("Nome obrigatório"); return; }
          if (id) {
            await updateGrupo(id, { nome: nome.trim(), icone });
          } else {
            await createGrupo(nome.trim(), icone);
          }
          setGroupDialog(null);
          toast.success("Grupo salvo");
        }}
      />
    </div>
  );
};

function CategoriaDialog({
  open, cat, tipoInicial, grupos, onClose, onSave,
}: {
  open: boolean;
  cat: CategoriaDB | null;
  tipoInicial: TipoCategoria | null;
  grupos: { id: string; nome: string }[];
  onClose: () => void;
  onSave: (form: { nome: string; tipo: TipoCategoria; orcamento: number; grupo_id: string | null }) => void;
}) {
  const initial = useMemo(() => ({
    nome: cat?.nome ?? "",
    tipo: (cat?.tipo ?? tipoInicial ?? "despesa") as TipoCategoria,
    orcamento: Number(cat?.orcamento ?? 0),
    grupo_id: cat?.grupo_id ?? null,
  }), [cat, tipoInicial]);
  const [form, setForm] = useState(initial);
  // reset on open
  useMemoReset(open, () => setForm(initial), [initial.nome, initial.tipo, initial.grupo_id, initial.orcamento]);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{cat ? "Editar categoria" : "Nova categoria"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Nome</Label>
            <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          </div>
          <div>
            <Label>Grupo</Label>
            <Select
              value={form.grupo_id ?? "none"}
              onValueChange={(v) => setForm({ ...form, grupo_id: v === "none" ? null : v })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem grupo</SelectItem>
                {grupos.map(g => (
                  <SelectItem key={g.id} value={g.id}>{g.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {form.tipo === "despesa" && (
            <div>
              <Label>Orçamento mensal</Label>
              <Input
                type="number"
                step="0.01"
                value={form.orcamento}
                onChange={(e) => setForm({ ...form, orcamento: Number(e.target.value) || 0 })}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => onSave(form)}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function GrupoDialog({
  state, onClose, onSave,
}: {
  state: { id?: string; nome: string; icone: string } | null;
  onClose: () => void;
  onSave: (form: { id?: string; nome: string; icone: string }) => void;
}) {
  const [form, setForm] = useState({ id: state?.id, nome: state?.nome ?? "", icone: state?.icone ?? "Folder" });
  useMemoReset(!!state, () => setForm({ id: state?.id, nome: state?.nome ?? "", icone: state?.icone ?? "Folder" }), [state?.id, state?.nome, state?.icone]);

  return (
    <Dialog open={!!state} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{state?.id ? "Editar grupo" : "Novo grupo"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Nome</Label>
            <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          </div>
          <div>
            <Label>Ícone (Lucide)</Label>
            <Input
              value={form.icone}
              onChange={(e) => setForm({ ...form, icone: e.target.value })}
              placeholder="Ex: Utensils, Car, Heart, Home, Baby"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => onSave(form)}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// helper: reset state when `key` (open) becomes true
import { useEffect } from "react";
function useMemoReset(open: boolean, fn: () => void, deps: any[]) {
  useEffect(() => {
    if (open) fn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, ...deps]);
}

export default Categorias;