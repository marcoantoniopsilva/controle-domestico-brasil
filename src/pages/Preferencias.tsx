import { useEffect, useState } from "react";
import NavBar from "@/components/layout/NavBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { toast } from "sonner";

const Preferencias = () => {
  const { usuario } = useAuth();
  const { preferences, loading, update } = useUserPreferences(usuario?.id);
  const [cycleDay, setCycleDay] = useState<number>(25);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setCycleDay(preferences.cycleStartDay);
  }, [preferences.cycleStartDay]);

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

  return (
    <div className="min-h-screen">
      <NavBar />
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
      </div>
    </div>
  );
};

export default Preferencias;