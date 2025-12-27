import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, Check } from "lucide-react";
import { getCategoriasDisponiveis } from "@/utils/categorizacao";
import { formatarMoeda } from "@/utils/financas";

interface ExtractedTransaction {
  data: string;
  descricao: string;
  valor: number;
  parcelas: number;
  parcelaAtual: number;
  categoria: string;
  selecionado: boolean;
}

interface ImportarLancamentosReviewProps {
  transacoes: ExtractedTransaction[];
  onTransacoesChange: (transacoes: ExtractedTransaction[]) => void;
  onImportar: (transacoes: ExtractedTransaction[], quemGastou: "Marco" | "Bruna") => Promise<void>;
  onVoltar: () => void;
  isLoading: boolean;
}

export function ImportarLancamentosReview({
  transacoes,
  onTransacoesChange,
  onImportar,
  onVoltar,
  isLoading
}: ImportarLancamentosReviewProps) {
  const [quemGastou, setQuemGastou] = useState<"Marco" | "Bruna">("Marco");
  const categorias = getCategoriasDisponiveis();

  const handleToggleSelect = (index: number) => {
    const updated = [...transacoes];
    updated[index].selecionado = !updated[index].selecionado;
    onTransacoesChange(updated);
  };

  const handleToggleAll = () => {
    const allSelected = transacoes.every(t => t.selecionado);
    const updated = transacoes.map(t => ({ ...t, selecionado: !allSelected }));
    onTransacoesChange(updated);
  };

  const handleCategoriaChange = (index: number, categoria: string) => {
    const updated = [...transacoes];
    updated[index].categoria = categoria;
    onTransacoesChange(updated);
  };

  const handleValorChange = (index: number, valor: string) => {
    const updated = [...transacoes];
    updated[index].valor = parseFloat(valor) || 0;
    onTransacoesChange(updated);
  };

  const handleDataChange = (index: number, data: string) => {
    const updated = [...transacoes];
    updated[index].data = data;
    onTransacoesChange(updated);
  };

  const selectedCount = transacoes.filter(t => t.selecionado).length;
  const totalSelecionado = transacoes
    .filter(t => t.selecionado)
    .reduce((sum, t) => sum + t.valor, 0);

  return (
    <div className="space-y-4">
      {/* Header com seleção global e quem gastou */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox 
              checked={transacoes.every(t => t.selecionado)}
              onCheckedChange={handleToggleAll}
            />
            <span className="text-sm font-medium">
              {selectedCount}/{transacoes.length} selecionados
            </span>
          </div>
          <span className="text-sm text-muted-foreground">
            Total: {formatarMoeda(totalSelecionado)}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Label className="text-sm">Quem gastou:</Label>
          <Select value={quemGastou} onValueChange={(v) => setQuemGastou(v as "Marco" | "Bruna")}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Marco">Marco</SelectItem>
              <SelectItem value="Bruna">Bruna</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lista de transações */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {transacoes.map((transacao, index) => (
          <div 
            key={index}
            className={`p-3 rounded-lg border transition-colors ${
              transacao.selecionado 
                ? 'bg-primary/5 border-primary/20' 
                : 'bg-muted/30 border-muted'
            }`}
          >
            <div className="flex items-start gap-3">
              <Checkbox 
                checked={transacao.selecionado}
                onCheckedChange={() => handleToggleSelect(index)}
                className="mt-1"
              />
              
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Data */}
                <div>
                  <Label className="text-xs text-muted-foreground">Data</Label>
                  <Input 
                    value={transacao.data}
                    onChange={(e) => handleDataChange(index, e.target.value)}
                    className="h-8 text-sm"
                    placeholder="DD/MM/AAAA"
                  />
                </div>

                {/* Descrição */}
                <div className="sm:col-span-1 lg:col-span-1">
                  <Label className="text-xs text-muted-foreground">Descrição</Label>
                  <p className="text-sm font-medium truncate" title={transacao.descricao}>
                    {transacao.descricao}
                  </p>
                  {transacao.parcelas > 1 && (
                    <span className="text-xs text-muted-foreground">
                      Parcela {transacao.parcelaAtual}/{transacao.parcelas}
                    </span>
                  )}
                </div>

                {/* Valor */}
                <div>
                  <Label className="text-xs text-muted-foreground">Valor</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={transacao.valor}
                    onChange={(e) => handleValorChange(index, e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>

                {/* Categoria */}
                <div>
                  <Label className="text-xs text-muted-foreground">Categoria</Label>
                  <Select 
                    value={transacao.categoria} 
                    onValueChange={(v) => handleCategoriaChange(index, v)}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer com botões */}
      <div className="flex justify-between gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onVoltar} disabled={isLoading}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        
        <Button 
          onClick={() => onImportar(transacoes, quemGastou)}
          disabled={isLoading || selectedCount === 0}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Importando...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Importar {selectedCount} lançamento(s)
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
