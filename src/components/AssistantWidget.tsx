import { useMemo, useRef, useState, type FormEvent } from "react";
import { useLocation } from "react-router-dom";
import { FiHelpCircle, FiMessageCircle, FiSend, FiX } from "react-icons/fi";
import { useProducts } from "../hooks/useProducts";

type AssistantMessage = {
  content: string;
  id: string;
  role: "assistant" | "user";
};

type AssistantProductContext = {
  category: string;
  city?: string;
  description: string;
  name: string;
  price: number;
  state?: string;
  stock?: number;
  tags?: string[];
};

const initialMessages: AssistantMessage[] = [
  {
    content: "Oi, eu sou o assistente Acesse+. Posso ajudar com produtos, compras, entrega, conta e venda no site.",
    id: "welcome",
    role: "assistant",
  },
];

const quickQuestions = [
  "Como comprar um produto?",
  "Quais produtos de acessibilidade existem?",
  "Como vender na Acesse+?",
  "Como funciona o carrinho?",
];

const createMessageId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const AssistantWidget = () => {
  const location = useLocation();
  const { products } = useProducts();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<AssistantMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isAuthPath = location.pathname === "/login" || location.pathname === "/cadastro" || location.pathname === "/registro";

  const productContext = useMemo<AssistantProductContext[]>(
    () =>
      products.slice(0, 16).map((product) => ({
        category: product.category,
        city: product.city,
        description: product.description,
        name: product.name,
        price: product.price,
        state: product.state,
        stock: product.stock,
        tags: product.tags,
      })),
    [products]
  );

  const submitQuestion = async (question: string) => {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || isLoading) {
      return;
    }

    const userMessage: AssistantMessage = {
      content: trimmedQuestion,
      id: createMessageId(),
      role: "user",
    };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/assistant", {
        body: JSON.stringify({
          history: nextMessages.slice(-8).map(({ content, role }) => ({ content, role })),
          message: trimmedQuestion,
          pagePath: `${location.pathname}${location.search}`,
          products: productContext,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const payload = (await response.json()) as { answer?: string };

      if (!response.ok && !payload.answer) {
        throw new Error("Nao foi possivel falar com o assistente agora.");
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          content: payload.answer ?? "Nao encontrei uma resposta segura no contexto da Acesse+ agora.",
          id: createMessageId(),
          role: "assistant",
        },
      ]);
    } catch {
      const fallbackMessage =
        "Nao consegui responder agora. Confira sua conexao ou tente de novo em alguns instantes.";
      setErrorMessage(fallbackMessage);
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          content: fallbackMessage,
          id: createMessageId(),
          role: "assistant",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitQuestion(input);
  };

  return (
    <div
      className={`fixed bottom-5 left-4 z-[80] font-['Montserrat',sans-serif] text-[#071735] sm:left-6 ${
        isAuthPath ? "hidden md:block" : ""
      }`}
    >
      {isOpen ? (
        <section
          aria-label="Assistente Acesse+"
          className="mb-4 flex max-h-[min(620px,calc(100vh-112px))] w-[calc(100vw-32px)] max-w-[386px] flex-col overflow-hidden rounded-[8px] border border-[#d7e8d4] bg-white shadow-[0_18px_48px_rgba(7,23,53,0.22)]"
        >
          <header className="flex items-center gap-3 bg-[#167307] px-4 py-3 text-white">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-white/15">
              <FiMessageCircle size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-[15px] leading-[19px]">Assistente Acesse+</h2>
              <p className="mt-0.5 truncate text-[11px] leading-[14px] text-white/78">Produtos, compras e suporte do site</p>
            </div>
            <button
              aria-label="Fechar assistente"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] bg-white/10 p-0 text-white transition-colors hover:bg-white/18"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              <FiX size={19} />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-[#f5f6f7] px-4 py-4">
            {messages.map((message) => (
              <div
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                key={message.id}
              >
                <p
                  className={`max-w-[86%] rounded-[8px] px-3 py-2 text-[13px] leading-[20px] shadow-[0_1px_2px_rgba(0,0,0,0.06)] ${
                    message.role === "user"
                      ? "bg-[#167307] text-white"
                      : "border border-[#e2eadf] bg-white text-[#263238]"
                  }`}
                >
                  {message.content}
                </p>
              </div>
            ))}

            {isLoading ? (
              <div className="flex justify-start">
                <p className="rounded-[8px] border border-[#e2eadf] bg-white px-3 py-2 text-[13px] leading-[20px] text-[#52606d]">
                  Pensando na resposta...
                </p>
              </div>
            ) : null}
          </div>

          <div className="border-t border-[#e5ece2] bg-white px-4 py-3">
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {quickQuestions.map((question) => (
                <button
                  className="shrink-0 rounded-[6px] border border-[#d7e8d4] bg-[#f5fbf3] px-3 py-2 text-[11px] leading-[14px] text-[#167307] transition-colors hover:bg-[#ecf8e8]"
                  disabled={isLoading}
                  key={question}
                  onClick={() => void submitQuestion(question)}
                  type="button"
                >
                  {question}
                </button>
              ))}
            </div>

            <form className="grid grid-cols-[minmax(0,1fr)_42px] gap-2" onSubmit={handleSubmit}>
              <label className="sr-only" htmlFor="assistant-question">
                Pergunta para o assistente
              </label>
              <input
                className="h-11 min-w-0 rounded-[6px] border border-[#dfe3e8] bg-white px-3 text-[13px] leading-[18px] text-[#071735] outline-none placeholder:text-[#8493ad] focus:border-[#167307]"
                disabled={isLoading}
                id="assistant-question"
                maxLength={500}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Pergunte sobre o site ou produtos"
                ref={inputRef}
                type="text"
                value={input}
              />
              <button
                aria-label="Enviar pergunta"
                className="flex h-11 w-[42px] items-center justify-center rounded-[6px] bg-[#167307] text-white transition-colors hover:bg-[#125d05] disabled:cursor-not-allowed disabled:bg-[#9dbb99]"
                disabled={isLoading || input.trim().length < 2}
                type="submit"
              >
                <FiSend size={18} />
              </button>
            </form>
            {errorMessage ? <p className="mt-2 text-[11px] leading-[15px] text-[#b42318]">{errorMessage}</p> : null}
          </div>
        </section>
      ) : null}

      <button
        aria-label={isOpen ? "Fechar assistente Acesse+" : "Abrir assistente Acesse+"}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full border border-[#d7e8d4] bg-[#167307] text-white shadow-[0_12px_28px_rgba(7,23,53,0.24)] transition-transform hover:scale-[1.03] hover:bg-[#125d05]"
        onClick={() => {
          setIsOpen((current) => !current);
          window.setTimeout(() => inputRef.current?.focus(), 120);
        }}
        type="button"
      >
        {isOpen ? <FiX size={23} /> : <FiHelpCircle size={25} />}
        <span
          aria-hidden="true"
          className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#ffb020]"
        />
      </button>
    </div>
  );
};

export default AssistantWidget;
