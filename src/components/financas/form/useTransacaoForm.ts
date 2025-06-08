
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { categorias } from "@/utils/financas";
import { Transacao } from "@/types";

interface UseTransacaoFormProps {
  onAddTransacao: (transacao: Omit<Transacao, "id">) => void;
  initialValues?: Partial<Transacao & { valor: string | number }>;
  isEditing?: boolean;
}

export function useTransacaoForm({ onAddTransacao, initialValues, isEditing = false }: UseTransacaoFormProps) {
  // Inicializar com a data atual ajustada para meio-dia para evitar problemas de timezone
  const hoje = new Date();
  const dataInicial = initialValues?.data 
    ? new Date(initialValues.data) 
    : new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        hoje.getDate(),
        12, 0, 0
      );
  
  const [data, setData] = useState<Date>(dataInicial);
  const [categoria, setCategoria] = useState(initialValues?.categoria || "");
  
  // Para valores iniciais, se for string (já formatado), usar direto, senão formatar
  const valorInicial = initialValues?.valor 
    ? (typeof initialValues.valor === 'string' 
        ? initialValues.valor 
        : Math.abs(initialValues.valor).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }))
    : "";
    
  const [valor, setValor] = useState(valorInicial);
  const [parcelas, setParcelas] = useState(initialValues?.parcelas?.toString() || "1");
  const [quemGastou, setQuemGastou] = useState<"Marco" | "Bruna">(initialValues?.quemGastou || "Marco");
  const [descricao, setDescricao] = useState(initialValues?.descricao || "");
  const [tipo, setTipo] = useState<"despesa" | "receita">(initialValues?.tipo || "despesa");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtramos as categorias com base no tipo selecionado
  const categoriasFiltradas = useMemo(() => {
    return categorias.filter(cat => cat.tipo === tipo);
  }, [tipo]);

  // Resetamos a categoria selecionada quando o tipo muda
  const handleTipoChange = (novoTipo: "despesa" | "receita") => {
    setTipo(novoTipo);
    // Apenas resetar categoria se não estiver editando ou se o tipo for diferente
    if (!isEditing || initialValues?.tipo !== novoTipo) {
      setCategoria("");  // Resetar categoria quando o tipo muda
    }
  };

  const validateForm = (): boolean => {
    if (!categoria || !valor || !parcelas || !quemGastou) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return false;
    }
    
    if (categoria === "Outros" && !descricao) {
      toast.error("Para a categoria 'Outros', é obrigatório informar uma descrição");
      return false;
    }
    
    const valorNumerico = parseFloat(valor.replace(",", "."));
    if (isNaN(valorNumerico)) {
      toast.error("Valor inválido");
      return false;
    }
    
    const parcelasNum = parseInt(parcelas);
    if (isNaN(parcelasNum) || parcelasNum < 1 || parcelasNum > 12) {
      toast.error("Número de parcelas deve ser entre 1 e 12");
      return false;
    }
    
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // Converter valor formatado brasileiro de volta para número
    const valorNumerico = parseFloat(valor.replace(/\./g, '').replace(',', '.'));
    const parcelasNum = parseInt(parcelas);
    
    console.log(`[useTransacaoForm] Valor original: ${valor}`);
    console.log(`[useTransacaoForm] Valor convertido: ${valorNumerico}`);
    console.log(`[useTransacaoForm] Data selecionada: ${data.toISOString()}`);
    
    const novaTransacao: Omit<Transacao, "id"> = {
      data: data,
      categoria,
      valor: tipo === "despesa" ? -Math.abs(valorNumerico) : Math.abs(valorNumerico),
      parcelas: parcelasNum,
      quemGastou,
      descricao: descricao || undefined,
      tipo
    };
    
    try {
      console.log("Enviando transação:", novaTransacao);
      onAddTransacao(novaTransacao);
      
      // Resetar o formulário se não estiver editando
      if (!isEditing) {
        setCategoria("");
        setValor("");
        setParcelas("1");
        setDescricao("");
        // Mantenha a data e o tipo selecionado para facilitar múltiplos lançamentos
      }
    } catch (error) {
      console.error("Erro ao adicionar transação:", error);
      toast.error("Erro ao adicionar transação");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    data,
    setData,
    categoria,
    setCategoria,
    valor,
    setValor,
    parcelas,
    setParcelas,
    quemGastou,
    setQuemGastou,
    descricao,
    setDescricao,
    tipo,
    handleTipoChange,
    isSubmitting,
    categoriasFiltradas,
    handleSubmit
  };
}
