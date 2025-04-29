
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { categorias } from "@/utils/financas";
import { Transacao } from "@/types";

interface UseTransacaoFormProps {
  onAddTransacao: (transacao: Omit<Transacao, "id">) => void;
}

export function useTransacaoForm({ onAddTransacao }: UseTransacaoFormProps) {
  const hoje = new Date();
  const [data, setData] = useState<Date>(hoje);
  const [categoria, setCategoria] = useState("");
  const [valor, setValor] = useState("");
  const [parcelas, setParcelas] = useState("1");
  const [quemGastou, setQuemGastou] = useState<"Marco" | "Bruna">("Marco");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState<"despesa" | "receita">("despesa");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtramos as categorias com base no tipo selecionado
  const categoriasFiltradas = useMemo(() => {
    return categorias.filter(cat => cat.tipo === tipo);
  }, [tipo]);

  // Resetamos a categoria selecionada quando o tipo muda
  const handleTipoChange = (novoTipo: "despesa" | "receita") => {
    setTipo(novoTipo);
    setCategoria("");  // Resetar categoria quando o tipo muda
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
    
    const valorNumerico = parseFloat(valor.replace(",", "."));
    const parcelasNum = parseInt(parcelas);
    
    const novaTransacao: Omit<Transacao, "id"> = {
      data,
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
      
      // Resetar o formulário
      setData(hoje);
      setCategoria("");
      setValor("");
      setParcelas("1");
      setQuemGastou("Marco");
      setDescricao("");
      setTipo("despesa");
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
