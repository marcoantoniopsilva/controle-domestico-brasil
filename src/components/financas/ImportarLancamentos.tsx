import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getCategoriasDisponiveis } from "@/utils/categorizacao";
import { ImportarLancamentosReview } from "./ImportarLancamentosReview";

interface ExtractedTransaction {
  data: string;
  descricao: string;
  valor: number;
  parcelas: number;
  parcelaAtual: number;
  categoria: string;
  selecionado: boolean;
}

interface ImportarLancamentosProps {
  isOpen: boolean;
  onClose: () => void;
  onImportar: (transacoes: Array<{
    data: Date;
    categoria: string;
    valor: number;
    parcelas: number;
    quemGastou: "Marco" | "Bruna";
    descricao: string;
    tipo: "despesa";
  }>) => Promise<boolean>;
}

export function ImportarLancamentos({ isOpen, onClose, onImportar }: ImportarLancamentosProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractedTransactions, setExtractedTransactions] = useState<ExtractedTransaction[]>([]);
  const [showReview, setShowReview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem');
      return;
    }

    // Converter para base64
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setImagePreview(base64);
      await processImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async (imageBase64: string) => {
    setIsLoading(true);
    try {
      const categorias = getCategoriasDisponiveis();
      
      console.log('Enviando imagem para processamento...');
      
      const { data, error } = await supabase.functions.invoke('extract-transactions', {
        body: { imageBase64, categorias }
      });

      if (error) {
        console.error('Erro ao chamar função:', error);
        toast.error('Erro ao processar imagem: ' + error.message);
        return;
      }

      console.log('Resposta da função:', data);

      if (data.error) {
        toast.error(data.error);
        return;
      }

      if (!data.transacoes || data.transacoes.length === 0) {
        toast.warning('Nenhum lançamento encontrado na imagem');
        return;
      }

      // Adicionar campo de seleção a cada transação
      const transacoesComSelecao = data.transacoes.map((t: any) => ({
        ...t,
        selecionado: true
      }));

      setExtractedTransactions(transacoesComSelecao);
      setShowReview(true);
      toast.success(`${transacoesComSelecao.length} lançamentos encontrados!`);

    } catch (error: any) {
      console.error('Erro ao processar imagem:', error);
      toast.error('Erro ao processar imagem: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async (transacoes: ExtractedTransaction[], quemGastou: "Marco" | "Bruna") => {
    const transacoesParaImportar = transacoes
      .filter(t => t.selecionado)
      .map(t => {
        // Converter data string para Date
        const [dia, mes, ano] = t.data.split('/').map(Number);
        const dataCompleta = new Date(ano || 2024, (mes || 1) - 1, dia || 1);

        return {
          data: dataCompleta,
          categoria: t.categoria,
          valor: t.valor,
          parcelas: t.parcelas || 1,
          quemGastou,
          descricao: t.descricao,
          tipo: "despesa" as const
        };
      });

    if (transacoesParaImportar.length === 0) {
      toast.warning('Nenhum lançamento selecionado para importar');
      return;
    }

    setIsLoading(true);
    try {
      // Importar cada transação
      let sucessos = 0;
      let erros = 0;

      for (const transacao of transacoesParaImportar) {
        const success = await onImportar([transacao]);
        if (success) {
          sucessos++;
        } else {
          erros++;
        }
      }

      if (sucessos > 0) {
        toast.success(`${sucessos} lançamento(s) importado(s) com sucesso!`);
      }
      if (erros > 0) {
        toast.error(`${erros} lançamento(s) falharam ao importar`);
      }

      // Limpar estado e fechar
      handleReset();
      onClose();

    } catch (error: any) {
      console.error('Erro ao importar:', error);
      toast.error('Erro ao importar lançamentos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setImagePreview(null);
    setExtractedTransactions([]);
    setShowReview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Importar Lançamentos
          </DialogTitle>
        </DialogHeader>

        {!showReview ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Envie uma foto ou print do extrato do cartão de crédito para extrair os lançamentos automaticamente.
            </p>

            {/* Área de upload */}
            <div 
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {isLoading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Processando imagem com IA...</p>
                </div>
              ) : imagePreview ? (
                <div className="space-y-3">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="max-h-64 mx-auto rounded-lg"
                  />
                  <p className="text-sm text-muted-foreground">Clique para selecionar outra imagem</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Clique para selecionar uma imagem ou arraste e solte aqui
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Formatos suportados: JPG, PNG, HEIC
                  </p>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileSelect}
            />

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <ImportarLancamentosReview
            transacoes={extractedTransactions}
            onTransacoesChange={setExtractedTransactions}
            onImportar={handleImport}
            onVoltar={() => setShowReview(false)}
            isLoading={isLoading}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
