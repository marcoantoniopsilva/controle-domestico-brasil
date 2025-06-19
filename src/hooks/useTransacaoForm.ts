
import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { Transacao, Categoria } from "@/types";
import { categorias as categoriasIniciais } from "@/utils/financas";

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
  // Estado para todos os campos do formulário
  const [data, setData] = useState<Date>(
    initialValues?.data ? new Date(initialValues.data) : new Date()
  );
  const [categoria, setCategoria] = useState(initialValues?.categoria || "");
  const [valor, setValor] = useState<string>(initialValues?.valor ? Math.abs(initialValues.valor).toString() : "");
  const [parcelas, setParcelas] = useState<string>(initialValues?.parcelas?.toString() || "1");
  const [descricao, setDescricao] = useState(initialValues?.descricao || "");
  const [tipo, setTipo] = useState<"despesa" | "receita">(initialValues?.tipo || "despesa");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lista de categorias filtradas com base no tipo selecionado
  const categoriasFiltradas = useMemo(() => {
    return categoriasIniciais.filter((cat) => cat.tipo === tipo);
  }, [tipo]);

  // Limpar o campo categoria quando mudar o tipo
  const handleTipoChange = useCallback(
    (novoTipo: "despesa" | "receita") => {
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

      // Verificar se descrição é obrigatória para categoria "Outros"
      if (categoria === "Outros" && !descricao) {
        toast.error(
          "A descrição é obrigatória para a categoria 'Outros'"
        );
        return;
      }

      try {
        setIsSubmitting(true);

        // Preparar o objeto de transação
        const transacao: Omit<Transacao, "id"> = {
          data,
          categoria,
          // Valor é negativo para despesas, positivo para receitas
          valor: tipo === "despesa" ? -Math.abs(parseFloat(valor)) : Math.abs(parseFloat(valor)),
          parcelas: parseInt(parcelas, 10),
          quemGastou: "Marco", // Valor fixo padrão, já que não usaremos mais este campo
          descricao,
          tipo,
        };

        // Enviar para o handler
        await onAddTransacao(transacao);

        // Se não estiver editando, limpar o formulário
        if (!isEditing) {
          setCategoria("");
          setValor("");
          setParcelas("1");
          setDescricao("");
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
    handleTipoChange,
    isSubmitting,
    categoriasFiltradas,
    handleSubmit,
  };
}
