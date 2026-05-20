import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowUp,
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiCreditCard,
  FiGrid,
  FiHelpCircle,
  FiHome,
  FiLogOut,
  FiMessageCircle,
  FiMessageSquare,
  FiRefreshCw,
  FiShoppingBag,
  FiTag,
  FiUser,
  FiUserPlus,
  FiX,
  FiMenu,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { firestore } from "../firebase/firebase";
import { useProducts } from "../hooks/useProducts";

const HeaderIconButton = ({
  children,
  label,
  className = "",
  onClick,
}: {
  children: ReactNode;
  label: string;
  className?: string;
  onClick?: () => void;
}) => (
  <button
    aria-label={label}
    className={`flex h-9 w-9 shrink-0 items-center justify-center border-0 bg-transparent p-0 text-white ${className}`}
    onClick={onClick}
    type="button"
  >
    {children}
  </button>
);

const CartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M5.6 21.4A1.93 1.93 0 0 1 5 20c0-.55.2-1.02.59-1.41A1.93 1.93 0 0 1 7 18c.55 0 1.02.2 1.41.59.4.39.59.86.59 1.41s-.2 1.02-.59 1.41A1.93 1.93 0 0 1 7 22c-.55 0-1.02-.2-1.4-.6Zm10 0A1.93 1.93 0 0 1 15 20c0-.55.2-1.02.59-1.41A1.93 1.93 0 0 1 17 18c.55 0 1.02.2 1.41.59.4.39.59.86.59 1.41s-.2 1.02-.59 1.41A1.93 1.93 0 0 1 17 22c-.55 0-1.02-.2-1.4-.6ZM6.15 6l2.4 5h7l2.75-5H6.15ZM5.2 4h14.75c.38 0 .67.17.88.51.2.34.2.69.02 1.04l-3.55 6.4c-.18.33-.43.59-.74.78-.3.18-.64.27-1.01.27H8.1L7 15h12v2H7c-.75 0-1.32-.33-1.7-.99a1.9 1.9 0 0 1-.05-1.96L6.6 11.6 3 4H1V2h3.25l.95 2Z"
      fill="currentColor"
    />
  </svg>
);

const BellIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M6 19v-7a6 6 0 0 1 12 0v7M4.5 19h15M10 21h4"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.4"
    />
  </svg>
);

const UserIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8c.65-3.42 3.42-5.5 7-5.5s6.35 2.08 7 5.5"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.4"
    />
  </svg>
);

type AppHeaderProps = {
  showNav?: boolean;
};

type AnnouncementItem = {
  title: string;
  text: string;
};

type HeaderThreadUser = {
  id?: string;
  name?: string;
  photoURL?: string;
};

type HeaderThreadProduct = {
  id?: string;
  image?: string;
  name?: string;
};

type HeaderMessageThread = {
  buyer?: HeaderThreadUser;
  id: string;
  lastMessage?: string;
  lastSenderId?: string;
  participantIds: string[];
  product?: HeaderThreadProduct;
  readAt?: Record<string, { toDate?: () => Date } | null>;
  seller?: HeaderThreadUser;
  sellerId?: string;
  updatedAt?: { toDate?: () => Date } | null;
};

const announcementItems: AnnouncementItem[] = [
  { title: "Acessibilidade", text: "Conteudo claro, leitura simples e navegacao pensada para todos." },
  { title: "Produtos", text: "Ofertas, celulares, moda e categorias com foco em clareza." },
  { title: "Pagamentos", text: "Pix, cartao e checkout seguro com fluxo direto." },
  { title: "Entrega", text: "Informacoes objetivas de envio e acompanhamento." },
  { title: "Suporte", text: "Ajuda rapida para comprar, vender e navegar." },
  { title: "Tecnologia", text: "Leitores de tela, teclados adaptados e recursos inteligentes." },
];

const AnnouncementCard = ({ title, text }: AnnouncementItem) => (
  <article className="flex min-w-[278px] items-center gap-3 border border-[#d7e8d4] bg-white px-4 py-2 shadow-[0_1px_0_rgba(0,0,0,0.02)]">
    <span className="flex h-2.5 w-2.5 shrink-0 rounded-full bg-[#167307]" aria-hidden="true" />
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-[0.14em] text-[#167307]">{title}</p>
      <p className="truncate text-[13px] leading-[16px] text-[#355e3a]">{text}</p>
    </div>
  </article>
);

const CartBadge = ({ count }: { count: number }) =>
  count > 0 ? (
    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center bg-white px-1 text-[11px] leading-none text-[#167307]">
      {count}
    </span>
  ) : null;

const normalizeHeaderThread = (id: string, data: Record<string, unknown>): HeaderMessageThread => ({
  buyer: data.buyer as HeaderThreadUser | undefined,
  id,
  lastMessage: data.lastMessage ? String(data.lastMessage) : undefined,
  lastSenderId: data.lastSenderId ? String(data.lastSenderId) : undefined,
  participantIds: Array.isArray(data.participantIds)
    ? data.participantIds.filter((item): item is string => typeof item === "string")
    : [],
  product: data.product as HeaderThreadProduct | undefined,
  readAt: data.readAt as HeaderMessageThread["readAt"],
  seller: data.seller as HeaderThreadUser | undefined,
  sellerId: data.sellerId ? String(data.sellerId) : undefined,
  updatedAt: data.updatedAt as HeaderMessageThread["updatedAt"],
});

const getThreadTime = (thread: HeaderMessageThread) => thread.updatedAt?.toDate?.()?.getTime() ?? 0;

const getReadTime = (thread: HeaderMessageThread, userId: string) =>
  thread.readAt?.[userId]?.toDate?.()?.getTime() ?? 0;

const isUnreadThread = (thread: HeaderMessageThread, userId: string) =>
  Boolean(thread.lastSenderId && thread.lastSenderId !== userId && getThreadTime(thread) > getReadTime(thread, userId));

const getCounterpartName = (thread: HeaderMessageThread, userId: string) => {
  if (thread.sellerId === userId) {
    return thread.buyer?.name || "Comprador Acesse+";
  }

  return thread.seller?.name || "Vendedor Acesse+";
};

const getInitials = (value: string) => {
  const parts = value.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "JA";
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
};

const ProfileMenuLink = ({
  children,
  icon,
  onClick,
  to,
}: {
  children: ReactNode;
  icon?: ReactNode;
  onClick: () => void;
  to: string;
}) => (
  <Link
    className="flex min-h-10 items-center gap-3 px-6 py-2 text-[14px] leading-[19px] text-[#333] no-underline transition-colors hover:bg-[#f7f8f8]"
    onClick={onClick}
    to={to}
  >
    {icon ? <span className="flex h-5 w-5 shrink-0 items-center justify-center text-[#52606d]">{icon}</span> : null}
    <span className="min-w-0 flex-1">{children}</span>
  </Link>
);

export const AppHeader = ({ showNav = true }: AppHeaderProps) => {
  const navigate = useNavigate();
  const { user, displayName, firstName, loading, logout, photoURL } = useAuth();
  const { itemCount } = useCart();
  const { products } = useProducts();
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const notificationsMenuRef = useRef<HTMLDivElement | null>(null);
  const knownThreadTimesRef = useRef<Map<string, number>>(new Map());
  const notificationsInitializedRef = useRef(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationThreads, setNotificationThreads] = useState<HeaderMessageThread[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof Notification === "undefined" ? "denied" : Notification.permission
  );
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAnnouncementPaused, setIsAnnouncementPaused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const headerSpacerHeight = showNav ? (isScrolled ? 78 : isMobileViewport ? 146 : 192) : 78;
  const profileName = displayName || user?.email?.split("@")[0] || "Usuario Acesse+";
  const profileInitials = getInitials(profileName);
  const unreadThreads = useMemo(
    () => (user ? notificationThreads.filter((thread) => isUnreadThread(thread, user.uid)) : []),
    [notificationThreads, user]
  );
  const unreadCount = unreadThreads.length;
  const hasSellerStore = useMemo(
    () => Boolean(user && products.some((product) => product.sellerId === user.uid)),
    [products, user]
  );

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateViewport = () => setIsMobileViewport(mediaQuery.matches);

    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);

    return () => {
      mediaQuery.removeEventListener("change", updateViewport);
    };
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }

      if (!notificationsMenuRef.current?.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setNotificationThreads([]);
      knownThreadTimesRef.current = new Map();
      notificationsInitializedRef.current = false;
      return undefined;
    }

    const threadsQuery = query(
      collection(firestore, "messageThreads"),
      where("participantIds", "array-contains", user.uid)
    );

    return onSnapshot(threadsQuery, (snapshot) => {
      const nextThreads = snapshot.docs
        .map((threadDoc) => normalizeHeaderThread(threadDoc.id, threadDoc.data()))
        .sort((first, second) => getThreadTime(second) - getThreadTime(first));

      if (notificationsInitializedRef.current) {
        nextThreads.forEach((thread) => {
          const nextTime = getThreadTime(thread);
          const previousTime = knownThreadTimesRef.current.get(thread.id) ?? 0;

          if (
            nextTime > previousTime &&
            thread.lastSenderId &&
            thread.lastSenderId !== user.uid &&
            typeof Notification !== "undefined" &&
            Notification.permission === "granted"
          ) {
            new Notification("Nova mensagem na Acesse+", {
              body: thread.lastMessage || `Mensagem de ${getCounterpartName(thread, user.uid)}`,
              tag: `acesse-message-${thread.id}`,
            });
          }
        });
      }

      knownThreadTimesRef.current = new Map(nextThreads.map((thread) => [thread.id, getThreadTime(thread)]));
      notificationsInitializedRef.current = true;
      setNotificationThreads(nextThreads);
    });
  }, [user]);

  const requestNotificationPermission = async () => {
    if (typeof Notification === "undefined") {
      setNotificationPermission("denied");
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
  };

  const submitSearch = () => {
    const trimmedQuery = searchQuery.trim();

    navigate(trimmedQuery ? `/buscar?q=${encodeURIComponent(trimmedQuery)}` : "/buscar");
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 w-full shrink-0 font-['Montserrat',sans-serif]">
        {showNav ? (
          <div
            className={`overflow-hidden border-b border-[#d7e8d4] bg-[#f5fbf3] transition-all duration-300 ease-out ${
              isScrolled ? "max-h-0 opacity-0 -translate-y-2" : "max-h-[68px] opacity-100 translate-y-0"
            }`}
            onMouseEnter={() => setIsAnnouncementPaused(true)}
            onMouseLeave={() => setIsAnnouncementPaused(false)}
          >
            <div className="flex h-[68px] items-center gap-4 px-[14px]">
              <div className="min-w-0 flex-1 overflow-hidden">
                <div
                  className={`announcement-marquee flex w-max items-center gap-3 ${
                    isAnnouncementPaused ? "announcement-marquee-paused" : ""
                  }`}
                >
                  {[...announcementItems, ...announcementItems].map((item, index) => (
                    <AnnouncementCard key={`${item.title}-${index}`} {...item} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex h-[78px] w-full items-center bg-[#167307] px-[14px] text-white">
          <button
            aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            className="mr-3 flex h-10 w-10 shrink-0 items-center justify-center border border-white/20 bg-white/10 p-0 text-white md:hidden"
            onClick={() => setIsMobileMenuOpen((current) => !current)}
            type="button"
          >
            {isMobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>

          <Link className="hidden shrink-0 no-underline sm:block" to="/" aria-label="Ir para a pagina inicial">
            <img className="h-[30px] w-[95px] object-contain sm:h-[37px] sm:w-[135px]" alt="Acesse+" src="/Group-56.svg" />
          </Link>

          <a
            className="ml-[25px] hidden w-[132px] shrink-0 items-center gap-[6px] text-white no-underline md:flex"
            href="https://wa.me/5581911112222"
            target="_blank"
            rel="noreferrer"
          >
            <span className="w-[100px] leading-none">
              <span className="block text-[15px] leading-[17px]">Whats app</span>
              <span className="mt-1 block text-[13px] leading-[15px]">(81) 91111-2222</span>
            </span>
            <img className="h-6 w-6" alt="" src="/Frame.svg" />
          </a>

          <form
            className="ml-[6px] flex h-10 min-w-0 flex-1 items-center rounded-[10px] bg-[#ecf8e8] px-[14px] md:w-[clamp(360px,55vw,772px)] md:px-[22px]"
            onSubmit={(event) => {
              event.preventDefault();
              submitSearch();
            }}
            role="search"
          >
            <img className="h-5 w-5 shrink-0 md:h-6 md:w-6" alt="" src="/Magnifier.svg" />
            <label className="sr-only" htmlFor="header-search">
              Buscar na Acesse+
            </label>
            <div className="relative ml-4 min-w-0 flex-1">
              <input
                className="w-full min-w-0 border-0 bg-transparent p-0 text-[14px] leading-[17px] text-[#355e3a] outline-none placeholder:text-transparent"
                id="header-search"
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Buscar na Acesse+"
                type="search"
                value={searchQuery}
              />
              {searchQuery === "" ? (
                <div className="pointer-events-none absolute inset-0 flex items-center gap-1 text-[14px] leading-[17px] text-[#609166]">
                  <span>Buscar na</span>
                  <img
                    className="h-[18px] w-[65px] object-contain drop-shadow-[0_1px_2px_rgba(0,0,0,0.28)]"
                    alt="Acesse+"
                    src="/Group-57.svg"
                  />
                </div>
              ) : null}
            </div>
          </form>

          <div className="ml-auto hidden shrink-0 items-center gap-3 md:flex md:gap-[18px]">
            <div className="relative hidden md:block" ref={notificationsMenuRef}>
              <HeaderIconButton
                label="Notificacoes"
                className="relative hidden md:flex"
                onClick={() => setIsNotificationsOpen((current) => !current)}
              >
                <BellIcon />
                {unreadCount > 0 ? (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ffb020] px-1 text-[10px] leading-none text-[#071735]">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                ) : null}
              </HeaderIconButton>

              {isNotificationsOpen ? (
                <div className="absolute right-[-18px] top-[48px] z-[90] w-[336px] rounded-[6px] border border-[#e1e4e8] bg-white text-[#071735] shadow-[0_14px_38px_rgba(0,0,0,0.22)]">
                  <span
                    className="absolute right-[28px] top-[-8px] h-4 w-4 rotate-45 border-l border-t border-[#e1e4e8] bg-white"
                    aria-hidden="true"
                  />
                  <div className="relative border-b border-[#edf0f2] px-4 py-3">
                    <h2 className="text-[15px] leading-[20px] text-[#111]">Notificacoes</h2>
                    <p className="mt-1 text-[12px] leading-[16px] text-[#667085]">
                      {unreadCount > 0 ? `${unreadCount} conversa(s) com mensagem nova` : "Nenhuma mensagem nova"}
                    </p>
                  </div>

                  {typeof Notification !== "undefined" && notificationPermission !== "granted" ? (
                    <div className="border-b border-[#edf0f2] px-4 py-3">
                      <button
                        className="h-9 rounded-[6px] bg-[#167307] px-3 text-[12px] text-white"
                        onClick={() => void requestNotificationPermission()}
                        type="button"
                      >
                        Ativar notificacoes do navegador
                      </button>
                    </div>
                  ) : null}

                  <div className="max-h-[320px] overflow-y-auto py-1">
                    {notificationThreads.length === 0 ? (
                      <p className="px-4 py-5 text-[13px] leading-[19px] text-[#667085]">
                        As conversas aparecem aqui quando voce trocar mensagens.
                      </p>
                    ) : (
                      notificationThreads.slice(0, 8).map((thread) => {
                        const unread = user ? isUnreadThread(thread, user.uid) : false;

                        return (
                          <Link
                            className={`grid grid-cols-[1fr_auto] gap-3 px-4 py-3 text-[#111] no-underline transition-colors hover:bg-[#f7f8f8] ${
                              unread ? "bg-[#f0faed]" : "bg-white"
                            }`}
                            key={thread.id}
                            onClick={() => setIsNotificationsOpen(false)}
                            to={`/mensagens/${thread.id}`}
                          >
                            <span className="min-w-0">
                              <span className="block truncate text-[13px] leading-[18px]">
                                {user ? getCounterpartName(thread, user.uid) : "Conversa"}
                              </span>
                              <span className="mt-1 block truncate text-[12px] leading-[16px] text-[#667085]">
                                {thread.lastMessage || thread.product?.name || "Conversa iniciada"}
                              </span>
                            </span>
                            {unread ? <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#167307]" /> : null}
                          </Link>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            {loading ? (
              <div className="flex min-w-[162px] items-center gap-3 px-1 py-1">
                <span className="h-8 w-8 rounded-full bg-white/20" />
                <span className="text-[14px] leading-[18px] text-white/80">Carregando</span>
              </div>
            ) : user ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  aria-expanded={isProfileMenuOpen}
                  aria-haspopup="menu"
                  className="flex h-11 items-center gap-3 border-0 bg-transparent p-0 text-white"
                  onClick={() => setIsProfileMenuOpen((current) => !current)}
                  type="button"
                >
                  <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-[#ecf8e8] text-[13px] font-semibold text-[#167307]">
                    {photoURL ? (
                      <img className="h-full w-full object-cover" alt="Foto de perfil" src={photoURL} />
                    ) : (
                      profileInitials
                    )}
                  </span>
                  <span className="min-w-0 hidden text-left sm:block">
                    <span className="block text-[11px] leading-[13px] text-white/70">Ola,</span>
                    <span className="flex max-w-[164px] items-center gap-1 truncate text-[14px] leading-[18px] text-white">
                      <span className="truncate">{firstName || "Usuario"}</span>
                      <FiChevronDown
                        className={`shrink-0 transition-transform ${isProfileMenuOpen ? "rotate-180" : ""}`}
                        size={14}
                      />
                    </span>
                  </span>
                </button>

                {isProfileMenuOpen ? (
                  <div
                    className="absolute right-[-54px] top-[54px] z-[90] w-[304px] rounded-[2px] border border-[#e1e4e8] bg-white text-[#333] shadow-[0_14px_38px_rgba(0,0,0,0.22)]"
                    role="menu"
                  >
                    <span
                      className="absolute right-[86px] top-[-9px] h-4 w-4 rotate-45 border-l border-t border-[#e1e4e8] bg-white"
                      aria-hidden="true"
                    />
                    <div className="relative flex items-start gap-3 px-5 py-4">
                      <Link
                        className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#e6e8eb] bg-white text-[13px] text-[#167307] no-underline"
                        onClick={() => setIsProfileMenuOpen(false)}
                        to="/perfil"
                      >
                        {photoURL ? (
                          <img className="h-full w-full object-cover" alt="Foto de perfil" src={photoURL} />
                        ) : (
                          profileInitials
                        )}
                      </Link>
                      <Link className="min-w-0 flex-1 no-underline" onClick={() => setIsProfileMenuOpen(false)} to="/perfil">
                        <p className="truncate text-[17px] leading-[22px] text-[#111]">{profileName}</p>
                        <p className="mt-1 truncate text-[12px] leading-[16px] text-[#667085]">{user.email}</p>
                      </Link>
                      <button
                        aria-label="Fechar menu do perfil"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f1f3f5] p-0 text-[#52606d]"
                        onClick={() => setIsProfileMenuOpen(false)}
                        type="button"
                      >
                        <FiChevronUp size={18} />
                      </button>
                    </div>

                    <ProfileMenuLink icon={<FiUserPlus />} onClick={() => setIsProfileMenuOpen(false)} to="/login">
                      Adicionar conta
                    </ProfileMenuLink>

                    <div className="border-y border-[#edf0f2] px-4 py-3">
                      <Link
                        className="flex h-10 items-center justify-between rounded-[6px] bg-[#8f21a8] px-3 text-[12px] leading-[16px] text-white no-underline"
                        onClick={() => setIsProfileMenuOpen(false)}
                        to="/#cupons"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <span className="rounded-[4px] border border-white/50 px-1.5 py-0.5 text-[10px]">
                            Acesse+ Infinity
                          </span>
                          <span className="truncate">Viva toda experiencia Acesse+</span>
                        </span>
                        <FiChevronDown className="-rotate-90 shrink-0" size={16} />
                      </Link>
                    </div>

                    <div className="py-2">
                      <ProfileMenuLink icon={<FiShoppingBag />} onClick={() => setIsProfileMenuOpen(false)} to="/compra">
                        Compras
                      </ProfileMenuLink>
                      <ProfileMenuLink icon={<FiClock />} onClick={() => setIsProfileMenuOpen(false)} to="/buscar">
                        Historico
                      </ProfileMenuLink>
                      <ProfileMenuLink icon={<FiHelpCircle />} onClick={() => setIsProfileMenuOpen(false)} to="/perfil">
                        Perguntas
                      </ProfileMenuLink>
                      <ProfileMenuLink icon={<FiMessageSquare />} onClick={() => setIsProfileMenuOpen(false)} to="/perfil">
                        Opinioes
                      </ProfileMenuLink>
                    </div>

                    <div className="border-t border-[#edf0f2] py-2">
                      <ProfileMenuLink icon={<FiCreditCard />} onClick={() => setIsProfileMenuOpen(false)} to="/perfil">
                        Emprestimos
                      </ProfileMenuLink>
                      <ProfileMenuLink icon={<FiRefreshCw />} onClick={() => setIsProfileMenuOpen(false)} to="/perfil">
                        Assinaturas
                      </ProfileMenuLink>
                      <ProfileMenuLink icon={<FiMessageCircle />} onClick={() => setIsProfileMenuOpen(false)} to="/mensagens">
                        <span className="flex w-full items-center justify-between gap-3">
                          <span>Conversa com Vendedor</span>
                          <span className="rounded-full bg-[#00a650] px-2 py-0.5 text-[10px] leading-[13px] text-white">
                            GRATIS
                          </span>
                        </span>
                      </ProfileMenuLink>
                    </div>

                    <div className="border-t border-[#edf0f2] py-2">
                      {hasSellerStore ? (
                        <ProfileMenuLink icon={<FiHome />} onClick={() => setIsProfileMenuOpen(false)} to={`/loja/${user.uid}`}>
                          Minha loja
                        </ProfileMenuLink>
                      ) : null}
                      <ProfileMenuLink icon={<FiTag />} onClick={() => setIsProfileMenuOpen(false)} to="/produtos/novo">
                        Vender
                      </ProfileMenuLink>
                    </div>

                    <div className="border-t border-[#edf0f2] py-2">
                      <button
                        className="flex min-h-10 w-full items-center gap-3 bg-transparent px-6 py-2 text-left text-[14px] leading-[19px] text-[#b42318] transition-colors hover:bg-[#fff5f5]"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          void logout();
                        }}
                        type="button"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                          <FiLogOut />
                        </span>
                        Sair
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <Link
                className="flex items-center gap-3 border border-white/15 bg-white/10 px-4 py-2 text-white no-underline transition-colors hover:bg-white/15"
                to="/login"
              >
                <span className="flex h-8 w-8 items-center justify-center bg-[#ecf8e8] text-[#167307]">
                  <UserIcon />
                </span>
                <span className="hidden text-[14px] leading-[18px] text-white sm:inline">Entrar</span>
              </Link>
            )}

            <Link
              aria-label="Carrinho"
              className="relative flex h-9 w-9 items-center justify-center text-white no-underline"
              to="/carrinho"
            >
              <CartIcon />
              <CartBadge count={itemCount} />
            </Link>
          </div>
        </div>

        {isMobileMenuOpen ? (
          <div className="border-b border-[#d7e8d4] bg-white px-4 py-4 text-[#071735] shadow-[0_12px_28px_rgba(0,0,0,0.14)] md:hidden">
            <div className="flex items-center justify-between border-b border-[#edf0f2] pb-3">
              <Link className="no-underline" onClick={() => setIsMobileMenuOpen(false)} to="/">
                <img className="h-[32px] w-[118px] object-contain" alt="Acesse+" src="/Group-57.svg" />
              </Link>
              <Link
                className="relative flex h-10 w-10 items-center justify-center bg-[#167307] text-white no-underline"
                onClick={() => setIsMobileMenuOpen(false)}
                to="/carrinho"
              >
                <CartIcon />
                <CartBadge count={itemCount} />
              </Link>
            </div>

            <div className="mt-4 grid gap-2 text-[14px] leading-[18px]">
              {loading ? (
                <span className="px-1 py-2 text-[#52606d]">Carregando conta</span>
              ) : user ? (
                <>
                  <Link
                    className="flex items-center gap-3 px-1 py-2 text-[#071735] no-underline"
                    onClick={() => setIsMobileMenuOpen(false)}
                    to="/perfil"
                  >
                    <span className="flex h-9 w-9 items-center justify-center overflow-hidden bg-[#ecf8e8] text-[#167307]">
                      {photoURL ? (
                        <img className="h-full w-full object-cover" alt="Foto de perfil" src={photoURL} />
                      ) : (
                        <FiUser size={18} />
                      )}
                    </span>
                    <span>Perfil de {firstName || "usuario"}</span>
                  </Link>
                  <Link
                    className="px-1 py-2 text-[#071735] no-underline"
                    onClick={() => setIsMobileMenuOpen(false)}
                    to="/produtos/novo"
                  >
                    Cadastrar produto
                  </Link>
                  {hasSellerStore ? (
                    <Link
                      className="px-1 py-2 text-[#071735] no-underline"
                      onClick={() => setIsMobileMenuOpen(false)}
                      to={`/loja/${user.uid}`}
                    >
                      Minha loja
                    </Link>
                  ) : null}
                  <button
                    className="px-1 py-2 text-left text-[#b42318]"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      void logout();
                    }}
                    type="button"
                  >
                    Sair da conta
                  </button>
                </>
              ) : (
                <>
                  <Link className="px-1 py-2 text-[#071735] no-underline" onClick={() => setIsMobileMenuOpen(false)} to="/login">
                    Entrar
                  </Link>
                  <Link className="px-1 py-2 text-[#071735] no-underline" onClick={() => setIsMobileMenuOpen(false)} to="/cadastro">
                    Criar conta
                  </Link>
                </>
              )}

              <Link className="px-1 py-2 text-[#071735] no-underline" onClick={() => setIsMobileMenuOpen(false)} to="/#categorias">
                Departamentos
              </Link>
              <Link className="px-1 py-2 text-[#071735] no-underline" onClick={() => setIsMobileMenuOpen(false)} to="/#ofertas">
                Ofertas exclusivas
              </Link>
              <Link className="px-1 py-2 text-[#071735] no-underline" onClick={() => setIsMobileMenuOpen(false)} to="/buscar">
                Todos os produtos
              </Link>
            </div>
          </div>
        ) : null}

        {showNav ? (
          <nav
            className={`hidden overflow-y-hidden overflow-x-auto border-b border-[#e4e7eb] bg-[#f4f4f4] px-0 text-[#257a0d] transition-all duration-300 ease-out [scrollbar-width:none] sm:px-[36px] md:block [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
              isScrolled ? "max-h-0 opacity-0 -translate-y-2" : "max-h-[46px] opacity-100 translate-y-0"
            }`}
          >
            <div className="flex h-[46px] w-max min-w-full items-center gap-5 px-3 sm:grid sm:max-w-[713px] sm:grid-cols-[173px_154px_143px_1fr] sm:gap-[30px] sm:px-0">
              <Link
                className="flex shrink-0 items-center gap-2 text-[14px] leading-[17px] text-[#257a0d] no-underline"
                to="/#categorias"
              >
                <FiGrid className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                <span>Departamentos</span>
              </Link>

              <Link
                className="flex shrink-0 items-center gap-3 text-[14px] leading-[15px] text-[#257a0d] no-underline"
                to="/#entrega"
              >
                <img className="h-6 w-6 object-contain" alt="" src="/Location-Icon.svg" />
                <span>
                  Enviar para
                  <br />
                  <strong className="text-[15px]">44586-284</strong>
                </span>
              </Link>

              <Link
                className="flex shrink-0 items-center gap-3 text-[14px] leading-[17px] text-[#257a0d] no-underline"
                to="/#cupons"
              >
                <img className="h-6 w-6 object-contain" alt="" src="/Vector.svg" />
                <span>Meus Cupons</span>
              </Link>

              <Link
                className="flex shrink-0 items-center gap-2 text-[14px] leading-[17px] text-[#257a0d] no-underline"
                to="/#ofertas"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ecf8e8]">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M4 9.5V4h5.5L20 14.5l-5.5 5.5L4 9.5Z"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                    <circle cx="8.5" cy="8.5" r="1.1" fill="currentColor" />
                  </svg>
                </span>
                <span>Ofertas Exclusivas</span>
              </Link>
            </div>
          </nav>
        ) : null}

        <button
          aria-label="Voltar ao topo"
          className={`fixed bottom-6 right-6 z-[60] flex h-12 w-12 items-center justify-center border border-[#167307] bg-[#167307] text-white shadow-[0_10px_25px_rgba(0,0,0,0.2)] transition-all duration-300 ease-out hover:bg-[#125d05] ${
            isScrolled ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
          }`}
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          type="button"
        >
          <FiArrowUp size={20} />
        </button>
      </header>

      <div
        aria-hidden="true"
        className="w-full transition-[height] duration-300 ease-out"
        style={{ height: headerSpacerHeight }}
      />
    </>
  );
};
