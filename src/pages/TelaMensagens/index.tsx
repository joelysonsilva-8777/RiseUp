import { useEffect, useMemo, useRef, useState, type FormEvent, type FunctionComponent } from "react";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FiCamera,
  FiChevronLeft,
  FiImage,
  FiMessageCircle,
  FiPackage,
  FiPlus,
  FiSend,
  FiShoppingBag,
  FiShoppingCart,
  FiStar,
  FiUser,
} from "react-icons/fi";
import { AppHeader } from "../../components/AppHeader";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { formatCurrency, type Product } from "../../data/products";
import { firestore, storage } from "../../firebase/firebase";
import { useProducts } from "../../hooks/useProducts";

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
  attachmentType?: "image" | "order" | "product" | "purchase";
  createdAt?: { toDate?: () => Date } | null;
  id: string;
  imageName?: string;
  imageUrl?: string;
  order?: MessageOrderAttachment;
  product?: MessageProductAttachment;
  senderId: string;
  senderName: string;
  text: string;
};

type MessageProductAttachment = {
  id: string;
  image: string;
  name: string;
  price?: number;
};

type MessageOrderAttachment = {
  id: string;
  itemCount: number;
  items: MessageProductAttachment[];
  total: number;
};

type OrderItem = {
  image: string;
  name: string;
  price: number;
  productId: string;
  quantity: number;
  sellerName?: string;
  total: number;
};

type UserOrder = {
  createdAt?: { toDate?: () => Date } | null;
  id: string;
  itemCount: number;
  items: OrderItem[];
  status?: string;
  total: number;
};

type AttachmentPanel = "buy" | "orders" | "products" | null;

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
  attachmentType: data.attachmentType as ChatMessage["attachmentType"],
  createdAt: data.createdAt as ChatMessage["createdAt"],
  id,
  imageName: data.imageName ? String(data.imageName) : undefined,
  imageUrl: data.imageUrl ? String(data.imageUrl) : undefined,
  order: data.order as MessageOrderAttachment | undefined,
  product: data.product as MessageProductAttachment | undefined,
  senderId: String(data.senderId ?? ""),
  senderName: String(data.senderName ?? "Usuario Acesse+"),
  text: String(data.text ?? ""),
});

const normalizeOrder = (id: string, data: Record<string, unknown>): UserOrder => ({
  createdAt: data.createdAt as UserOrder["createdAt"],
  id,
  itemCount: Number(data.itemCount ?? 0),
  items: Array.isArray(data.items) ? (data.items as OrderItem[]) : [],
  status: data.status ? String(data.status) : undefined,
  total: Number(data.total ?? 0),
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

const productToAttachment = (product: Product | MessageProductAttachment): MessageProductAttachment => ({
  id: product.id,
  image: product.image,
  name: product.name,
  price: "price" in product ? product.price : undefined,
});

const TelaMensagens: FunctionComponent = () => {
  const navigate = useNavigate();
  const { threadId } = useParams();
  const { displayName, loading, photoURL, user } = useAuth();
  const { addItem } = useCart();
  const { products } = useProducts();
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [messageText, setMessageText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const [activeAttachmentPanel, setActiveAttachmentPanel] = useState<AttachmentPanel>(null);
  const [sendingAttachment, setSendingAttachment] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [serviceRating, setServiceRating] = useState(5);
  const [serviceComment, setServiceComment] = useState("");
  const [ratingMessage, setRatingMessage] = useState("");
  const [savingRating, setSavingRating] = useState(false);
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

  useEffect(() => {
    if (!user) {
      setOrders([]);
      return undefined;
    }

    const ordersQuery = query(collection(firestore, "users", user.uid, "orders"), orderBy("createdAt", "desc"));

    return onSnapshot(ordersQuery, (snapshot) => {
      setOrders(snapshot.docs.map((orderDoc) => normalizeOrder(orderDoc.id, orderDoc.data())));
    });
  }, [user]);

  const sellerIdsToWatch = useMemo(() => {
    const sellerIds = threads
      .map((thread) => thread.sellerId)
      .filter((sellerId): sellerId is string => Boolean(sellerId) && sellerId !== user?.uid);

    return Array.from(new Set(sellerIds)).sort();
  }, [threads, user?.uid]);

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
  }, [sellerIdsToWatch]);

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

  const sellerProducts = useMemo(() => {
    if (!selectedThread) {
      return [];
    }

    const productsFromSeller = products.filter((product) => product.sellerId === selectedThread.sellerId);
    const selectedProduct = products.find((product) => product.id === selectedThread.product.id);

    if (productsFromSeller.length > 0) {
      return productsFromSeller;
    }

    return selectedProduct ? [selectedProduct] : [];
  }, [products, selectedThread]);

  const sellerProductIds = useMemo(
    () => new Set(sellerProducts.map((product) => product.id)),
    [sellerProducts]
  );

  const sellerOrders = useMemo(
    () =>
      orders
        .map((order) => ({
          ...order,
          items: order.items.filter((item) => sellerProductIds.has(item.productId)),
        }))
        .filter((order) => order.items.length > 0),
    [orders, sellerProductIds]
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

  useEffect(() => {
    if (!selectedThread || !user || messages.length === 0) {
      return;
    }

    void updateDoc(doc(firestore, "messageThreads", selectedThread.id), {
      [`readAt.${user.uid}`]: serverTimestamp(),
    }).catch(() => undefined);
  }, [messages.length, selectedThread, user]);

  if (!user) {
    return null;
  }

  const counterpart = selectedThread ? getVisibleCounterpart(selectedThread) : null;

  const sendChatMessage = async (message: {
    attachmentType?: ChatMessage["attachmentType"];
    imageName?: string;
    imageUrl?: string;
    order?: MessageOrderAttachment;
    product?: MessageProductAttachment;
    text: string;
  }) => {
    if (!selectedThread) {
      return;
    }

    const text = message.text.trim();

    if (text.length < 1 && !message.attachmentType) {
      setErrorMessage("Digite uma mensagem antes de enviar.");
      return;
    }

    await addDoc(collection(firestore, "messageThreads", selectedThread.id, "messages"), {
      attachmentType: message.attachmentType ?? null,
      createdAt: serverTimestamp(),
      imageName: message.imageName ?? null,
      imageUrl: message.imageUrl ?? null,
      order: message.order ?? null,
      product: message.product ?? null,
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

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await sendChatMessage({ text: messageText });
  };

  const uploadChatImage = async (file: File) => {
    if (!selectedThread) {
      throw new Error("Selecione uma conversa antes de enviar a imagem.");
    }

    const fileName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
    const storageRef = ref(storage, `messages/${user.uid}/${selectedThread.id}/${Date.now()}-${fileName}`);

    await uploadBytes(storageRef, file, {
      contentType: file.type,
    });

    return getDownloadURL(storageRef);
  };

  const handleImageAttachment = async (file: File | null) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Envie uma imagem valida.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("A imagem precisa ter ate 10 MB.");
      return;
    }

    setSendingAttachment(true);
    setErrorMessage("");

    try {
      const imageUrl = await uploadChatImage(file);

      await sendChatMessage({
        attachmentType: "image",
        imageName: file.name,
        imageUrl,
        text: "Foto enviada.",
      });
      setIsAttachmentMenuOpen(false);
      setActiveAttachmentPanel(null);
    } catch {
      setErrorMessage("Nao foi possivel enviar a imagem agora.");
    } finally {
      setSendingAttachment(false);
    }
  };

  const attachProductToChat = async (product: Product) => {
    await sendChatMessage({
      attachmentType: "product",
      product: productToAttachment(product),
      text: `Produto anexado: ${product.name}`,
    });
    setIsAttachmentMenuOpen(false);
    setActiveAttachmentPanel(null);
  };

  const attachOrderToChat = async (order: UserOrder) => {
    const orderAttachment: MessageOrderAttachment = {
      id: order.id,
      itemCount: order.items.reduce((total, item) => total + item.quantity, 0),
      items: order.items.slice(0, 4).map((item) => ({
        id: item.productId,
        image: item.image,
        name: item.name,
        price: item.price,
      })),
      total: order.items.reduce((total, item) => total + item.total, 0),
    };

    await sendChatMessage({
      attachmentType: "order",
      order: orderAttachment,
      text: `Pedido anexado: #${order.id.slice(0, 8).toUpperCase()}`,
    });
    setIsAttachmentMenuOpen(false);
    setActiveAttachmentPanel(null);
  };

  const buyNowFromChat = async (product: Product) => {
    setSendingAttachment(true);
    setErrorMessage("");

    try {
      await addItem(product, 1);
      await sendChatMessage({
        attachmentType: "purchase",
        product: productToAttachment(product),
        text: `Comprei pelo chat: ${product.name}`,
      });
      navigate("/carrinho");
    } catch {
      setErrorMessage("Nao foi possivel comprar pelo chat agora.");
    } finally {
      setSendingAttachment(false);
    }
  };

  const submitServiceRating = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedThread || selectedThread.sellerId === user.uid) {
      return;
    }

    setSavingRating(true);
    setRatingMessage("");

    try {
      await setDoc(
        doc(firestore, "sellerProfiles", selectedThread.sellerId, "serviceReviews", `${user.uid}_${selectedThread.id}`),
        {
          comment: serviceComment.trim(),
          rating: serviceRating,
          sellerId: selectedThread.sellerId,
          threadId: selectedThread.id,
          updatedAt: serverTimestamp(),
          userId: user.uid,
          userName: displayName || user.email || "Usuario Acesse+",
          userPhotoURL: photoURL,
        },
        { merge: true }
      );

      await sendChatMessage({
        text: `Avaliei o atendimento com ${serviceRating} estrela(s).`,
      });
      setRatingMessage("Avaliacao enviada.");
      setIsRatingOpen(false);
      setServiceComment("");
    } catch {
      setRatingMessage("Nao foi possivel enviar a avaliacao agora.");
    } finally {
      setSavingRating(false);
    }
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
                <div className="flex min-w-0 items-center gap-2">
                  {selectedThread.sellerId !== user.uid ? (
                    <button
                      aria-label="Avaliar atendimento"
                      className="flex h-10 shrink-0 items-center gap-2 rounded-[8px] bg-[#ecf8e8] px-3 text-[12px] text-[#167307]"
                      onClick={() => {
                        setIsRatingOpen(true);
                        setRatingMessage("");
                      }}
                      type="button"
                    >
                      <FiStar />
                      <span className="hidden md:inline">Avaliar atendimento</span>
                    </button>
                  ) : null}
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
                </div>
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
                        {message.text ? <p className="text-[14px] leading-[21px] text-[#111]">{message.text}</p> : null}

                        {message.attachmentType === "image" && message.imageUrl ? (
                          <a className="mt-2 block overflow-hidden rounded-[8px] bg-white" href={message.imageUrl} target="_blank" rel="noreferrer">
                            <img className="max-h-[320px] w-full object-contain" alt={message.imageName || "Imagem enviada"} src={message.imageUrl} />
                          </a>
                        ) : null}

                        {(message.attachmentType === "product" || message.attachmentType === "purchase") && message.product ? (
                          <Link
                            className="mt-2 grid grid-cols-[68px_1fr] gap-3 rounded-[8px] border border-[#dfe3e8] bg-white p-2 text-[#111] no-underline"
                            to={`/produto/${message.product.id}`}
                          >
                            <img className="h-[68px] w-[68px] rounded-[6px] object-contain" alt={message.product.name} src={message.product.image} />
                            <span className="min-w-0">
                              <span className="line-clamp-2 text-[13px] leading-[18px]">{message.product.name}</span>
                              {message.product.price ? (
                                <span className="mt-1 block text-[13px] leading-[18px] text-[#167307]">
                                  {formatCurrency(message.product.price)}
                                </span>
                              ) : null}
                              {message.attachmentType === "purchase" ? (
                                <span className="mt-1 inline-block rounded-full bg-[#ecf8e8] px-2 py-0.5 text-[10px] text-[#167307]">
                                  Compra iniciada pelo chat
                                </span>
                              ) : null}
                            </span>
                          </Link>
                        ) : null}

                        {message.attachmentType === "order" && message.order ? (
                          <div className="mt-2 rounded-[8px] border border-[#dfe3e8] bg-white p-3">
                            <p className="text-[12px] leading-[16px] text-[#667085]">
                              Pedido #{message.order.id.slice(0, 8).toUpperCase()}
                            </p>
                            <p className="mt-1 text-[14px] leading-[19px] text-[#111]">
                              {message.order.itemCount} item(ns) - {formatCurrency(message.order.total)}
                            </p>
                            <div className="mt-3 grid gap-2">
                              {message.order.items.map((item) => (
                                <Link
                                  className="grid grid-cols-[42px_1fr] gap-2 text-[#111] no-underline"
                                  key={item.id}
                                  to={`/produto/${item.id}`}
                                >
                                  <img className="h-[42px] w-[42px] rounded-[5px] object-contain" alt={item.name} src={item.image} />
                                  <span className="line-clamp-2 text-[12px] leading-[16px]">{item.name}</span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        ) : null}
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
                {isAttachmentMenuOpen ? (
                  <div className="mx-auto mb-3 max-w-[820px] rounded-[12px] border border-[#dfe3e8] bg-white p-3 shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                      <label className="flex h-[74px] cursor-pointer flex-col items-center justify-center gap-2 rounded-[8px] bg-[#f5f6f7] text-[12px] text-[#167307] hover:bg-[#ecf8e8]">
                        <FiImage size={20} />
                        Galeria
                        <input
                          accept="image/*"
                          className="hidden"
                          disabled={sendingAttachment}
                          onChange={(event) => {
                            const file = event.target.files?.[0] ?? null;
                            event.target.value = "";
                            void handleImageAttachment(file);
                          }}
                          type="file"
                        />
                      </label>
                      <label className="flex h-[74px] cursor-pointer flex-col items-center justify-center gap-2 rounded-[8px] bg-[#f5f6f7] text-[12px] text-[#167307] hover:bg-[#ecf8e8]">
                        <FiCamera size={20} />
                        Camera
                        <input
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          disabled={sendingAttachment}
                          onChange={(event) => {
                            const file = event.target.files?.[0] ?? null;
                            event.target.value = "";
                            void handleImageAttachment(file);
                          }}
                          type="file"
                        />
                      </label>
                      <button
                        className={`flex h-[74px] flex-col items-center justify-center gap-2 rounded-[8px] text-[12px] ${
                          activeAttachmentPanel === "products" ? "bg-[#ecf8e8] text-[#167307]" : "bg-[#f5f6f7] text-[#167307]"
                        }`}
                        onClick={() => setActiveAttachmentPanel((current) => (current === "products" ? null : "products"))}
                        type="button"
                      >
                        <FiPackage size={20} />
                        Produtos
                      </button>
                      <button
                        className={`flex h-[74px] flex-col items-center justify-center gap-2 rounded-[8px] text-[12px] ${
                          activeAttachmentPanel === "orders" ? "bg-[#ecf8e8] text-[#167307]" : "bg-[#f5f6f7] text-[#167307]"
                        }`}
                        onClick={() => setActiveAttachmentPanel((current) => (current === "orders" ? null : "orders"))}
                        type="button"
                      >
                        <FiShoppingBag size={20} />
                        Pedidos
                      </button>
                      <button
                        className={`col-span-2 flex h-[74px] flex-col items-center justify-center gap-2 rounded-[8px] text-[12px] sm:col-span-1 ${
                          activeAttachmentPanel === "buy" ? "bg-[#ecf8e8] text-[#167307]" : "bg-[#f5f6f7] text-[#167307]"
                        }`}
                        onClick={() => setActiveAttachmentPanel((current) => (current === "buy" ? null : "buy"))}
                        type="button"
                      >
                        <FiShoppingCart size={20} />
                        Comprar agora
                      </button>
                    </div>

                    {activeAttachmentPanel === "products" ? (
                      <div className="mt-3 max-h-[260px] overflow-y-auto rounded-[8px] border border-[#edf0f2]">
                        {sellerProducts.length === 0 ? (
                          <p className="px-4 py-4 text-[13px] leading-[19px] text-[#667085]">
                            Nenhum produto deste vendedor foi encontrado.
                          </p>
                        ) : (
                          sellerProducts.map((product) => (
                            <div className="grid grid-cols-[56px_1fr_auto] items-center gap-3 border-b border-[#edf0f2] px-3 py-2 last:border-b-0" key={product.id}>
                              <img className="h-14 w-14 rounded-[6px] object-contain" alt={product.name} src={product.image} />
                              <div className="min-w-0">
                                <p className="line-clamp-2 text-[13px] leading-[18px] text-[#111]">{product.name}</p>
                                <p className="mt-1 text-[12px] text-[#167307]">{formatCurrency(product.price)}</p>
                              </div>
                              <button
                                className="h-9 rounded-[6px] bg-[#ecf8e8] px-3 text-[12px] text-[#167307]"
                                onClick={() => {
                                  void attachProductToChat(product).catch(() => {
                                    setErrorMessage("Nao foi possivel anexar o produto.");
                                  });
                                }}
                                type="button"
                              >
                                Anexar
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    ) : null}

                    {activeAttachmentPanel === "orders" ? (
                      <div className="mt-3 max-h-[260px] overflow-y-auto rounded-[8px] border border-[#edf0f2]">
                        {sellerOrders.length === 0 ? (
                          <p className="px-4 py-4 text-[13px] leading-[19px] text-[#667085]">
                            Nenhum pedido seu com produtos deste vendedor foi encontrado.
                          </p>
                        ) : (
                          sellerOrders.map((order) => (
                            <div className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-[#edf0f2] px-3 py-3 last:border-b-0" key={order.id}>
                              <div className="min-w-0">
                                <p className="text-[13px] leading-[18px] text-[#111]">Pedido #{order.id.slice(0, 8).toUpperCase()}</p>
                                <p className="mt-1 truncate text-[12px] leading-[17px] text-[#667085]">
                                  {order.items.map((item) => item.name).join(", ")}
                                </p>
                                <p className="mt-1 text-[12px] text-[#167307]">
                                  {formatCurrency(order.items.reduce((total, item) => total + item.total, 0))}
                                </p>
                              </div>
                              <button
                                className="h-9 rounded-[6px] bg-[#ecf8e8] px-3 text-[12px] text-[#167307]"
                                onClick={() => {
                                  void attachOrderToChat(order).catch(() => {
                                    setErrorMessage("Nao foi possivel anexar o pedido.");
                                  });
                                }}
                                type="button"
                              >
                                Anexar
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    ) : null}

                    {activeAttachmentPanel === "buy" ? (
                      <div className="mt-3 max-h-[260px] overflow-y-auto rounded-[8px] border border-[#edf0f2]">
                        {selectedThread.sellerId === user.uid ? (
                          <p className="px-4 py-4 text-[13px] leading-[19px] text-[#667085]">
                            Comprar agora aparece para compradores conversando com o vendedor.
                          </p>
                        ) : sellerProducts.length === 0 ? (
                          <p className="px-4 py-4 text-[13px] leading-[19px] text-[#667085]">
                            Nenhum produto deste vendedor foi encontrado.
                          </p>
                        ) : (
                          sellerProducts.map((product) => (
                            <div className="grid grid-cols-[56px_1fr_auto] items-center gap-3 border-b border-[#edf0f2] px-3 py-2 last:border-b-0" key={product.id}>
                              <img className="h-14 w-14 rounded-[6px] object-contain" alt={product.name} src={product.image} />
                              <div className="min-w-0">
                                <p className="line-clamp-2 text-[13px] leading-[18px] text-[#111]">{product.name}</p>
                                <p className="mt-1 text-[12px] text-[#167307]">{formatCurrency(product.price)}</p>
                              </div>
                              <button
                                className="h-9 rounded-[6px] bg-[#167307] px-3 text-[12px] text-white disabled:cursor-not-allowed disabled:bg-[#9dbb99]"
                                disabled={sendingAttachment}
                                onClick={() => void buyNowFromChat(product)}
                                type="button"
                              >
                                Comprar
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <div className="grid grid-cols-[48px_minmax(0,1fr)_48px] gap-3">
                  <button
                    aria-label={isAttachmentMenuOpen ? "Fechar anexos" : "Abrir anexos"}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ecf8e8] text-[#167307] transition-colors hover:bg-[#dff5d4]"
                    onClick={() => {
                      setIsAttachmentMenuOpen((current) => !current);
                      setActiveAttachmentPanel(null);
                    }}
                    type="button"
                  >
                    <FiPlus className={`transition-transform duration-200 ${isAttachmentMenuOpen ? "rotate-45" : ""}`} size={23} />
                  </button>
                  <input
                    className="h-12 rounded-[24px] border border-[#dfe3e8] bg-white px-5 text-[14px] outline-none focus:border-[#167307]"
                    id="message-text"
                    onChange={(event) => setMessageText(event.target.value)}
                    placeholder="Digite uma mensagem"
                    value={messageText}
                  />
                  <button
                    aria-label="Enviar mensagem"
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-[#167307] text-white disabled:cursor-not-allowed disabled:bg-[#9dbb99]"
                    disabled={sendingAttachment}
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

      {isRatingOpen && selectedThread && selectedThread.sellerId !== user.uid ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 px-4">
          <form
            className="w-full max-w-[420px] rounded-[10px] bg-white p-5 shadow-[0_18px_60px_rgba(0,0,0,0.26)]"
            onSubmit={submitServiceRating}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[18px] leading-[23px] text-[#111]">Avaliar atendimento</h2>
                <p className="mt-2 text-[13px] leading-[20px] text-[#667085]">
                  Sua avaliacao ajuda outros compradores a entenderem a qualidade do atendimento.
                </p>
              </div>
              <button
                aria-label="Fechar avaliacao"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f1f3f5] text-[#52606d]"
                onClick={() => setIsRatingOpen(false)}
                type="button"
              >
                <FiPlus className="rotate-45" size={20} />
              </button>
            </div>

            <div className="mt-5 flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  aria-label={`${rating} estrela(s)`}
                  className={`flex h-11 w-11 items-center justify-center rounded-full border ${
                    rating <= serviceRating
                      ? "border-[#167307] bg-[#ecf8e8] text-[#167307]"
                      : "border-[#dfe3e8] bg-white text-[#9aa4b2]"
                  }`}
                  key={rating}
                  onClick={() => setServiceRating(rating)}
                  type="button"
                >
                  <FiStar fill={rating <= serviceRating ? "currentColor" : "none"} size={20} />
                </button>
              ))}
            </div>

            <label className="mt-5 block">
              <span className="mb-2 block text-[13px] leading-[16px] text-[#333]">Comentario opcional</span>
              <textarea
                className="min-h-[110px] w-full resize-y rounded-[8px] border border-[#dfe3e8] px-4 py-3 text-[14px] leading-[21px] outline-none focus:border-[#167307]"
                maxLength={500}
                onChange={(event) => setServiceComment(event.target.value)}
                placeholder="Conte como foi o atendimento do vendedor."
                value={serviceComment}
              />
            </label>

            {ratingMessage ? <p className="mt-3 text-[12px] leading-[17px] text-[#167307]">{ratingMessage}</p> : null}

            <div className="mt-5 flex justify-end gap-3">
              <button
                className="h-10 rounded-[6px] bg-transparent px-4 text-[13px] text-[#667085]"
                onClick={() => setIsRatingOpen(false)}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="h-10 rounded-[6px] bg-[#167307] px-5 text-[13px] text-white disabled:cursor-not-allowed disabled:bg-[#9dbb99]"
                disabled={savingRating}
                type="submit"
              >
                {savingRating ? "Enviando..." : "Enviar avaliacao"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </main>
  );
};

export default TelaMensagens;
