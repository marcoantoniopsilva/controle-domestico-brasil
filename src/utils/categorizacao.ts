import { categoriasDefault } from "./financas";

// Mapeamento de palavras-chave para categorias
const keywordMapping: Record<string, string> = {
  // Farmácia
  "drog": "Farmácia",
  "droga": "Farmácia",
  "farmacia": "Farmácia",
  "farmácia": "Farmácia",
  "araujo": "Farmácia",
  "pacheco": "Farmácia",
  "ultrafarma": "Farmácia",
  "panvel": "Farmácia",
  "drogasil": "Farmácia",
  "raia": "Farmácia",
  
  // Supermercado
  "carrefour": "Supermercado",
  "supermercado": "Supermercado",
  "mercado": "Supermercado",
  "verdemar": "Supermercado",
  "epa": "Supermercado",
  "bh": "Supermercado",
  "atacadao": "Supermercado",
  "atacadão": "Supermercado",
  "assai": "Supermercado",
  "mart": "Supermercado",
  "pao de acucar": "Supermercado",
  "extra": "Supermercado",
  "dia": "Supermercado",
  "sr a granel": "Supermercado",
  "granel": "Supermercado",
  "hortifrutti": "Supermercado",
  "hortifruti": "Supermercado",
  "sacolao": "Supermercado",
  "sacolão": "Supermercado",
  "mineiro": "Supermercado",
  
  // Aplicativos e restaurantes
  "padaria": "Aplicativos e restaurantes",
  "rosemeire": "Aplicativos e restaurantes",
  "restaurante": "Aplicativos e restaurantes",
  "ifood": "Aplicativos e restaurantes",
  "rappi": "Aplicativos e restaurantes",
  "uber eats": "Aplicativos e restaurantes",
  "ubereats": "Aplicativos e restaurantes",
  "lanchonete": "Aplicativos e restaurantes",
  "pizzaria": "Aplicativos e restaurantes",
  "pizza": "Aplicativos e restaurantes",
  "mc donalds": "Aplicativos e restaurantes",
  "mcdonalds": "Aplicativos e restaurantes",
  "burger": "Aplicativos e restaurantes",
  "subway": "Aplicativos e restaurantes",
  "starbucks": "Aplicativos e restaurantes",
  "cafe": "Aplicativos e restaurantes",
  "café": "Aplicativos e restaurantes",
  "confeitaria": "Aplicativos e restaurantes",
  "doceria": "Aplicativos e restaurantes",
  "sorvete": "Aplicativos e restaurantes",
  "acai": "Aplicativos e restaurantes",
  "açaí": "Aplicativos e restaurantes",
  "bar ": "Aplicativos e restaurantes",
  "boteco": "Aplicativos e restaurantes",
  "churrascaria": "Aplicativos e restaurantes",
  "sushi": "Aplicativos e restaurantes",
  "japanese": "Aplicativos e restaurantes",
  "china": "Aplicativos e restaurantes",
  "italiano": "Aplicativos e restaurantes",
  "comida": "Aplicativos e restaurantes",
  "alimento": "Aplicativos e restaurantes",
  
  // Estacionamento
  "estac": "Estacionamento",
  "estacionamento": "Estacionamento",
  "parking": "Estacionamento",
  "zona azul": "Estacionamento",
  "estapar": "Estacionamento",
  "indigo": "Estacionamento",
  
  // Seguro, Carro e Uber
  "posto": "Seguro, Carro e Uber",
  "ipiranga": "Seguro, Carro e Uber",
  "shell": "Seguro, Carro e Uber",
  "petrobrás": "Seguro, Carro e Uber",
  "petrobras": "Seguro, Carro e Uber",
  "br distribuidora": "Seguro, Carro e Uber",
  "combustivel": "Seguro, Carro e Uber",
  "combustível": "Seguro, Carro e Uber",
  "gasolina": "Seguro, Carro e Uber",
  "alcool": "Seguro, Carro e Uber",
  "etanol": "Seguro, Carro e Uber",
  "uber": "Seguro, Carro e Uber",
  "99": "Seguro, Carro e Uber",
  "cabify": "Seguro, Carro e Uber",
  "lava": "Seguro, Carro e Uber",
  "mecanica": "Seguro, Carro e Uber",
  "mecânica": "Seguro, Carro e Uber",
  "oficina": "Seguro, Carro e Uber",
  "pneu": "Seguro, Carro e Uber",
  "borracharia": "Seguro, Carro e Uber",
  "seguro auto": "Seguro, Carro e Uber",
  "dpvat": "Seguro, Carro e Uber",
  "ipva": "Seguro, Carro e Uber",
  "licenciamento": "Seguro, Carro e Uber",
  "detran": "Seguro, Carro e Uber",
  
  // Saúde
  "hospital": "Saúde",
  "clinica": "Saúde",
  "clínica": "Saúde",
  "medico": "Saúde",
  "médico": "Saúde",
  "dentista": "Saúde",
  "laboratorio": "Saúde",
  "laboratório": "Saúde",
  "exame": "Saúde",
  "consulta": "Saúde",
  "unimed": "Saúde",
  "amil": "Saúde",
  "bradesco saude": "Saúde",
  "sulamerica": "Saúde",
  "hapvida": "Saúde",
  "notredame": "Saúde",
  "odonto": "Saúde",
  "psicolog": "Saúde",
  "fisioter": "Saúde",
  
  // Casa
  "energia": "Casa",
  "cemig": "Casa",
  "copasa": "Casa",
  "agua": "Casa",
  "água": "Casa",
  "luz": "Casa",
  "eletric": "Casa",
  "gas": "Casa",
  "gás": "Casa",
  "condominio": "Casa",
  "condomínio": "Casa",
  "aluguel": "Casa",
  "imobiliaria": "Casa",
  "imobiliária": "Casa",
  "mobiliado": "Casa",
  "moveis": "Casa",
  "móveis": "Casa",
  "decoracao": "Casa",
  "decoração": "Casa",
  "reforma": "Casa",
  "construcao": "Casa",
  "construção": "Casa",
  "home center": "Casa",
  "leroy": "Casa",
  "telhanorte": "Casa",
  "c&c": "Casa",
  "ferragista": "Casa",
  "madeireira": "Casa",
  "eletrodomestico": "Casa",
  "eletrodoméstico": "Casa",
  
  // Internet e Telefone
  "internet": "Internet e Telefone",
  "telefone": "Internet e Telefone",
  "celular": "Internet e Telefone",
  "vivo": "Internet e Telefone",
  "claro": "Internet e Telefone",
  "tim": "Internet e Telefone",
  "oi ": "Internet e Telefone",
  "net ": "Internet e Telefone",
  "sky": "Internet e Telefone",
  
  // Assinaturas
  "netflix": "Assinaturas",
  "spotify": "Assinaturas",
  "amazon prime": "Assinaturas",
  "prime video": "Assinaturas",
  "disney": "Assinaturas",
  "hbo": "Assinaturas",
  "globoplay": "Assinaturas",
  "youtube": "Assinaturas",
  "deezer": "Assinaturas",
  "apple music": "Assinaturas",
  "icloud": "Assinaturas",
  "google one": "Assinaturas",
  "dropbox": "Assinaturas",
  "microsoft 365": "Assinaturas",
  "canva": "Assinaturas",
  "adobe": "Assinaturas",
  
  // Educação
  "escola": "Educação",
  "faculdade": "Educação",
  "universidade": "Educação",
  "curso": "Educação",
  "livro": "Educação",
  "livraria": "Educação",
  "saraiva": "Educação",
  "cultura": "Educação",
  "material escolar": "Educação",
  "apostila": "Educação",
  "mensalidade": "Educação",
  
  // Lazer e Entretenimento
  "cinema": "Lazer e Entretenimento",
  "teatro": "Lazer e Entretenimento",
  "show": "Lazer e Entretenimento",
  "ingresso": "Lazer e Entretenimento",
  "evento": "Lazer e Entretenimento",
  "parque": "Lazer e Entretenimento",
  "zoológico": "Lazer e Entretenimento",
  "museu": "Lazer e Entretenimento",
  "passeio": "Lazer e Entretenimento",
  
  // Pets
  "pet": "Pets",
  "veterinario": "Pets",
  "veterinário": "Pets",
  "racao": "Pets",
  "ração": "Pets",
  "petz": "Pets",
  "cobasi": "Pets",
  "petlove": "Pets",
  "banho e tosa": "Pets",
  
  // Viagens
  "hotel": "Viagens",
  "pousada": "Viagens",
  "airbnb": "Viagens",
  "booking": "Viagens",
  "passagem": "Viagens",
  "aereo": "Viagens",
  "aéreo": "Viagens",
  "gol": "Viagens",
  "latam": "Viagens",
  "azul": "Viagens",
  "decolar": "Viagens",
  "cvc": "Viagens",
  
  // Roupas
  "roupa": "Roupas",
  "loja": "Roupas",
  "renner": "Roupas",
  "riachuelo": "Roupas",
  "c&a": "Roupas",
  "zara": "Roupas",
  "hm": "Roupas",
  "h&m": "Roupas",
  "forever": "Roupas",
  "marisa": "Roupas",
  "centauro": "Roupas",
  "netshoes": "Roupas",
  "sapato": "Roupas",
  "calçado": "Roupas",
  "calcado": "Roupas",
  "arezzo": "Roupas",
  "havaianas": "Roupas",
  
  // Beleza e Cuidados
  "salao": "Beleza e Cuidados",
  "salão": "Beleza e Cuidados",
  "cabeleireiro": "Beleza e Cuidados",
  "barbearia": "Beleza e Cuidados",
  "manicure": "Beleza e Cuidados",
  "estetica": "Beleza e Cuidados",
  "estética": "Beleza e Cuidados",
  "spa": "Beleza e Cuidados",
  "massagem": "Beleza e Cuidados",
  "boticario": "Beleza e Cuidados",
  "boticário": "Beleza e Cuidados",
  "natura": "Beleza e Cuidados",
  "avon": "Beleza e Cuidados",
  "sephora": "Beleza e Cuidados",
  "mac cosmetics": "Beleza e Cuidados",
  "perfumaria": "Beleza e Cuidados",
  "cosmetico": "Beleza e Cuidados",
  "cosmético": "Beleza e Cuidados",
  
  // Impostos, taxas e multas
  "imposto": "Impostos, taxas e multas",
  "taxa": "Impostos, taxas e multas",
  "multa": "Impostos, taxas e multas",
  "tributo": "Impostos, taxas e multas",
  "irpf": "Impostos, taxas e multas",
  "irpj": "Impostos, taxas e multas",
  "inss": "Impostos, taxas e multas",
  "fgts": "Impostos, taxas e multas",
  "darf": "Impostos, taxas e multas",
  
  // Shopping / compras gerais que podem ser "Outros"
  "shopping": "Outros",
  "magazine": "Outros",
  "americanas": "Outros",
  "casas bahia": "Outros",
  "ponto frio": "Outros",
  "mercadolivre": "Outros",
  "mercado livre": "Outros",
  "amazon": "Outros",
  "aliexpress": "Outros",
  "shopee": "Outros",
  "shein": "Outros",
};

/**
 * Tenta identificar a categoria baseada na descrição do lançamento
 */
export function categorizarPorDescricao(descricao: string): string {
  const descricaoLower = descricao.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  // Verificar cada palavra-chave no mapeamento
  for (const [keyword, categoria] of Object.entries(keywordMapping)) {
    const keywordNormalized = keyword.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (descricaoLower.includes(keywordNormalized)) {
      // Verificar se a categoria existe nas categorias padrão
      const categoriaExiste = categoriasDefault.some(
        cat => cat.nome === categoria && cat.tipo === "despesa"
      );
      if (categoriaExiste) {
        return categoria;
      }
    }
  }
  
  // Se não encontrou correspondência, retorna "Outros"
  return "Outros";
}

/**
 * Retorna lista de categorias de despesa disponíveis
 */
export function getCategoriasDisponiveis(): string[] {
  return categoriasDefault
    .filter(cat => cat.tipo === "despesa")
    .map(cat => cat.nome);
}
