const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

const OUT_OF_SCOPE_ANSWER =
  "Posso ajudar apenas com dúvidas sobre a Acesse+, navegação, conta, compra, venda, entrega, carrinho, cupons e produtos de acessibilidade do site.";

const SITE_CONTEXT = [
  "Acesse+ é um marketplace focado em acessibilidade, autonomia e tecnologia assistiva.",
  "O site tem busca de produtos, departamentos, ofertas, cupons, carrinho, checkout, cadastro, login, perfil, mensagens com vendedores, comentários e avaliações.",
  "Produtos iniciais incluem prótese biônica de mão modular, óculos assistivo com leitura de ambiente, teclado braille mecânico premium, mouse ocular, cadeira motorizada com navegação inteligente e fone de condução óssea.",
  "O usuário pode comprar pelo carrinho, acompanhar informações de entrega, conversar com vendedores e cadastrar produtos para venda quando estiver logado.",
].join("\n");

const BASE_SCOPE_TERMS = [
  "acesse",
  "acessibilidade",
  "acessivel",
  "acessiveis",
  "assistiva",
  "assistivo",
  "autonomia",
  "site",
  "loja",
  "marketplace",
  "produto",
  "produtos",
  "catalogo",
  "categoria",
  "departamento",
  "oferta",
  "ofertas",
  "cupom",
  "cupons",
  "comprar",
  "compra",
  "pedido",
  "pagamento",
  "pix",
  "cartao",
  "checkout",
  "carrinho",
  "preco",
  "valor",
  "frete",
  "entrega",
  "envio",
  "cep",
  "login",
  "cadastro",
  "conta",
  "perfil",
  "senha",
  "vender",
  "vendedor",
  "anunciar",
  "cadastrar produto",
  "mensagem",
  "chat",
  "avaliacao",
  "avaliacoes",
  "comentario",
  "comentarios",
  "estoque",
  "garantia",
  "devolucao",
  "protese",
  "bionica",
  "mao",
  "oculos",
  "leitura",
  "ambiente",
  "braille",
  "teclado",
  "mouse",
  "ocular",
  "cadeira",
  "motorizada",
  "mobilidade",
  "fone",
  "conducao",
  "ossea",
  "audicao",
  "visao",
];

const GENERAL_QUESTION_PATTERNS = [
  /\b(capital|presidente|historia|geografia|politica|receita|clima|tempo hoje|noticia|filme|musica|poema|piada)\b/,
  /\b(resolve|calcule|equacao|programa|codigo|javascript|python|sql|html|css)\b/,
  /\b(traduza|resuma|explique sobre|quem foi|o que e)\b/,
];

const normalize = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const compactText = (value, maxLength = 220) =>
  String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);

const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    style: "currency",
  }).format(Number(value) || 0);

const isGreeting = (message) => /^(oi|ola|olá|bom dia|boa tarde|boa noite|hey|hello|ajuda)[!.\s?]*$/i.test(message.trim());

const getProductTerms = (products) =>
  products
    .flatMap((product) => [
      product.name,
      product.category,
      product.description,
      ...(Array.isArray(product.tags) ? product.tags : []),
    ])
    .flatMap((field) => normalize(field).split(/[^a-z0-9]+/))
    .filter((term) => term.length >= 4);

const isInScope = (message, products) => {
  const normalizedMessage = normalize(message);

  if (isGreeting(message)) {
    return true;
  }

  const productTerms = getProductTerms(products);
  const allowedTerms = [...BASE_SCOPE_TERMS, ...productTerms];
  const hasAllowedTerm = allowedTerms.some((term) => normalizedMessage.includes(term));

  if (!hasAllowedTerm) {
    return false;
  }

  const looksGeneral = GENERAL_QUESTION_PATTERNS.some((pattern) => pattern.test(normalizedMessage));
  const hasStrongSiteSignal = /\b(acesse|produto|produtos|compra|carrinho|entrega|vender|vendedor|cupom|cadastro|login|perfil|frete|pedido)\b/.test(
    normalizedMessage
  );

  return !looksGeneral || hasStrongSiteSignal;
};

const getProductContext = (products) => {
  if (!Array.isArray(products) || products.length === 0) {
    return "Nenhum produto foi enviado pelo cliente nesta conversa.";
  }

  return products
    .slice(0, 16)
    .map((product) => {
      const tags = Array.isArray(product.tags) && product.tags.length > 0 ? ` Tags: ${product.tags.join(", ")}.` : "";
      const stock = Number.isFinite(Number(product.stock)) ? ` Estoque: ${Number(product.stock)}.` : "";
      const location = [product.city, product.state].filter(Boolean).join(" - ");
      const locationText = location ? ` Local: ${location}.` : "";

      return `- ${compactText(product.name, 90)} (${compactText(product.category, 60)}): ${compactText(
        product.description,
        150
      )} Preço: ${formatCurrency(product.price)}.${stock}${locationText}${tags}`;
    })
    .join("\n");
};

const getHistoryContext = (history) => {
  if (!Array.isArray(history) || history.length === 0) {
    return "Sem histórico anterior.";
  }

  return history
    .slice(-8)
    .map((entry) => {
      const role = entry.role === "assistant" ? "Assistente" : "Usuário";
      return `${role}: ${compactText(entry.content, 260)}`;
    })
    .join("\n");
};

const getSystemPrompt = () =>
  [
    "Você é o assistente oficial da Acesse+.",
    "Responda em português do Brasil, com tom acolhedor, direto e útil.",
    "Escopo permitido: dúvidas sobre o site Acesse+, navegação, busca, produtos do catálogo, compra, carrinho, checkout, pagamento, frete, entrega, cupons, cadastro, login, perfil, venda, cadastro de produto, vendedores, mensagens, comentários e avaliações.",
    "Fora do escopo: conhecimento geral, notícias, política, tarefas escolares, programação, piadas, diagnósticos médicos, aconselhamento jurídico/financeiro e conversas sem relação clara com a Acesse+.",
    `Se a pergunta estiver fora do escopo, responda exatamente: "${OUT_OF_SCOPE_ANSWER}"`,
    "Use somente o contexto fornecido. Se não houver informação suficiente, diga que não encontrou essa informação no site e sugira uma ação dentro da Acesse+.",
    "Não invente prazos, estoque, garantias, políticas ou dados clínicos. Não peça dados sensíveis.",
    "Mantenha a resposta em no máximo 4 frases curtas.",
  ].join("\n");

const createAssistantAnswer = async ({ history = [], message, pagePath = "", products = [] }) => {
  const safeMessage = compactText(message, 700);

  if (safeMessage.length < 2) {
    return {
      answer: "Me diga sua dúvida sobre produtos, compra, entrega, conta ou venda na Acesse+.",
      outOfScope: false,
    };
  }

  if (!isInScope(safeMessage, products)) {
    return {
      answer: OUT_OF_SCOPE_ANSWER,
      outOfScope: true,
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      answer:
        "O assistente ainda precisa da variável OPENAI_API_KEY configurada no servidor para responder automaticamente.",
      missingKey: true,
      outOfScope: false,
    };
  }

  const model = process.env.OPENAI_MODEL || "gpt-5.4-mini";
  const productContext = getProductContext(products);
  const historyContext = getHistoryContext(history);

  const userContent = [
    `Página atual: ${compactText(pagePath, 120) || "/"}`,
    "",
    "Contexto do site:",
    SITE_CONTEXT,
    "",
    "Produtos disponíveis no contexto atual:",
    productContext,
    "",
    "Histórico recente:",
    historyContext,
    "",
    `Pergunta do usuário: ${safeMessage}`,
  ].join("\n");

  const response = await fetch(OPENAI_API_URL, {
    body: JSON.stringify({
      max_completion_tokens: 260,
      messages: [
        { content: getSystemPrompt(), role: "system" },
        { content: userContent, role: "user" },
      ],
      model,
    }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const statusText = payload?.error?.message ? compactText(payload.error.message, 180) : "Erro na API da OpenAI.";
    throw new Error(statusText);
  }

  const answer = compactText(payload?.choices?.[0]?.message?.content, 1200);

  return {
    answer: answer || "Não encontrei uma resposta segura no contexto da Acesse+ agora.",
    outOfScope: answer === OUT_OF_SCOPE_ANSWER,
  };
};

module.exports = {
  OUT_OF_SCOPE_ANSWER,
  createAssistantAnswer,
};
