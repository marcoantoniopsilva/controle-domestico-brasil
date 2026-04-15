import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { RotateCcw, Save, Calculator } from "lucide-react";
import { formatarMoeda } from "@/utils/financas";
import { useCategoryBudgets } from "@/hooks/useCategoryBudgets";
import { categorias as categoriasDefault } from "@/utils/financas";
import { useToast } from "@/hooks/use-toast";
import { CicloFinanceiro } from "@/types";
import { format } from "date-fns";

interface EditarOrcamentosProps {
  isOpen: boolean;
  onClose: () => void;
  cicloAtual: CicloFinanceiro;
}

export function EditarOrcamentos({ isOpen, onClose, cicloAtual }: EditarOrcamentosProps) {
  const { getCategoriesWithCustomBudgets, saveBudget, resetBudget, loading, customBudgets } = useCategoryBudgets();
  const { toast } = useToast();
  const [editingBudgets, setEditingBudgets] = useState<{ [key: string]: string }>({});
  const [editForCycle, setEditForCycle] = useState(true);

  if (!isOpen) return null;

  const cicloId = format(new Date(cicloAtual.inicio), 'yyyy-MM-dd');
  const activeCicloId = editForCycle ? cicloId : null;

  const categorias = getCategoriesWithCustomBudgets(cicloId);
  
  const categoriasDespesa = categorias.filter(cat => cat.tipo === "despesa");
  const categoriasReceita = categorias.filter(cat => cat.tipo === "receita");
  const categoriasInvestimento = categorias.filter(cat => cat.tipo === "investimento");

  const handleBudgetChange = (categoryName: string, value: string) => {
    setEditingBudgets(prev => ({ ...prev, [categoryName]: value }));
  };

  const handleSaveBudget = async (categoria: any) => {
    const key = categoria.nome;
    const newBudget = editingBudgets[key];
    if (newBudget === undefined || newBudget === "") return;
    
    const budgetValue = parseFloat(newBudget.replace(/[^\d,.-]/g, '').replace(',', '.'));
    if (isNaN(budgetValue) || budgetValue < 0) {
      toast({ title: "Valor inválido", description: "Por favor, insira um valor válido.", variant: "destructive" });
      return;
    }

    const success = await saveBudget(categoria.nome, categoria.tipo, budgetValue, activeCicloId);
    if (success) {
      toast({
        title: "Orçamento salvo",
        description: `Orçamento da categoria "${categoria.nome}" ${editForCycle ? `para ${cicloAtual.nome}` : '(padrão global)'} atualizado.`,
      });
      setEditingBudgets(prev => { const s = { ...prev }; delete s[key]; return s; });
    } else {
      toast({ title: "Erro ao salvar", description: "Não foi possível salvar o orçamento.", variant: "destructive" });
    }
  };

  const handleResetBudget = async (categoria: any) => {
    const success = await resetBudget(categoria.nome, categoria.tipo, activeCicloId);
    if (success) {
      toast({
        title: "Orçamento resetado",
        description: `Orçamento da categoria "${categoria.nome}" ${editForCycle ? `para ${cicloAtual.nome}` : '(padrão global)'} foi resetado.`,
      });
      setEditingBudgets(prev => { const s = { ...prev }; delete s[categoria.nome]; return s; });
    } else {
      toast({ title: "Erro ao resetar", description: "Não foi possível resetar o orçamento.", variant: "destructive" });
    }
  };

  const getDefaultBudget = (categoria: any) => {
    const d = categoriasDefault.find(cat => cat.nome === categoria.nome && cat.tipo === categoria.tipo);
    return d ? d.orcamento : 0;
  };

  const hasCycleOverride = (categoria: any) => {
    return customBudgets.some(
      cb => cb.categoria_nome === categoria.nome && cb.categoria_tipo === categoria.tipo && (cb as any).ciclo_id === cicloId
    );
  };

  const hasGlobalOverride = (categoria: any) => {
    return customBudgets.some(
      cb => cb.categoria_nome === categoria.nome && cb.categoria_tipo === categoria.tipo && (cb as any).ciclo_id === null
    );
  };

  const isCustomBudget = (categoria: any) => {
    return categoria.orcamento !== getDefaultBudget(categoria);
  };

  const renderCategoryList = (categoriesList: any[], title: string) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="space-y-3">
        {categoriesList.map((categoria) => (
          <Card key={categoria.nome} className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="font-medium">{categoria.nome}</span>
                  {hasCycleOverride(categoria) && (
                    <Badge variant="default" className="text-xs">Neste ciclo</Badge>
                  )}
                  {hasGlobalOverride(categoria) && !hasCycleOverride(categoria) && (
                    <Badge variant="secondary" className="text-xs">Padrão personalizado</Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  Atual: {formatarMoeda(categoria.orcamento)}
                  {isCustomBudget(categoria) && (
                    <span className="ml-2">(Padrão código: {formatarMoeda(getDefaultBudget(categoria))})</span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-32"
                  placeholder={categoria.orcamento.toString()}
                  value={editingBudgets[categoria.nome] || ""}
                  onChange={(e) => handleBudgetChange(categoria.nome, e.target.value)}
                />
                <Button size="sm" onClick={() => handleSaveBudget(categoria)} disabled={!editingBudgets[categoria.nome] || loading}>
                  <Save className="h-4 w-4" />
                </Button>
                {((editForCycle && hasCycleOverride(categoria)) || (!editForCycle && hasGlobalOverride(categoria))) && (
                  <Button size="sm" variant="outline" onClick={() => handleResetBudget(categoria)} disabled={loading} title="Resetar">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const totalOrcamentoDespesas = categoriasDespesa.reduce((acc, cat) => acc + cat.orcamento, 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Editar Orçamentos
            </CardTitle>
            <CardDescription>
              {editForCycle 
                ? `Orçamentos para o ciclo: ${cicloAtual.nome}` 
                : "Orçamentos padrão (todos os ciclos)"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="cycle-toggle" className="text-sm whitespace-nowrap">
                {editForCycle ? "Este ciclo" : "Padrão global"}
              </Label>
              <Switch
                id="cycle-toggle"
                checked={editForCycle}
                onCheckedChange={setEditForCycle}
              />
            </div>
            <Button variant="outline" onClick={onClose}>Fechar</Button>
          </div>
        </CardHeader>
        
        <CardContent className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <Tabs defaultValue="despesas" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="despesas">Despesas ({categoriasDespesa.length})</TabsTrigger>
              <TabsTrigger value="receitas">Receitas ({categoriasReceita.length})</TabsTrigger>
              <TabsTrigger value="investimentos">Investimentos ({categoriasInvestimento.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="despesas">
              <div className="space-y-4">
                <Card className="p-4 bg-muted/50">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{formatarMoeda(totalOrcamentoDespesas)}</div>
                    <div className="text-sm text-muted-foreground">Total do Orçamento de Despesas</div>
                  </div>
                </Card>
                {renderCategoryList(categoriasDespesa, "Categorias de Despesa")}
              </div>
            </TabsContent>

            <TabsContent value="receitas">
              {renderCategoryList(categoriasReceita, "Categorias de Receita")}
            </TabsContent>

            <TabsContent value="investimentos">
              {renderCategoryList(categoriasInvestimento, "Categorias de Investimento")}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
