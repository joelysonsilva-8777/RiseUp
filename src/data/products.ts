import { Timestamp } from "firebase/firestore";

export type Product = {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  price: number;
  oldPrice?: number;
  sellerId?: string;
  sellerName?: string;
  city?: string;
  state?: string;
  stock?: number;
  featured?: boolean;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
};

export type ProductInput = Omit<Product, "id" | "createdAt" | "updatedAt">;

export const defaultProducts: Product[] = [
  {
    id: "protese-bionica-mao-modular",
    name: "Protese bionica de mao modular",
    category: "Mao bionica",
    description: "Sensores tateis, pegada precisa e resposta motora fina.",
    image: "/produto-cadeira-thumb-1.png",
    oldPrice: 52000,
    price: 48000,
    sellerName: "Acesse+ Labs",
    city: "Paulista",
    state: "PE",
    stock: 4,
    featured: true,
  },
  {
    id: "oculos-assistivo-leitura-ambiente",
    name: "Oculos assistivo com leitura de ambiente",
    category: "Visao",
    description: "Reconhece placas, obstaculos e contexto imediato.",
    image: "/produto-cadeira-thumb-2.png",
    price: 9800,
    sellerName: "Acesse+ Labs",
    city: "Recife",
    state: "PE",
    stock: 8,
    featured: true,
  },
  {
    id: "teclado-braille-mecanico-premium",
    name: "Teclado braille mecanico premium",
    category: "Acesso tatil",
    description: "Feedback silencioso, USB-C e teclas de alta precisao.",
    image: "/produto-cadeira-thumb-3.png",
    price: 2400,
    sellerName: "Acesse+ Labs",
    city: "Olinda",
    state: "PE",
    stock: 15,
    featured: true,
  },
  {
    id: "mouse-ocular-calibracao-rapida",
    name: "Mouse ocular com calibracao rapida",
    category: "Controle por olhar",
    description: "Cursor responsivo para navegacao sem toque.",
    image: "/produto-cadeira-thumb-4.png",
    price: 7900,
    sellerName: "Acesse+ Labs",
    city: "Jaboatao",
    state: "PE",
    stock: 6,
    featured: true,
  },
  {
    id: "cadeira-motorizada-navegacao-inteligente",
    name: "Cadeira motorizada com navegacao inteligente",
    category: "Mobilidade",
    description: "Controle por app e assistencia de percurso interno.",
    image: "/produto-cadeira-main.png",
    oldPrice: 12500,
    price: 11900,
    sellerName: "Acesse+ Labs",
    city: "Paulista",
    state: "PE",
    stock: 5,
    featured: true,
  },
  {
    id: "fone-conducao-ossea-clinica",
    name: "Fone de conducao ossea clinica",
    category: "Audicao",
    description: "Conversa assistida sem bloquear o ouvido externo.",
    image: "/produto-cadeira-thumb-5.png",
    price: 1350,
    sellerName: "Acesse+ Labs",
    city: "Recife",
    state: "PE",
    stock: 18,
    featured: false,
  },
];

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

export const slugifyProductName = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 72);

export const filterProducts = (products: Product[], query: string) => {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return products;
  }

  return products.filter((product) =>
    [product.name, product.category, product.description, product.city, product.state]
      .filter(Boolean)
      .some((field) => field!.toLowerCase().includes(normalizedQuery))
  );
};
