import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { DEFAULT_CYCLE_START_DAY, formatarMoeda } from "@/utils/financas";
import NavBar from "@/components/layout/NavBar";
import { Trash2 } from "lucide-react";

interface CatRow {
  id: string;
  nome: string;
  tipo: "despesa" | "receita" | "investimento";
  orcamento: number;
  ativa: boolean;
}

const Onboarding = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [cycleDay, setCycleDay] = useState<number>(DEFAULT_CYCLE_START_DAY);
  const [categorias, setCategorias] = useState<CatRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/login");
        return;
      }
      setUserId(session.user.id);

      const { data: prefs } = await (supabase as any)
        .from("user_preferences")
        .select("cycle_start_day, onboarding_completed")
        .eq("usuario_id", session.user.id)
        .maybeSingle();

      if (prefs?.onboarding_completed) {
        navigate("/dashboard");
        return;
      }
      if (prefs?.cycle_start_day) setCycleDay(prefs.cycle_start_day);

      const { data: cats } = await (supabase as any)
        .from("categorias")
        .select("id, nome, tipo, orcamento, ativa")
        .eq("usuario_id", session.user.id)
        .order("tipo")
        .order("ordem");
      setCategorias(cats || []);
      setLoading(false);
    };
    init();
  }, [navigate]);

  const despesas = useMemo(() => categorias.filter(c => c.tipo === "despesa" && c.ativa), [categorias]);
  const receitas = useMemo(() => categorias.filter(c => c.tipo === "receita" && c.ativa), [categorias]);
  const investimentos = useMemo(() => categorias.filter(c => c.tipo === "investimento" && c.ativa), [categorias]);

  const totalOrcamento = despesas.reduce((s, c) => s + Number(c.orcamento || 0), 0);

  const setCatField = (id: string, field: keyof CatRow, value: any) =>
    setCategorias(prev => prev.map(c => (c.id === id ? { ...c, [field]: value } : c)));

  const removeCat = async (id: string) => {
    if (!confirm("Excluir esta categoria?")) return;
    await (supabase as any).from("categorias").delete().eq("id", id);
    setCategorias(prev => prev.filter(c => c.id !== id));
  };

  const saveCycle = async () => {
    if (!userId) return;
    await (supabase as any)
      .from("user_preferences")
      .upsert({ usuario_id: userId, cycle_start_day: cycleDay }, { onConflict: "usuario_id" });
  };

  const saveBudgets = async () => {
    if (!userId) return;
    const updates = despesas.map(c =>
      (supabase as any).from("categorias").update({ orcamento: Number(c.orcamento) || 0 }).eq("id", c.id)
    );
    await Promise.all(updates);
  };

  const finish = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await saveCycle();
      await saveBudgets();
      await (supabase as any)
        .from("user_preferences")
        .upsert(
          { usuario_id: userId, cycle_start_day: cycleDay, onboarding_completed: true },
          { onConflict: "usuario_id" }
        );
      toast.success("Configuração concluída!");
      navigate("/dashboard");
    } catch (e: any) {
      toast.error("Erro ao salvar: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const skipToDefault = async () => {
    if (!userId) return;
    setSaving(true);
    await (supabase as any)
      .from("user_preferences")
      .upsert(
        { usuario_id: userId, cycle_start_day: DEFAULT_CYCLE_START_DAY, onboarding_completed: true },
        { onConflict: "usuario_id" }
      );
    toast.success("Usando configuração padrão");
    navigate("/dashboard");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando…</div>;
  }

  return (
    <div className="min-h-screen">
      <NavBar />
      <div className="container mx-auto px-3 md:px-6 py-6 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Configuração inicial — passo {step} de 3</CardTitle>
            <CardDescription>
              Defina como você quer organizar suas finanças. Você pode mudar tudo depois.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <div className="space-y-3">
                <h2 className="font-semibold">Dia de virada do ciclo financeiro</h2>
                <p className="text-sm text-muted-foreground">
                  Em que dia do mês seu ciclo financeiro começa? Por exemplo: 25 significa
                  que o ciclo vai do dia 25 de um mês ao dia 24 do mês seguinte.
                </p>
                <div className="flex items-end gap-2">
                  <div>
                    <Label htmlFor="cycleDay">Dia (1 a 28)</Label>
                    <Input
                      id="cycleDay"
                      type="number"
                      min={1}
                      max={28}
                      value={cycleDay}
                      onChange={(e) => setCycleDay(Math.max(1, Math.min(28, Number(e.target.value) || 1)))}
                      className="w-32"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Ciclo: dia {cycleDay} → dia {cycleDay === 1 ? 28 : cycleDay - 1} do mês seguinte.
                  </p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="font-semibold">Categorias</h2>
                <p className="text-sm text-muted-foreground">
                  Renomeie ou remova categorias que não fazem sentido para você. Você poderá criar novas depois.
                </p>
                {(["despesa", "receita", "investimento"] as const).map((tipo) => {
                  const items = categorias.filter(c => c.tipo === tipo && c.ativa);
                  if (!items.length) return null;
                  return (
                    <div key={tipo}>
                      <h3 className="font-medium capitalize mb-2">{tipo}s</h3>
                      <div className="space-y-2">
                        {items.map((c) => (
                          <div key={c.id} className="flex gap-2 items-center">
                            <Input
                              value={c.nome}
                              onChange={(e) => setCatField(c.id, "nome", e.target.value)}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeCat(c.id)}
                              aria-label="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3">
                <h2 className="font-semibold">Orçamento por categoria de despesa</h2>
                <p className="text-sm text-muted-foreground">
                  Defina quanto pretende gastar em cada categoria por ciclo.
                </p>
                <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
                  {despesas.map((c) => (
                    <div key={c.id} className="flex items-center gap-3">
                      <Label className="flex-1 text-sm">{c.nome}</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={c.orcamento}
                        onChange={(e) => setCatField(c.id, "orcamento", Number(e.target.value) || 0)}
                        className="w-32"
                      />
                    </div>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground pt-2 border-t">
                  Total: <strong>{formatarMoeda(totalOrcamento)}</strong>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between gap-2 pt-4 border-t">
              <Button variant="ghost" onClick={skipToDefault} disabled={saving}>
                Usar padrão e começar agora
              </Button>
              <div className="flex gap-2 ml-auto">
                {step > 1 && (
                  <Button variant="outline" onClick={() => setStep(step - 1)} disabled={saving}>
                    Voltar
                  </Button>
                )}
                {step < 3 && (
                  <Button
                    onClick={async () => {
                      if (step === 1) await saveCycle();
                      if (step === 2) {
                        // salvar renomeações
                        await Promise.all(
                          categorias.filter(c => c.ativa).map(c =>
                            (supabase as any).from("categorias").update({ nome: c.nome }).eq("id", c.id)
                          )
                        );
                      }
                      setStep(step + 1);
                    }}
                    disabled={saving}
                  >
                    Avançar
                  </Button>
                )}
                {step === 3 && (
                  <Button onClick={finish} disabled={saving}>
                    Concluir
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;