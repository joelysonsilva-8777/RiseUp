const { createAssistantAnswer } = require("./assistant-core.cjs");

const readBody = async (req) => {
  if (req.body) {
    return typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  }

  const chunks = [];

  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk));
  }

  const rawBody = Buffer.concat(chunks).toString("utf8");
  return rawBody ? JSON.parse(rawBody) : {};
};

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Metodo nao permitido." });
    return;
  }

  try {
    const body = await readBody(req);
    const result = await createAssistantAnswer(body);

    res.status(result.missingKey ? 503 : 200).json(result);
  } catch (error) {
    res.status(502).json({
      answer: "O assistente ficou indisponivel por um instante. Tente novamente em alguns segundos.",
      error: error instanceof Error ? error.message : "Erro inesperado.",
    });
  }
};
