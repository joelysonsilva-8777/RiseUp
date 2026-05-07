import { useEffect, useMemo, useRef, useState, type FormEvent, type FunctionComponent } from "react";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiChevronLeft, FiMessageCircle, FiSend, FiUser } from "react-icons/fi";
import { AppHeader } from "../../components/AppHeader";
import { useAuth } from "../../context/AuthContext";
import { firestore } from "../../firebase/firebase";

type ThreadUser = {
  id: string;
  name: string;
  photoURL?: string;
};

type ThreadProduct = {
  id: string;
  image: string;
  name: string;
};

type MessageThread = {
  buyer: ThreadUser;
  buyerId: string;
  id: string;
  lastMessage?: string;
  participantIds: string[];
  product: ThreadProduct;
  seller: ThreadUser;
  sellerId: string;
  updatedAt?: { toDate?: () => Date } | null;
};

type SellerPublicProfile = {
  displayName?: string;
  photoURL?: string;
};

type ChatMessage = {
  createdAt?: { toDate?: () => Date } | null;
  id: string;
  senderId: string;
  senderName: string;
  text: string;
};

const normalizeThread = (id: string, data: Record<string, unknown>): MessageThread => ({
  buyer: (data.buyer ?? {}) as ThreadUser,
  buyerId: String(data.buyerId ?? ""),
  id,
  lastMessage: data.lastMessage ? String(data.lastMessage) : undefined,
  participantIds: Array.isArray(data.participantIds)
    ? data.participantIds.filter((item): item is string => typeof item === "string")
    : [],
  product: (data.product ?? {}) as ThreadProduct,
  seller: (data.seller ?? {}) as ThreadUser,
  sellerId: String(data.sellerId ?? ""),
  updatedAt: data.updatedAt as MessageThread["updatedAt"],
});

const normalizeMessage = (id: string, data: Record<string, unknown>): ChatMessage => ({
  createdAt: data.createdAt as ChatMessage["createdAt"],
  id,
  senderId: String(data.senderId ?? ""),
  senderName: String(data.senderName ?? "Usuario Acesse+"),
  text: String(data.text ?? ""),
});

const getTimeLabel = (value?: { toDate?: () => Date } | null) => {
  const date = value?.toDate?.();

  if (!date) {
    return "";
  }

  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getDateTimeLabel = (value?: { toDate?: () => Date } | null) => {
  const date = value?.toDate?.();

  if (!date) {
    return "Agora";
  }

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
  });
};

const Avatar = ({ name, photoURL, size = "md" }: { name: string; photoURL?: string; size?: "sm" | "md" }) => (
  <span
    className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#ecf8e8] text-[#167307] ${
      size === "sm" ? "h-10 w-10" : "h-12 w-12"
    }`}
  >
    {photoURL ? <img className="h-full w-full object-cover" alt={name} src={photoURL} /> : <FiUser size={size === "sm" ? 18 : 22} />}
  </span>
);

const TelaMensagens: FunctionComponent = () => {
  const navigate = useNavigate();
  const { threadId } = useParams();
  const { displayName, loading, photoURL, user } = useAuth();
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [sellerProfilesById, setSellerProfilesById] = useState<Record<string, SellerPublicProfile | null>>({});
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, navigate, user]);

  useEffect(() => {
    if (!user) {
      setThreads([]);
      return undefined;
    }

    const threadsQuery = query(
      collection(firestore, "messageThreads"),
      where("participantIds", "array-contains", user.uid)
    );

    return onSnapshot(threadsQuery, (snapshot) => {
      const nextThreads = snapshot.docs
        .map((threadDoc) => normalizeThread(threadDoc.id, threadDoc.data()))
        .sort((first, second) => {
          const firstTime = first.updatedAt?.toDate?.()?.getTime?.() ?? 0;
          const secondTime = second.updatedAt?.toDate?.()?.getTime?.() ?? 0;
          return secondTime - firstTime;
        });

      setThreads(nextThreads);
    });
  }, [user]);

  const sellerIdsToWatch = useMemo(() => {
    const sellerIds = threads
      .map((thread) => thread.sellerId)
      .filter((sellerId): sellerId is string => Boolean(sellerId) && sellerId !== user?.uid);

    return Array.from(new Set(sellerIds)).sort();
  }, [threads, user?.uid]);

  const sellerProfileWatchKey = sellerIdsToWatch.join("|");

  useEffect(() => {
    if (sellerIdsToWatch.length === 0) {
      setSellerProfilesById({});
      return undefined;
    }

    const activeSellerIds = new Set(sellerIdsToWatch);

    setSellerProfilesById((currentProfiles) =>
      Object.fromEntries(Object.entries(currentProfiles).filter(([sellerId]) => activeSellerIds.has(sellerId)))
    );

    const unsubscribes = sellerIdsToWatch.map((sellerId) =>
      onSnapshot(doc(firestore, "sellerProfiles", sellerId), (snapshot) => {
        setSellerProfilesById((currentProfiles) => ({
          ...currentProfiles,
          [sellerId]: snapshot.exists() ? (snapshot.data() as SellerPublicProfile) : null,
        }));
      })
    );

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [sellerProfileWatchKey]);

  const getVisibleCounterpart = (thread: MessageThread): ThreadUser => {
    if (thread.sellerId === user?.uid) {
      return thread.buyer;
    }

    const sellerProfile = sellerProfilesById[thread.sellerId];

    return {
      ...thread.seller,
      name: sellerProfile?.displayName || thread.seller.name || "Vendedor Acesse+",
      photoURL: sellerProfile?.photoURL || thread.seller.photoURL,
    };
  };

  const selectedThread = useMemo(
    () => threads.find((thread) => thread.id === threadId) ?? threads[0] ?? null,
    [threadId, threads]
  );

  useEffect(() => {
    if (!threadId && selectedThread) {
      navigate(`/mensagens/${selectedThread.id}`, { replace: true });
    }
  }, [navigate, selectedThread, threadId]);

  useEffect(() => {
    if (!selectedThread) {
      setMessages([]);
      return undefined;
    }

    const messagesQuery = query(
      collection(firestore, "messageThreads", selectedThread.id, "messages"),
      orderBy("createdAt", "asc")
    );

    return onSnapshot(messagesQuery, (snapshot) => {
      setMessages(snapshot.docs.map((messageDoc) => normalizeMessage(messageDoc.id, messageDoc.data())));
    });
  }, [selectedThread]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  if (!user) {
    return null;
  }

  const counterpart = selectedThread ? getVisibleCounterpart(selectedThread) : null;

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedThread) {
      return;
    }

    const text = messageText.trim();

    if (text.length < 1) {
      setErrorMessage("Digite uma mensagem antes de enviar.");
      return;
    }

    await addDoc(collection(firestore, "messageThreads", selectedThread.id, "messages"), {
      createdAt: serverTimestamp(),
      senderId: user.uid,
      senderName: displayName || user.email || "Usuario Acesse+",
      senderPhotoURL: photoURL,
      text,
    });

    await updateDoc(doc(firestore, "messageThreads", selectedThread.id), {
      lastMessage: text,
      lastSenderId: user.uid,
      updatedAt: serverTimestamp(),
    });

    setMessageText("");
    setErrorMessage("");
  };

  return (
    <main className="min-h-screen bg-[#eef0f1] font-['Montserrat',sans-serif] text-[#111] [&_button]:font-[inherit] [&_h1]:m-0 [&_h2]:m-0 [&_p]:m-0">
      <AppHeader showNav={false} />

      <section className="mx-auto grid h-[calc(100vh-78px)] max-w-[1400px] grid-cols-1 bg-white shadow-[0_1px_8px_rgba(0,0,0,0.08)] md:grid-cols-[360px_minmax(0,1fr)]">
        <aside className={`min-h-0 border-r border-[#dfe3e8] bg-[#f7f8f8] ${selectedThread && threadId ? "hidden md:block" : ""}`}>
          <div className="flex h-[72px] items-center justify-between border-b border-[#dfe3e8] px-4">
            <div className="flex items-center gap-3">
              <Avatar name={displayName || "Usuario"} photoURL={photoURL} size="sm" />
              <div>
                <h1 className="text-[17px] leading-[22px] text-[#111]">Mensagens</h1>
                <p className="text-[12px] leading-[16px] text-[#667085]">Conversas por produto</p>
              </div>
            </div>
            <Link className="text-[#167307] no-underline" to="/">
              Loja
            </Link>
          </div>

          <div className="max-h-[calc(100vh-150px)] overflow-y-auto">
            {threads.length === 0 ? (
              <div className="px-5 py-8 text-center text-[#667085]">
                <FiMessageCircle className="mx-auto text-[#167307]" size={34} />
                <p className="mt-3 text-[14px] leading-[21px]">Nenhuma conversa ainda.</p>
              </div>
            ) : (
              threads.map((thread) => {
                const threadCounterpart = getVisibleCounterpart(thread);
                const isActive = selectedThread?.id === thread.id;

                return (
                  <Link
                    className={`grid grid-cols-[48px_1fr] gap-3 border-b border-[#edf0f2] px-4 py-3 text-[#111] no-underline transition-colors ${
                      isActive ? "bg-[#ecf8e8]" : "bg-white hover:bg-[#f3f5f6]"
                    }`}
                    key={thread.id}
                    to={`/mensagens/${thread.id}`}
                  >
                    <Avatar name={threadCounterpart.name} photoURL={threadCounterpart.photoURL} size="sm" />
                    <div className="min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="truncate text-[14px] leading-[19px] text-[#111]">{threadCounterpart.name}</h2>
                        <span className="shrink-0 text-[11px] leading-[14px] text-[#667085]">
                          {getTimeLabel(thread.updatedAt)}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-[12px] leading-[17px] text-[#667085]">{thread.product.name}</p>
                      <p className="mt-1 truncate text-[12px] leading-[17px] text-[#333]">
                        {thread.lastMessage || "Conversa iniciada pelo anuncio."}
                      </p>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </aside>

        <section className={`${selectedThread ? "grid" : "hidden md:grid"} min-h-0 grid-rows-[72px_minmax(0,1fr)_auto]`}>
          {selectedThread && counterpart ? (
            <>
              <header className="flex h-[72px] items-center justify-between border-b border-[#dfe3e8] bg-[#f7f8f8] px-4">
                <div className="flex min-w-0 items-center gap-3">
                  <Link className="text-[#167307] no-underline md:hidden" to="/mensagens">
                    <FiChevronLeft size={20} />
                  </Link>
                  <Avatar name={counterpart.name} photoURL={counterpart.photoURL} />
                  <div className="min-w-0">
                    <h2 className="truncate text-[16px] leading-[21px] text-[#111]">{counterpart.name}</h2>
                    <p className="truncate text-[12px] leading-[17px] text-[#667085]">
                      Conversa aberta pelo produto abaixo
                    </p>
                  </div>
                </div>
                <Link
                  className="flex min-w-0 max-w-[280px] items-center gap-3 rounded-[8px] bg-white px-3 py-2 text-[#111] no-underline"
                  to={`/produto/${selectedThread.product.id}`}
                >
                  <img
                    className="h-10 w-10 shrink-0 rounded-[6px] object-contain"
                    alt={selectedThread.product.name}
                    src={selectedThread.product.image}
                  />
                  <span className="truncate text-[12px] leading-[17px]">{selectedThread.product.name}</span>
                </Link>
              </header>

              <div className="min-h-0 overflow-y-auto bg-[#e9f1e5] px-4 py-5">
                <div className="mx-auto grid max-w-[820px] gap-3">
                  {messages.map((message) => {
                    const isMine = message.senderId === user.uid;

                    return (
                      <article
                        className={`max-w-[78%] rounded-[8px] px-4 py-2 shadow-[0_1px_2px_rgba(0,0,0,0.08)] ${
                          isMine ? "ml-auto bg-[#d9fdd3]" : "mr-auto bg-white"
                        }`}
                        key={message.id}
                      >
                        <p className="text-[14px] leading-[21px] text-[#111]">{message.text}</p>
                        <p className="mt-1 text-right text-[11px] leading-[14px] text-[#667085]">
                          {getDateTimeLabel(message.createdAt)}
                        </p>
                      </article>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              <form className="border-t border-[#dfe3e8] bg-[#f7f8f8] px-4 py-3" onSubmit={sendMessage}>
                <label className="sr-only" htmlFor="message-text">
                  Mensagem
                </label>
                <div className="grid grid-cols-[minmax(0,1fr)_48px] gap-3">
                  <input
                    className="h-12 rounded-[24px] border border-[#dfe3e8] bg-white px-5 text-[14px] outline-none focus:border-[#167307]"
                    id="message-text"
                    onChange={(event) => setMessageText(event.target.value)}
                    placeholder="Digite uma mensagem"
                    value={messageText}
                  />
                  <button
                    aria-label="Enviar mensagem"
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-[#167307] text-white"
                    type="submit"
                  >
                    <FiSend size={20} />
                  </button>
                </div>
                {errorMessage ? <p className="mt-2 text-[12px] text-[#b42318]">{errorMessage}</p> : null}
              </form>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center bg-[#f7f8f8] px-5 text-center">
              <FiMessageCircle className="text-[#167307]" size={48} />
              <h2 className="mt-4 text-[20px] leading-[26px] text-[#111]">Selecione uma conversa</h2>
              <p className="mt-2 max-w-[360px] text-[14px] leading-[22px] text-[#667085]">
                As conversas ficam organizadas por vendedor e produto para nao perder contexto.
              </p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
};

export default TelaMensagens;
