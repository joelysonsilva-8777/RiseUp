export type Product = {
  name: string;
  category: string;
  description: string;
  image: string;
  oldPrice?: string;
  price: string;
};

export const productsDestaque: Product[] = [
  {
    name: "Prótese biônica de mão modular",
    category: "Mão biônica",
    description: "Sensores táteis, pegada precisa e resposta motora fina.",
    image: "/produto-cadeira-thumb-1.png",
    oldPrice: "Sob consulta",
    price: "R$ 48.000",
  },
  {
    name: "Óculos assistivo com leitura de ambiente",
    category: "Visão",
    description: "Reconhece placas, obstáculos e contexto imediato.",
    image: "/produto-cadeira-thumb-2.png",
    price: "R$ 9.800",
  },
  {
    name: "Teclado braille mecânico premium",
    category: "Acesso tátil",
    description: "Feedback silencioso, USB-C e teclas de alta precisão.",
    image: "/produto-cadeira-thumb-3.png",
    price: "R$ 2.400",
  },
  {
    name: "Mouse ocular com calibração rápida",
    category: "Controle por olhar",
    description: "Cursor responsivo para navegação sem toque.",
    image: "/produto-cadeira-thumb-4.png",
    price: "R$ 7.900",
  },
  {
    name: "Cadeira motorizada com navegação inteligente",
    category: "Mobilidade",
    description: "Controle por app e assistência de percurso interno.",
    image: "/produto-cadeira-main.png",
    oldPrice: "A partir de R$ 12.500",
    price: "R$ 11.900",
  },
  {
    name: "Fone de condução óssea clínica",
    category: "Audição",
    description: "Conversa assistida sem bloquear o ouvido externo.",
    image: "/produto-cadeira-thumb-5.png",
    price: "R$ 1.350",
  },
];

export const productsOfertas: Product[] = [
  {
    name: "Bengala dobrável com sensor ultrassônico",
    category: "Mobilidade",
    description: "Detecta obstáculos a 2m e vibra para alertar o usuário.",
    image: "/produto-cadeira-thumb-1.png",
    oldPrice: "R$ 890",
    price: "R$ 640",
  },
  {
    name: "Amplificador auditivo discreto recarregável",
    category: "Audição",
    description: "Som limpo, bateria de 20h e ajuste por aplicativo.",
    image: "/produto-cadeira-thumb-2.png",
    price: "R$ 1.980",
  },
  {
    name: "Cadeira de rodas ultralight carbono",
    category: "Mobilidade",
    description: "5,8kg, dobrável em 3 segundos e resistente à chuva.",
    image: "/produto-cadeira-thumb-3.png",
    oldPrice: "A partir de R$ 8.200",
    price: "R$ 6.900",
  },
  {
    name: "Luva de comunicação em Libras",
    category: "Comunicação",
    description: "Converte sinais em texto e fala em tempo real.",
    image: "/produto-cadeira-thumb-4.png",
    price: "R$ 3.200",
  },
  {
    name: "Monitor com leitor de tela integrado",
    category: "Visão",
    description: "Alto contraste, narração automática e zoom adaptativo.",
    image: "/produto-cadeira-main.png",
    oldPrice: "R$ 4.100",
    price: "R$ 3.450",
  },
  {
    name: "Joystick adaptado para cadeirantes",
    category: "Controle por olhar",
    description: "Compatível com PC e console, sensibilidade ajustável.",
    image: "/produto-cadeira-thumb-5.png",
    price: "R$ 780",
  },
];