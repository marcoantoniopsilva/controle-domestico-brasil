import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Categoria } from "@/types";
import { formatarMoeda } from "@/utils/financas";
import { CategoryGroup } from "@/utils/categoryGroups";
import { ChevronDown, ChevronUp, AlertTriangle, ExternalLink } from "lucide-react";
import { getCategoryIcon } from "@/utils/categoryIcons";

interface GrupoCategoriasCardProps {
  group: CategoryGroup;
  categorias: Categoria[];
  onCategoryClick?: (categoria: string, ciclo: string, valor: number) => void;
  cicloNome?: string;
}

const GrupoCategoriasCard = ({ group, categorias, onCategoryClick, cicloNome }: GrupoCategoriasCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const categoriasDoGrupo = categorias.filter(
    (cat) => group.categorias.includes(cat.nome) && cat.tipo === "despesa"
  );

  const totalGasto = categoriasDoGrupo.reduce((sum, cat) => sum + (cat.gastosAtuais || 0), 0);
  const totalOrcamento = categoriasDoGrupo.reduce((sum, cat) => sum + (cat.orcamento || 0), 0);
  const restante = totalOrcamento - totalGasto;
  const isOverBudget = totalGasto > totalOrcamento;
  const percentual = totalOrcamento > 0 ? Math.min((totalGasto / totalOrcamento) * 100, 100) : 0;

  const getProgressColor = () => {
    if (isOverBudget) return "bg-red-500";
    if (percentual >= 80) return "bg-amber-500";
    return "bg-primary";
  };

  const GroupIcon = group.icon;

  const handleCategoryClick = (cat: Categoria, e: React.MouseEvent) => {
    e.stopPropagation();
    if (cat.gastosAtuais > 0 && onCategoryClick && cicloNome) {
      onCategoryClick(cat.nome, cicloNome, cat.gastosAtuais);
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="transition-all duration-200 hover:shadow-md">
        <CollapsibleTrigger asChild>
          <div className="cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GroupIcon className="h-4 w-4 text-muted-foreground" />
                  <span>{group.nome}</span>
                </div>
                <div className="flex items-center gap-1">
                  {isOverBudget && <AlertTriangle className="h-4 w-4 text-red-600" />}
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Gasto</span>
                <span className="font-medium">{formatarMoeda(totalGasto)}</span>
              </div>

              <Progress
                value={percentual}
                className="h-2"
                style={{ ["--progress-color" as string]: getProgressColor() }}
              />

              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Orçamento</span>
                <span className="font-medium">{formatarMoeda(totalOrcamento)}</span>
              </div>

              <div className="text-xs text-center">
                {isOverBudget ? (
                  <span className="text-red-600 font-medium">
                    Excedido: {formatarMoeda(Math.abs(restante))}
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    Restante: {formatarMoeda(restante)}
                  </span>
                )}
              </div>
            </CardContent>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 border-t">
            <div className="space-y-3 pt-3">
              {categoriasDoGrupo.map((cat) => {
                const catPercent = cat.orcamento > 0
                  ? Math.min((cat.gastosAtuais / cat.orcamento) * 100, 100)
                  : 0;
                const CatIcon = getCategoryIcon(cat.nome);
                const isClickable = cat.gastosAtuais > 0 && onCategoryClick;

                return (
                  <div
                    key={cat.nome}
                    className={`space-y-1 rounded-md p-1.5 -mx-1.5 ${
                      isClickable
                        ? "cursor-pointer hover:bg-accent/50 transition-colors"
                        : ""
                    }`}
                    onClick={(e) => handleCategoryClick(cat, e)}
                    title={isClickable ? "Clique para ver as transações" : undefined}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <CatIcon className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{cat.nome}</span>
                        {isClickable && (
                          <ExternalLink className="h-2.5 w-2.5 text-muted-foreground/50" />
                        )}
                      </div>
                      <span className="font-medium">
                        {formatarMoeda(cat.gastosAtuais)} / {formatarMoeda(cat.orcamento)}
                      </span>
                    </div>
                    <Progress
                      value={catPercent}
                      className="h-1.5"
                      style={{
                        ["--progress-color" as string]:
                          cat.gastosAtuais > cat.orcamento
                            ? "bg-red-500"
                            : catPercent >= 80
                            ? "bg-amber-500"
                            : "bg-primary",
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default GrupoCategoriasCard;
