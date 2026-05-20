const { identifyProductFromImage } = require("./product-identify-core.cjs");

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

const getPublicErrorMessage = (error) => {
  const message = error instanceof Error ? error.message : "Erro inesperado.";

  if (/quota|billing|plan/i.test(message)) {
    return "A chave da OpenAI esta sem quota ou com faturamento indisponivel. Verifique billing/creditos da conta.";
  }

  return message;
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
    const result = await identifyProductFromImage(body);

    res.status(result.missingKey || result.invalidImage ? 400 : 200).json(result);
  } catch (error) {
    res.status(502).json({
      error: getPublicErrorMessage(error),
    });
  }
};
