
import { Categoria } from "@/types";
import { formatarMoeda } from "@/utils/financas";
import { CORES_CATEGORIAS } from "./constants";
import { DadosCiclo } from "./types";

interface CategorySummaryGridProps {
  categoriasComDados: Categoria[];
  dadosGrafico: DadosCiclo[];
}

const CategorySummaryGrid = ({ categoriasComDados, dadosGrafico }: CategorySummaryGridProps) => {
  return (
    <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {categoriasComDados.map((categoria, index) => {
        // Calcular total geral da categoria em todos os ciclos
        const totalCategoria = dadosGrafico.reduce((acc, ciclo) => acc + (ciclo[categoria.nome] as number || 0), 0);
        
        // Calcular média apenas para ciclos com lançamentos efetivos da categoria
        const ciclosComLancamentosCategoria = dadosGrafico.filter(ciclo => 
          (ciclo[categoria.nome] as number) > 0 && ciclo.temLancamentos
        );
        const mediaCategoria = ciclosComLancamentosCategoria.length > 0 
          ? ciclosComLancamentosCategoria.reduce((acc, ciclo) => acc + (ciclo[categoria.nome] as number), 0) / ciclosComLancamentosCategoria.length
          : 0;
        
        // Encontrar o valor mais alto e mais baixo
        const valoresCategoria = ciclosComLancamentosCategoria
          .map(ciclo => ciclo[categoria.nome] as number)
          .filter(v => v > 0);
        const maiorValor = valoresCategoria.length > 0 ? Math.max(...valoresCategoria) : 0;
        const menorValor = valoresCategoria.length > 0 ? Math.min(...valoresCategoria) : 0;
        
        return (
          <div key={categoria.nome} className="bg-slate-50 p-3 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: CORES_CATEGORIAS[index % CORES_CATEGORIAS.length] }}
              />
              <span className="text-sm font-medium">{categoria.nome}</span>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Total: {formatarMoeda(totalCategoria)}</div>
              <div>Média: {formatarMoeda(mediaCategoria)}</div>
              {valoresCategoria.length > 1 && (
                <>
                  <div>Maior: {formatarMoeda(maiorValor)}</div>
                  <div>Menor: {formatarMoeda(menorValor)}</div>
                </>
              )}
              <div className="text-xs opacity-75 pt-1">
                {ciclosComLancamentosCategoria.length} ciclos com dados
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CategorySummaryGrid;
