import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { CardSelector } from "@/components/financas/form/CardSelector";

const Preferencias = () => {
  const { usuario } = useAuth();
  const { preferences, loading, update } = useUserPreferences(usuario?.id);
  const [cycleDay, setCycleDay] = useState<number>(25);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [responsaveis, setResponsaveis] = useState<string[]>([]);
  const [responsavelPadrao, setResponsavelPadrao] = useState<string>("");
  const [novoResponsavel, setNovoResponsavel] = useState<string>("");
  const [savingResp, setSavingResp] = useState(false);
  const [cartaoPadraoId, setCartaoPadraoId] = useState<string | null>(null);
  const [savingCartao, setSavingCartao] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setCycleDay(preferences.cycleStartDay);
  }, [preferences.cycleStartDay]);

  useEffect(() => {
    setResponsaveis(preferences.responsaveis || []);
    setResponsavelPadrao(preferences.responsavelPadrao || (preferences.responsaveis?.[0] ?? ""));
  }, [preferences.responsaveis, preferences.responsavelPadrao]);

  useEffect(() => {
    setCartaoPadraoId(preferences.cartaoPadraoId ?? null);
  }, [preferences.cartaoPadraoId]);

  const saveCartaoPadrao = async () => {
    setSavingCartao(true);
    const ok = await update({ cartaoPadraoId });
    setSavingCartao(false);
    if (ok) toast.success("Cartão padrão atualizado.");
    else toast.error("Não foi possível salvar.");
  };

  const save = async () => {
    setSaving(true);
    const ok = await update({ cycleStartDay: cycleDay });
    setSaving(false);
    if (ok) {
      toast.success("Preferências salvas. Os ciclos foram reagrupados.");
    } else {
      toast.error("Não foi possível salvar");
    }
  };

  const renameResponsavel = (index: number, novoNome: string) => {
    setResponsaveis((prev) => prev.map((n, i) => (i === index ? novoNome : n)));
  };

  const removeResponsavel = (index: number) => {
    setResponsaveis((prev) => {
      if (prev.length <= 1) {
        toast.error("É necessário ter pelo menos um responsável.");
        return prev;
      }
      const removido = prev[index];
      const novaLista = prev.filter((_, i) => i !== index);
      if (responsavelPadrao === removido) {
        setResponsavelPadrao(novaLista[0]);
      }
      return novaLista;
    });
  };

  const addResponsavel = () => {
    const nome = novoResponsavel.trim();
    if (!nome) return;
    if (nome.length > 40) {
      toast.error("Nome muito longo (máx. 40 caracteres).");
      return;
    }
    if (responsaveis.length >= 5) {
      toast.error("Limite de 5 responsáveis.");
      return;
    }
    if (responsaveis.some((n) => n.toLowerCase() === nome.toLowerCase())) {
      toast.error("Esse nome já está na lista.");
      return;
    }
    setResponsaveis((prev) => [...prev, nome]);
    setNovoResponsavel("");
  };

  const saveResponsaveis = async () => {
    const limpa = responsaveis.map((n) => n.trim()).filter(Boolean);
    if (limpa.length === 0) {
      toast.error("É necessário ter pelo menos um responsável.");
      return;
    }
    const duplicados = new Set<string>();
    for (const n of limpa) {
      const k = n.toLowerCase();
      if (duplicados.has(k)) {
        toast.error("Há nomes duplicados na lista.");
        return;
      }
      duplicados.add(k);
    }
    const padrao = limpa.includes(responsavelPadrao) ? responsavelPadrao : limpa[0];
    setSavingResp(true);
    const ok = await update({ responsaveis: limpa, responsavelPadrao: padrao });
    setSavingResp(false);
    if (ok) {
      toast.success("Responsáveis atualizados.");
    } else {
      toast.error("Não foi possível salvar os responsáveis.");
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase.functions.invoke("delete-account");
      if (error) throw error;
      toast.success("Conta excluída com sucesso.");
      await supabase.auth.signOut();
      navigate("/");
    } catch (e: any) {
      toast.error("Erro ao excluir conta: " + (e?.message ?? "desconhecido"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-3 md:px-6 py-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Preferências</CardTitle>
            <CardDescription>Configure o ciclo financeiro e outras opções.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="cycleDay">Dia de virada do ciclo (1 a 28)</Label>
              <Input
                id="cycleDay"
                type="number"
                min={1}
                max={28}
                disabled={loading}
                value={cycleDay}
                onChange={(e) => setCycleDay(Math.max(1, Math.min(28, Number(e.target.value) || 1)))}
                className="w-32"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Ciclo: dia {cycleDay} → dia {cycleDay === 1 ? 28 : cycleDay - 1} do mês seguinte. Mudar o dia
                reagrupa visualmente os ciclos passados, sem alterar lançamentos.
              </p>
            </div>
            <Button onClick={save} disabled={saving || loading}>
              Salvar
            </Button>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Responsáveis pelos lançamentos</CardTitle>
            <CardDescription>
              Defina quem aparece no campo "Quem realizou" ao criar um lançamento. O responsável padrão
              vem pré-selecionado em cada novo lançamento, mas pode ser alterado a cada um. Lançamentos
              já existentes não são afetados.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {responsaveis.map((nome, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    value={nome}
                    onChange={(e) => renameResponsavel(idx, e.target.value)}
                    maxLength={40}
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeResponsavel(idx)}
                    disabled={loading || responsaveis.length <= 1}
                    aria-label="Remover"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Input
                placeholder="Adicionar novo responsável"
                value={novoResponsavel}
                onChange={(e) => setNovoResponsavel(e.target.value)}
                maxLength={40}
                disabled={loading || responsaveis.length >= 5}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addResponsavel(); } }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addResponsavel}
                disabled={loading || !novoResponsavel.trim() || responsaveis.length >= 5}
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Responsável padrão</Label>
              <Select
                value={responsavelPadrao}
                onValueChange={setResponsavelPadrao}
                disabled={loading || responsaveis.length === 0}
              >
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {responsaveis.filter((n) => n.trim()).map((nome) => (
                    <SelectItem key={nome} value={nome}>{nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={saveResponsaveis} disabled={savingResp || loading}>
              {savingResp ? "Salvando..." : "Salvar responsáveis"}
            </Button>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Cartão padrão</CardTitle>
            <CardDescription>
              Quando definido, será pré-selecionado automaticamente em todos os novos lançamentos
              de despesa (manuais ou via importação). Você pode trocar ou remover na hora de salvar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <CardSelector
              cartaoId={cartaoPadraoId}
              onChange={setCartaoPadraoId}
              label="Cartão padrão para novos lançamentos"
            />
            <Button onClick={saveCartaoPadrao} disabled={savingCartao || loading}>
              {savingCartao ? "Salvando..." : "Salvar cartão padrão"}
            </Button>
          </CardContent>
        </Card>

        <Card className="mt-6 border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Zona de perigo</CardTitle>
            <CardDescription>
              Excluir sua conta apaga permanentemente todos os seus lançamentos, categorias,
              orçamentos, simulações e configurações. Esta ação não pode ser desfeita.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog onOpenChange={(open) => { if (!open) setConfirmText(""); }}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Excluir minha conta</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar exclusão da conta</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação é irreversível. Todos os seus dados serão apagados permanentemente.
                    Digite <strong>EXCLUIR</strong> abaixo para confirmar.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Digite EXCLUIR"
                />
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={confirmText !== "EXCLUIR" || deleting}
                    onClick={(e) => { e.preventDefault(); handleDeleteAccount(); }}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleting ? "Excluindo..." : "Excluir definitivamente"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Preferencias;