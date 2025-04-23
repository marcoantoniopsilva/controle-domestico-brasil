
import React, { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { categorias } from "@/utils/financas";
import { Transacao } from "@/types";

interface AddTransacaoFormProps {
  onAddTransacao: (transacao: Omit<Transacao, "id">) => void;
}

const AddTransacaoForm: React.FC<AddTransacaoFormProps> = ({ onAddTransacao }) => {
  const hoje = new Date();
  const [data, setData] = useState<Date>(hoje);
  const [categoria, setCategoria] = useState("");
  const [valor, setValor] = useState("");
  const [parcelas, setParcelas] = useState("1");
  const [quemGastou, setQuemGastou] = useState<"Marco" | "Bruna">("Marco");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState<"despesa" | "receita">("despesa");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoria || !valor || !parcelas || !quemGastou) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }
    
    if (categoria === "Outros" && !descricao) {
      toast.error("Para a categoria 'Outros', é obrigatório informar uma descrição");
      return;
    }
    
    const valorNumerico = parseFloat(valor.replace(",", "."));
    if (isNaN(valorNumerico)) {
      toast.error("Valor inválido");
      return;
    }
    
    const parcelasNum = parseInt(parcelas);
    if (isNaN(parcelasNum) || parcelasNum < 1 || parcelasNum > 12) {
      toast.error("Número de parcelas deve ser entre 1 e 12");
      return;
    }
    
    setIsSubmitting(true);
    
    const novaTransacao: Omit<Transacao, "id"> = {
      data,
      categoria,
      valor: tipo === "despesa" ? -valorNumerico : valorNumerico,
      parcelas: parcelasNum,
      quemGastou,
      descricao: descricao || undefined,
      tipo
    };
    
    try {
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/2 space-y-2">
          <Label htmlFor="data">Data</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left"
                id="data"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {data ? (
                  format(data, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                ) : (
                  <span>Selecione uma data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={data}
                onSelect={(date) => date && setData(date)}
                initialFocus
                locale={ptBR}
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="w-full md:w-1/2 space-y-2">
          <Label htmlFor="tipo">Tipo</Label>
          <Select 
            value={tipo} 
            onValueChange={(value) => setTipo(value as "despesa" | "receita")}
          >
            <SelectTrigger id="tipo">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="despesa">Despesa</SelectItem>
              <SelectItem value="receita">Receita</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/2 space-y-2">
          <Label htmlFor="categoria">Categoria</Label>
          <Select value={categoria} onValueChange={setCategoria}>
            <SelectTrigger id="categoria">
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categorias.map((cat) => (
                <SelectItem key={cat.nome} value={cat.nome}>
                  {cat.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full md:w-1/2 space-y-2">
          <Label htmlFor="valor">Valor (R$)</Label>
          <Input
            id="valor"
            type="text"
            placeholder="0,00"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/2 space-y-2">
          <Label htmlFor="parcelas">Parcelas (1-12)</Label>
          <Select value={parcelas} onValueChange={setParcelas}>
            <SelectTrigger id="parcelas">
              <SelectValue placeholder="Selecione o número de parcelas" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {num === 1 ? "parcela" : "parcelas"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full md:w-1/2 space-y-2">
          <Label htmlFor="quemGastou">Quem realizou</Label>
          <Select 
            value={quemGastou} 
            onValueChange={(value) => setQuemGastou(value as "Marco" | "Bruna")}
          >
            <SelectTrigger id="quemGastou">
              <SelectValue placeholder="Selecione quem realizou" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Marco">Marco</SelectItem>
              <SelectItem value="Bruna">Bruna</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição (opcional{categoria === "Outros" ? ", mas obrigatória para categoria 'Outros'" : ""})</Label>
        <Textarea
          id="descricao"
          placeholder="Descreva detalhes sobre esta transação"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Adicionando..." : `Adicionar ${tipo === "despesa" ? "Despesa" : "Receita"}`}
      </Button>
    </form>
  );
};

export default AddTransacaoForm;
