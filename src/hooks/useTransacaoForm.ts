
import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { Transacao, Categoria } from "@/types";
import { categorias as categoriasIniciais } from "@/utils/financas";
import { useCategoryBudgets } from "./useCategoryBudgets";

export interface UseTransacaoFormProps {
  onAddTransacao: (transacao: Omit<Transacao, "id">) => Promise<boolean> | Promise<void>;
  initialValues?: Transacao;
  isEditing?: boolean;
}

export function useTransacaoForm({
  onAddTransacao,
  initialValues,
  isEditing = false
}: UseTransacaoFormProps) {
  const { getCategoriesWithCustomBudgets } = useCategoryBudgets();
  // Estado para todos os campos do formulário
  const [data, setData] = useState<Date>(
    initialValues?.data ? new Date(initialValues.data) : new Date()
  );
  const [categoria, setCategoria] = useState(initialValues?.categoria || "");
  const [valor, setValor] = useState<string>(initialValues?.valor ? Math.abs(initialValues.valor).toString() : "");
  const [parcelas, setParcelas] = useState<string>(initialValues?.parcelas?.toString() || "1");
  const [descricao, setDescricao] = useState(initialValues?.descricao || "");
  const [tipo, setTipo] = useState<"despesa" | "receita" | "investimento">(initialValues?.tipo || "despesa");
  const [ganhos, setGanhos] = useState<string>(
    initialValues?.ganhos ? initialValues.ganhos.toString() : "0"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lista de categorias filtradas com base no tipo selecionado
  const categoriasFiltradas = useMemo(() => {
    const categoriasAtuais = getCategoriesWithCustomBudgets();
    const filtered = categoriasAtuais.filter((cat) => cat.tipo === tipo);
    console.log("useTransacaoForm - tipo:", tipo, "categorias filtradas:", filtered);
    return filtered;
  }, [tipo, getCategoriesWithCustomBudgets]);

  // Limpar o campo categoria quando mudar o tipo
  const handleTipoChange = useCallback(
    (novoTipo: "despesa" | "receita" | "investimento") => {
      setTipo(novoTipo);
      setCategoria("");
    },
    []
  );

  // Handler para o submit do formulário
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Validações
      if (!categoria) {
        toast.error("Selecione uma categoria");
        return;
      }

      if (!valor || parseFloat(valor) <= 0) {
        toast.error("Informe um valor válido");
        return;
      }

      // Verificar se descrição é obrigatória para categorias "Outros"
      if ((categoria.includes("Outros") || categoria === "Outros") && !descricao) {
        toast.error(
          "A descrição é obrigatória para categorias 'Outros'"
        );
        return;
      }

      try {
        setIsSubmitting(true);

        // Preparar o objeto de transação
        const transacao: Omit<Transacao, "id"> = {
          data,
          categoria,
          // Para investimentos, valor é sempre positivo (representando o valor investido)
          // Para despesas, valor é negativo
          // Para receitas, valor é positivo
          valor: tipo === "despesa" 
            ? -Math.abs(parseFloat(valor)) 
            : Math.abs(parseFloat(valor)),
          parcelas: parseInt(parcelas, 10),
          quemGastou: "Marco", // Valor fixo padrão
          descricao,
          tipo,
          // Adicionar ganhos apenas para investimentos
          ganhos: tipo === "investimento" ? parseFloat(ganhos) || 0 : 0,
        };

        // Enviar para o handler
        await onAddTransacao(transacao);

        // Se não estiver editando, limpar o formulário
        if (!isEditing) {
          setCategoria("");
          setValor("");
          setParcelas("1");
          setDescricao("");
          setGanhos("0");
        }
      } catch (error) {
        console.error("Erro ao salvar transação:", error);
        toast.error("Erro ao salvar transação");
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      categoria,
      valor,
      parcelas,
      descricao,
      tipo,
      data,
      ganhos,
      onAddTransacao,
      isEditing,
    ]
  );

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
    setTipo,
    ganhos,
    setGanhos,
    handleTipoChange,
    isSubmitting,
    categoriasFiltradas,
    handleSubmit,
  };
}
