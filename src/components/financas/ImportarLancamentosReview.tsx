import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, Check } from "lucide-react";
import { formatarMoeda } from "@/utils/financas";
import { useCartoes } from "@/hooks/useCartoes";
import { useContas } from "@/hooks/useContas";
import { CartaoIcone } from "@/utils/cardIcons";
import { useAuth } from "@/hooks/useAuth";
import { useUserPreferences } from "@/hooks/useUserPreferences";

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
  onImportar: (
    transacoes: ExtractedTransaction[],
    quemGastou: string,
    anoImportacao: number,
    cartaoId: string | null,
    contaId: string | null
  ) => Promise<void>;
  onVoltar: () => void;
  isLoading: boolean;
  anoReferencia: number;
  responsaveis: string[];
  responsavelPadrao: string;
  categoriasDisponiveis: string[];
}

export function ImportarLancamentosReview({
  transacoes,
  onTransacoesChange,
  onImportar,
  onVoltar,
  isLoading,
  anoReferencia,
  responsaveis,
  responsavelPadrao,
  categoriasDisponiveis,
}: ImportarLancamentosReviewProps) {
  const lista = responsaveis && responsaveis.length > 0 ? responsaveis : ["Você"];
  const [quemGastou, setQuemGastou] = useState<string>(responsavelPadrao || lista[0]);
  const [anoImportacao, setAnoImportacao] = useState<number>(anoReferencia);
  const { cartoes } = useCartoes();
  const cartoesAtivos = cartoes.filter((c) => c.ativo);
  const [cartaoId, setCartaoId] = useState<string>("__none__");
  const { contas } = useContas();
  const contasAtivas = contas.filter((c) => c.ativo);
  const [contaId, setContaId] = useState<string>("__none__");
  const { usuario } = useAuth();
  const { preferences } = useUserPreferences(usuario?.id);
  const [cartaoTocado, setCartaoTocado] = useState(false);
  useEffect(() => {
    if (cartaoTocado) return;
    const padrao = preferences.cartaoPadraoId;
    if (padrao && cartoesAtivos.some((c) => c.id === padrao)) {
      setCartaoId(padrao);
    }
  }, [preferences.cartaoPadraoId, cartoesAtivos, cartaoTocado]);
  const handleCartaoChange = (v: string) => {
    setCartaoTocado(true);
    setCartaoId(v);
  };
  const [contaTocada, setContaTocada] = useState(false);
  useEffect(() => {
    if (contaTocada) return;
    const padrao = preferences.contaPadraoId;
    if (padrao && contasAtivas.some((c) => c.id === padrao)) {
      setContaId(padrao);
    }
  }, [preferences.contaPadraoId, contasAtivas, contaTocada]);
  const handleContaChange = (v: string) => {
    setContaTocada(true);
    setContaId(v);
  };
  const categorias = categoriasDisponiveis;
  const anosDisponiveis = [anoReferencia - 1, anoReferencia, anoReferencia + 1];

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

  const [dataGlobal, setDataGlobal] = useState<string>("");
  const aplicarDataGlobal = () => {
    if (!dataGlobal.trim()) return;
    const updated = transacoes.map((t) => ({ ...t, data: dataGlobal.trim() }));
    onTransacoesChange(updated);
  };

  const handleDescricaoChange = (index: number, descricao: string) => {
    const updated = [...transacoes];
    updated[index].descricao = descricao;
    onTransacoesChange(updated);
  };

  const selectedCount = transacoes.filter(t => t.selecionado).length;
  const totalSelecionado = transacoes
    .filter(t => t.selecionado)
    .reduce((sum, t) => sum + t.valor, 0);

  return (
    <div className="space-y-4 w-full">
      {/* Header com seleção global e controles de importação */}
      <div className="flex flex-col gap-4 pb-4 border-b">
        <div className="flex flex-wrap items-center gap-4">
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
        
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Label className="text-sm shrink-0">Ano:</Label>
            <Select
              value={String(anoImportacao)}
              onValueChange={(v) => setAnoImportacao(parseInt(v, 10) || anoReferencia)}
            >
              <SelectTrigger className="w-full sm:w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {anosDisponiveis.map((a) => (
                  <SelectItem key={a} value={String(a)}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Label className="text-sm shrink-0">Data p/ todos:</Label>
            <Input
              value={dataGlobal}
              onChange={(e) => setDataGlobal(e.target.value)}
              placeholder="DD/MM/AAAA"
              className="h-9 w-full sm:w-32 text-sm"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={aplicarDataGlobal}
              disabled={!dataGlobal.trim()}
            >
              Aplicar
            </Button>
          </div>

          {cartoesAtivos.length > 0 && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Label className="text-sm shrink-0">Cartão:</Label>
              <Select value={cartaoId} onValueChange={handleCartaoChange}>
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Sem cartão</SelectItem>
                  {cartoesAtivos.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <div className="flex items-center gap-2">
                        <CartaoIcone banco={c.banco} bandeira={c.bandeira} cor={c.cor} size={18} />
                        <span>{c.nome}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {contasAtivas.length > 0 && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Label className="text-sm shrink-0">Conta:</Label>
              <Select value={contaId} onValueChange={handleContaChange}>
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Sem conta</SelectItem>
                  {contasAtivas.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <div className="flex items-center gap-2">
                        <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: c.cor }} />
                        <span>{c.nome}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Label className="text-sm shrink-0">Quem gastou:</Label>
            <Select value={quemGastou} onValueChange={setQuemGastou}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {lista.map((nome) => (
                  <SelectItem key={nome} value={nome}>{nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
                  <Input
                    value={transacao.descricao}
                    onChange={(e) => handleDescricaoChange(index, e.target.value)}
                    className="h-8 text-sm"
                    title={transacao.descricao}
                  />
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
          onClick={() =>
            onImportar(
              transacoes,
              quemGastou,
              anoImportacao,
              cartaoId === "__none__" ? null : cartaoId,
              contaId === "__none__" ? null : contaId
            )
          }
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
