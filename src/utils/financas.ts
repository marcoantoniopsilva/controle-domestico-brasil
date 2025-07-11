export const formatarMoeda = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

export const categorias = [
  // Categorias de Despesa
  { nome: "Alimentação", tipo: "despesa", orcamento: 800 },
  { nome: "Transporte", tipo: "despesa", orcamento: 300 },
  { nome: "Moradia", tipo: "despesa", orcamento: 1200 },
  { nome: "Saúde", tipo: "despesa", orcamento: 200 },
  { nome: "Educação", tipo: "despesa", orcamento: 150 },
  { nome: "Lazer", tipo: "despesa", orcamento: 300 },
  { nome: "Roupas", tipo: "despesa", orcamento: 200 },
  { nome: "Serviços", tipo: "despesa", orcamento: 150 },
  { nome: "Outros", tipo: "despesa", orcamento: 100 },
  
  // Categorias de Receita
  { nome: "Salário", tipo: "receita", orcamento: 5000 },
  { nome: "Freelance", tipo: "receita", orcamento: 1000 },
  { nome: "Renda Extra", tipo: "receita", orcamento: 500 },
  { nome: "Outros", tipo: "receita", orcamento: 200 },
  
  // Categorias de Investimento
  { nome: "Ações", tipo: "investimento", orcamento: 1000 },
  { nome: "Fundos", tipo: "investimento", orcamento: 800 },
  { nome: "Renda Fixa", tipo: "investimento", orcamento: 600 },
  { nome: "Criptomoedas", tipo: "investimento", orcamento: 300 },
  { nome: "Imóveis", tipo: "investimento", orcamento: 2000 },
  { nome: "Outros", tipo: "investimento", orcamento: 500 },
];

export const quemGastouOpcoes = [
  { value: "Marco", label: "Marco" },
  { value: "Bruna", label: "Bruna" },
];
