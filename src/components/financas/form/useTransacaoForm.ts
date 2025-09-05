
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { categorias } from "@/utils/financas";
import { Transacao } from "@/types";
import { useCategoryBudgets } from "@/hooks/useCategoryBudgets";

interface UseTransacaoFormProps {
  onAddTransacao: (transacao: Omit<Transacao, "id">) => void;
  initialValues?: Partial<Transacao & { valor: string | number }>;
  isEditing?: boolean;
}

export function useTransacaoForm({ onAddTransacao, initialValues, isEditing = false }: UseTransacaoFormProps) {
  const { getCategoriesWithCustomBudgets } = useCategoryBudgets();
  // Usar data diretamente sem manipulações complexas
  const dataInicial = initialValues?.data || new Date();
  
  console.log(`[useTransacaoForm] Data inicial: ${dataInicial.toDateString()}`);
  
  const [data, setData] = useState<Date>(dataInicial);
  const [categoria, setCategoria] = useState(initialValues?.categoria || "");
  
  // Para valores iniciais, sempre tratar como string formatada para o input
  const valorInicial = initialValues?.valor 
    ? (typeof initialValues.valor === 'string' 
        ? initialValues.valor 
        : Math.abs(Number(initialValues.valor)).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }))
    : "";
    
  const [valor, setValor] = useState(valorInicial);
  const [parcelas, setParcelas] = useState(initialValues?.parcelas?.toString() || "1");
  const [descricao, setDescricao] = useState(initialValues?.descricao || "");
  const [tipo, setTipo] = useState<"despesa" | "receita" | "investimento">(initialValues?.tipo || "despesa");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtramos as categorias com base no tipo selecionado
  const categoriasFiltradas = useMemo(() => {
    const categoriasAtuais = getCategoriesWithCustomBudgets();
    return categoriasAtuais.filter(cat => cat.tipo === tipo);
  }, [tipo, getCategoriesWithCustomBudgets]);

  // Resetamos a categoria selecionada quando o tipo muda
  const handleTipoChange = (novoTipo: "despesa" | "receita" | "investimento") => {
    setTipo(novoTipo);
    // Apenas resetar categoria se não estiver editando ou se o tipo for diferente
    if (!isEditing || initialValues?.tipo !== novoTipo) {
      setCategoria("");  // Resetar categoria quando o tipo muda
    }
  };

  const validateForm = (): boolean => {
    if (!categoria || !valor || !parcelas) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return false;
    }
    
    if (categoria === "Outros" && !descricao) {
      toast.error("Para a categoria 'Outros', é obrigatório informar uma descrição");
      return false;
    }
    
    // Validação melhorada para o valor
    const valorLimpo = valor.replace(/\./g, '').replace(',', '.');
    const valorNumerico = parseFloat(valorLimpo);
    
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      toast.error("Valor deve ser maior que zero");
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
    
    // Converter valor brasileiro para número (mesma lógica da validação)
    const valorLimpo = valor.replace(/\./g, '').replace(',', '.');
    const valorNumerico = parseFloat(valorLimpo);
    console.log('[useTransacaoForm] Valor original:', valor);
    console.log('[useTransacaoForm] Valor convertido:', valorNumerico);
    const parcelasNum = parseInt(parcelas);
    
    console.log(`[useTransacaoForm] Valor original: ${valor}`);
    console.log(`[useTransacaoForm] Valor convertido: ${valorNumerico}`);
    console.log(`[useTransacaoForm] Data selecionada: ${data.toDateString()}`);
    
    const novaTransacao: Omit<Transacao, "id"> = {
      data: data,
      categoria,
      valor: tipo === "despesa" ? -Math.abs(valorNumerico) : Math.abs(valorNumerico),
      parcelas: parcelasNum,
      quemGastou: "Marco", // Valor padrão fixo, já que não usaremos mais este campo
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
    descricao,
    setDescricao,
    tipo,
    handleTipoChange,
    isSubmitting,
    categoriasFiltradas,
    handleSubmit
  };
}
