import { Categoria } from "@/types";
import { categoriasInvestimentos } from "./investimentos";

export const categorias: Categoria[] = [
  // Despesas
  { nome: "Casa", orcamento: 800, gastosAtuais: 0, tipo: "despesa" },
  { nome: "Alimentação", orcamento: 1200, gastosAtuais: 0, tipo: "despesa" },
  { nome: "Transporte", orcamento: 400, gastosAtuais: 0, tipo: "despesa" },
  { nome: "Lazer", orcamento: 300, gastosAtuais: 0, tipo: "despesa" },
  { nome: "Saúde", orcamento: 200, gastosAtuais: 0, tipo: "despesa" },
  { nome: "Educação", orcamento: 150, gastosAtuais: 0, tipo: "despesa" },
  { nome: "Vestuário", orcamento: 200, gastosAtuais: 0, tipo: "despesa" },
  { nome: "Pets", orcamento: 100, gastosAtuais: 0, tipo: "despesa" },
  { nome: "Cartão de Crédito", orcamento: 1000, gastosAtuais: 0, tipo: "despesa" },
  { nome: "Outros", orcamento: 200, gastosAtuais: 0, tipo: "despesa" },
  
  // Receitas
  { nome: "Salário", orcamento: 0, gastosAtuais: 0, tipo: "receita" },
  { nome: "Freelance", orcamento: 0, gastosAtuais: 0, tipo: "receita" },
  { nome: "Investimentos", orcamento: 0, gastosAtuais: 0, tipo: "receita" },
  { nome: "Outros Ganhos", orcamento: 0, gastosAtuais: 0, tipo: "receita" },
  
  // Investimentos - importados do arquivo investimentos.ts
  ...categoriasInvestimentos
];

export const formatarMoeda = (valor: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
};

export const calcularCicloAtual = () => {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth();
  
  // Se estamos na primeira quinzena, o ciclo atual é do dia 21 do mês anterior ao dia 20 do mês atual
  // Se estamos na segunda quinzena, o ciclo atual é do dia 21 do mês atual ao dia 20 do próximo mês
  
  let inicioMes, fimMes;
  
  if (hoje.getDate() < 21) {
    // Primeira quinzena: ciclo do mês anterior
    inicioMes = mes - 1;
    fimMes = mes;
    
    // Ajustar para dezembro do ano anterior se necessário
    if (inicioMes < 0) {
      inicioMes = 11;
      return {
        inicio: new Date(ano - 1, inicioMes, 21),
        fim: new Date(ano, fimMes, 20),
        nome: `21/${String(inicioMes + 1).padStart(2, '0')}/${inicioMes === 11 ? ano - 1 : ano} - 20/${String(fimMes + 1).padStart(2, '0')}/${ano}`
      };
    }
  } else {
    // Segunda quinzena: ciclo do mês atual
    inicioMes = mes;
    fimMes = mes + 1;
    
    // Ajustar para janeiro do próximo ano se necessário
    if (fimMes > 11) {
      fimMes = 0;
      return {
        inicio: new Date(ano, inicioMes, 21),
        fim: new Date(ano + 1, fimMes, 20),
        nome: `21/${String(inicioMes + 1).padStart(2, '0')}/${ano} - 20/${String(fimMes + 1).padStart(2, '0')}/${ano + 1}`
      };
    }
  }
  
  return {
    inicio: new Date(ano, inicioMes, 21),
    fim: new Date(ano, fimMes, 20),
    nome: `21/${String(inicioMes + 1).padStart(2, '0')}/${ano} - 20/${String(fimMes + 1).padStart(2, '0')}/${ano}`
  };
};
