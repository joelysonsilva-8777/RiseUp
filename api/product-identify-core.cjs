const OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";

const listingGroups = ["produtos", "tecnologia", "aparelhos", "outros"];
const conditions = ["novo", "usado", "recondicionado", "caixa-aberta"];

const attributesByGroup = {
  produtos: ["Categoria", "Marca", "Modelo", "Material", "Dimensoes"],
  tecnologia: ["Tipo de tecnologia", "Marca", "Modelo", "Conectividade", "Compatibilidade"],
  aparelhos: ["Tipo de aparelho", "Marca", "Modelo", "Alimentacao", "Capacidade"],
  outros: ["Tipo", "Marca ou responsavel", "Publico indicado", "Principal beneficio", "Disponibilidade"],
};

const responseSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "listingGroup",
    "searchTerm",
    "title",
    "description",
    "condition",
    "attributes",
    "tags",
    "stock",
    "sku",
    "estimatedPrice",
    "confidence",
    "summary",
  ],
  properties: {
    listingGroup: {
      type: "string",
      enum: listingGroups,
    },
    searchTerm: {
      type: "string",
      description: "Termo curto para busca/catalogo, em portugues.",
    },
    title: {
      type: "string",
      description: "Titulo de anuncio claro, com ate 80 caracteres.",
    },
    description: {
      type: "string",
      description: "Descricao de venda objetiva, sem promessas medicas e sem dados de contato.",
    },
    condition: {
      type: "string",
      enum: conditions,
    },
    attributes: {
      type: "array",
      maxItems: 8,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "value"],
        properties: {
          name: {
            type: "string",
          },
          value: {
            type: "string",
          },
        },
      },
    },
    tags: {
      type: "array",
      minItems: 3,
      maxItems: 10,
      items: {
        type: "string",
      },
    },
    stock: {
      type: "integer",
      minimum: 1,
      maximum: 99,
    },
    sku: {
      type: "string",
      description: "Codigo curto sugerido, ou string vazia se nao houver evidencia.",
    },
    estimatedPrice: {
      type: "number",
      minimum: 0,
      description: "Preco estimado em BRL, ou 0 quando nao houver base visual suficiente.",
    },
    confidence: {
      type: "number",
      minimum: 0,
      maximum: 1,
    },
    summary: {
      type: "string",
      description: "Resumo curto do que foi identificado na imagem.",
    },
  },
};

const compactText = (value, maxLength = 220) =>
  String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);

const isValidImageDataUrl = (value) =>
  /^data:image\/(?:jpeg|jpg|png|webp);base64,[a-zA-Z0-9+/=]+$/.test(String(value ?? ""));

const normalizeGroup = (value, fallback = "produtos") =>
  listingGroups.includes(value) ? value : listingGroups.includes(fallback) ? fallback : "produtos";

const normalizeCondition = (value) => (conditions.includes(value) ? value : "usado");

const normalizeTag = (value) =>
  compactText(value, 32)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ");

const buildPrompt = (listingGroup, extraKeywords) => {
  const requestedGroup = normalizeGroup(listingGroup);

  return [
    "Analise a foto para pre-preencher um formulario de anuncio da Acesse+.",
    "A Acesse+ e um marketplace de produtos, tecnologia e aparelhos de acessibilidade e autonomia.",
    `Grupo escolhido pelo vendedor: ${requestedGroup}.`,
    extraKeywords ? `Palavras-chave extras do vendedor: ${compactText(extraKeywords, 180)}.` : "",
    "",
    "Atributos esperados por grupo:",
    Object.entries(attributesByGroup)
      .map(([group, attributes]) => `${group}: ${attributes.join(", ")}`)
      .join("\n"),
    "",
    "Regras:",
    "- Retorne apenas dados para o formulario, em portugues do Brasil.",
    "- Se a imagem nao tiver evidencia clara de marca ou modelo, use valores como 'A confirmar'.",
    "- Nao invente garantias, prazos, dados clinicos, certificacoes ou contato do vendedor.",
    "- Use condicao 'usado' se nao for possivel confirmar que o produto e novo.",
    "- Sugira tags curtas relacionadas ao produto e a acessibilidade.",
    "- Se o grupo escolhido pelo vendedor estiver plausivel, mantenha esse grupo.",
    "- O titulo deve caber em 80 caracteres.",
  ]
    .filter(Boolean)
    .join("\n");
};

const normalizeSuggestion = (suggestion, fallbackGroup) => {
  const listingGroup = normalizeGroup(suggestion?.listingGroup, fallbackGroup);
  const allowedAttributes = new Set(attributesByGroup[listingGroup]);
  const attributes = Array.isArray(suggestion?.attributes)
    ? suggestion.attributes
        .map((attribute) => ({
          name: compactText(attribute?.name, 48),
          value: compactText(attribute?.value, 96),
        }))
        .filter((attribute) => allowedAttributes.has(attribute.name) && attribute.value)
    : [];

  const tags = Array.isArray(suggestion?.tags)
    ? Array.from(new Set(suggestion.tags.map(normalizeTag).filter((tag) => tag.length > 2))).slice(0, 10)
    : [];

  return {
    attributes,
    confidence: Math.max(0, Math.min(1, Number(suggestion?.confidence ?? 0))),
    condition: normalizeCondition(suggestion?.condition),
    description: compactText(suggestion?.description, 1600),
    estimatedPrice: Math.max(0, Number(suggestion?.estimatedPrice ?? 0)),
    listingGroup,
    searchTerm: compactText(suggestion?.searchTerm, 80),
    sku: compactText(suggestion?.sku, 40),
    stock: Math.max(1, Math.min(99, Number(suggestion?.stock ?? 1))),
    summary: compactText(suggestion?.summary, 280),
    tags: tags.length >= 3 ? tags : Array.from(new Set([...tags, "acessibilidade", "assistivo", "autonomia"])),
    title: compactText(suggestion?.title, 80),
  };
};

const identifyProductFromImage = async ({ extraKeywords = "", imageDataUrl, listingGroup = "produtos" }) => {
  if (!isValidImageDataUrl(imageDataUrl)) {
    return {
      error: "Envie uma imagem JPG, PNG ou WEBP valida.",
      invalidImage: true,
    };
  }

  if (imageDataUrl.length > 7_000_000) {
    return {
      error: "A imagem ficou muito grande. Tente enviar uma foto menor.",
      invalidImage: true,
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      error: "Configure OPENAI_API_KEY no servidor para identificar produtos por foto.",
      missingKey: true,
    };
  }

  const requestedGroup = normalizeGroup(listingGroup);
  const model = process.env.OPENAI_VISION_MODEL || "gpt-4.1-mini";

  const response = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
    body: JSON.stringify({
      max_completion_tokens: 900,
      messages: [
        {
          content:
            "Voce e um catalogador de marketplace especializado em produtos de acessibilidade. Responda estritamente no schema solicitado.",
          role: "system",
        },
        {
          content: [
            {
              text: buildPrompt(requestedGroup, extraKeywords),
              type: "text",
            },
            {
              image_url: {
                detail: "auto",
                url: imageDataUrl,
              },
              type: "image_url",
            },
          ],
          role: "user",
        },
      ],
      model,
      response_format: {
        json_schema: {
          name: "acesse_product_photo_identification",
          schema: responseSchema,
          strict: true,
        },
        type: "json_schema",
      },
    }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const statusText = payload?.error?.message ? compactText(payload.error.message, 220) : "Erro na API da OpenAI.";
    throw new Error(statusText);
  }

  const rawContent = payload?.choices?.[0]?.message?.content;
  const parsed = rawContent ? JSON.parse(rawContent) : {};

  return {
    suggestion: normalizeSuggestion(parsed, requestedGroup),
  };
};

module.exports = {
  identifyProductFromImage,
};
