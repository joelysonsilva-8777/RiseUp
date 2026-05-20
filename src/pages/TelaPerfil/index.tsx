import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { sendPasswordResetEmail, updateProfile as updateAuthProfile } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Link, useNavigate } from "react-router-dom";
import {
  FiBarChart2,
  FiBriefcase,
  FiCamera,
  FiCheck,
  FiChevronDown,
  FiCreditCard,
  FiFileText,
  FiGift,
  FiLock,
  FiMapPin,
  FiMenu,
  FiMessageCircle,
  FiPackage,
  FiSave,
  FiSettings,
  FiShield,
  FiShoppingBag,
  FiUser,
  FiX,
  FiZoomIn,
  FiZoomOut,
} from "react-icons/fi";
import { AppHeader } from "../../components/AppHeader";
import { useAuth } from "../../context/AuthContext";
import { formatCurrency } from "../../data/products";
import { auth, firestore, storage } from "../../firebase/firebase";
import { useProducts } from "../../hooks/useProducts";

const CROP_OUTPUT_SIZE = 1024;

const fieldClassName =
  "h-11 w-full rounded-[6px] border border-[#dfe3e8] bg-white px-3 text-[14px] leading-[20px] text-[#071735] outline-none transition-colors placeholder:text-[#98a2b3] focus:border-[#167307]";

const labelClassName = "mb-2 block text-[12px] font-medium uppercase tracking-[0.14em] text-[#667085]";

type AccountSection =
  | "overview"
  | "profile"
  | "security"
  | "purchases"
  | "sales"
  | "marketing"
  | "loans"
  | "subscriptions"
  | "billing"
  | "cards"
  | "addresses"
  | "privacy"
  | "communications"
  | "infinity"
  | "settings";

type CropDimensions = {
  width: number;
  height: number;
};

type CropOffset = {
  x: number;
  y: number;
};

type OrderItem = {
  image: string;
  name: string;
  price: number;
  productId: string;
  quantity: number;
  sellerName?: string;
  total?: number;
};

type UserOrder = {
  createdAt?: { toDate?: () => Date } | null;
  id: string;
  itemCount: number;
  items: OrderItem[];
  status?: string;
  total: number;
};

type NavigationItem = {
  id: AccountSection;
  icon: ReactNode;
  label: string;
  ready?: boolean;
};

type DashboardCard = {
  description: string;
  id: AccountSection;
  icon: ReactNode;
  ready?: boolean;
  title: string;
};

const accountNavigation: NavigationItem[] = [
  { id: "purchases", icon: <FiShoppingBag />, label: "Compras", ready: true },
  { id: "sales", icon: <FiPackage />, label: "Vendas", ready: true },
  { id: "marketing", icon: <FiBarChart2 />, label: "Marketing" },
  { id: "loans", icon: <FiBriefcase />, label: "Emprestimos" },
  { id: "subscriptions", icon: <FiGift />, label: "Assinaturas" },
  { id: "billing", icon: <FiFileText />, label: "Faturamento" },
  { id: "profile", icon: <FiUser />, label: "Meu perfil", ready: true },
  { id: "settings", icon: <FiSettings />, label: "Configuracoes" },
];

const dashboardCards: DashboardCard[] = [
  {
    description: "Dados pessoais, foto, contato e perfil publico de vendedor.",
    id: "profile",
    icon: <FiUser />,
    ready: true,
    title: "Informacoes do seu perfil",
  },
  {
    description: "Senha, e-mail de acesso e cuidados basicos da conta.",
    id: "security",
    icon: <FiLock />,
    ready: true,
    title: "Seguranca",
  },
  {
    description: "Beneficios, frete e vantagens especiais da Acesse+.",
    id: "infinity",
    icon: <FiGift />,
    title: "Acesse+ Infinity",
  },
  {
    description: "Cartoes salvos e formas de pagamento recorrentes.",
    id: "cards",
    icon: <FiCreditCard />,
    title: "Cartoes",
  },
  {
    description: "Enderecos salvos para compras futuras.",
    id: "addresses",
    icon: <FiMapPin />,
    title: "Enderecos",
  },
  {
    description: "Preferencias e controle do uso dos seus dados.",
    id: "privacy",
    icon: <FiShield />,
    title: "Privacidade",
  },
  {
    description: "Mensagens, avisos e notificacoes recebidas.",
    id: "communications",
    icon: <FiMessageCircle />,
    ready: true,
    title: "Comunicacoes",
  },
];

const wipContent: Record<
  Exclude<AccountSection, "overview" | "profile" | "security" | "purchases" | "sales" | "communications">,
  { actionLabel?: string; actionTo?: string; description: string; title: string }
> = {
  addresses: {
    actionLabel: "Usar endereco no carrinho",
    actionTo: "/carrinho/endereco",
    description: "O checkout ja tem cadastro de endereco para pedido, mas ainda nao existe uma agenda de enderecos salvos na conta.",
    title: "Enderecos salvos em construcao",
  },
  billing: {
    description: "Notas, recibos e relatorios financeiros ainda nao tem uma area propria no sistema.",
    title: "Faturamento em construcao",
  },
  cards: {
    actionLabel: "Ir para checkout",
    actionTo: "/compra",
    description: "O cartao pode ser informado no checkout, mas ainda nao existe cofre de cartoes salvos no perfil.",
    title: "Cartoes salvos em construcao",
  },
  infinity: {
    description: "A assinatura Acesse+ Infinity ainda nao tem plano ativo, cobranca ou beneficios configurados.",
    title: "Acesse+ Infinity em construcao",
  },
  loans: {
    description: "Credito, emprestimos e simulacoes ainda nao fazem parte dos fluxos atuais da Acesse+.",
    title: "Emprestimos em construcao",
  },
  marketing: {
    description: "Campanhas, anuncios patrocinados e metricas de marketing ainda nao foram implementados.",
    title: "Marketing em construcao",
  },
  privacy: {
    description: "Ainda nao ha uma central completa de privacidade para exportar dados, apagar conta ou ajustar consentimentos.",
    title: "Privacidade em construcao",
  },
  settings: {
    description: "As configuracoes gerais ainda estao sendo separadas por area. Por enquanto, perfil e seguranca ja estao funcionais.",
    title: "Configuracoes em construcao",
  },
  subscriptions: {
    description: "Assinaturas recorrentes ainda nao existem no backend do marketplace.",
    title: "Assinaturas em construcao",
  },
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const loadImage = (sourceUrl: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Nao foi possivel carregar a imagem."));
    image.src = sourceUrl;
  });

const getCropBounds = (dimensions: CropDimensions | null, frameSize: number, zoom: number) => {
  if (!dimensions || frameSize <= 0) {
    return {
      maxOffsetX: 0,
      maxOffsetY: 0,
    };
  }

  const baseScale = Math.max(frameSize / dimensions.width, frameSize / dimensions.height);
  const renderedWidth = dimensions.width * baseScale * zoom;
  const renderedHeight = dimensions.height * baseScale * zoom;

  return {
    maxOffsetX: Math.max(0, ((renderedWidth - frameSize) / 2 / frameSize) * 100),
    maxOffsetY: Math.max(0, ((renderedHeight - frameSize) / 2 / frameSize) * 100),
  };
};

const clampOffset = (offset: CropOffset, dimensions: CropDimensions | null, frameSize: number, zoom: number) => {
  const bounds = getCropBounds(dimensions, frameSize, zoom);

  return {
    x: clamp(offset.x, -bounds.maxOffsetX, bounds.maxOffsetX),
    y: clamp(offset.y, -bounds.maxOffsetY, bounds.maxOffsetY),
  };
};

const createCroppedAvatarFile = async ({
  sourceUrl,
  fileName,
  dimensions,
  frameSize,
  zoom,
  offset,
}: {
  sourceUrl: string;
  fileName: string;
  dimensions: CropDimensions;
  frameSize: number;
  zoom: number;
  offset: CropOffset;
}) => {
  const image = await loadImage(sourceUrl);
  const canvas = document.createElement("canvas");
  canvas.width = CROP_OUTPUT_SIZE;
  canvas.height = CROP_OUTPUT_SIZE;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Nao foi possivel preparar o recorte da foto.");
  }

  const baseScale = Math.max(frameSize / dimensions.width, frameSize / dimensions.height);
  const renderedWidth = dimensions.width * baseScale * zoom;
  const renderedHeight = dimensions.height * baseScale * zoom;
  const scaleToOutput = CROP_OUTPUT_SIZE / frameSize;
  const drawWidth = renderedWidth * scaleToOutput;
  const drawHeight = renderedHeight * scaleToOutput;
  const offsetX = (offset.x / 100) * CROP_OUTPUT_SIZE;
  const offsetY = (offset.y / 100) * CROP_OUTPUT_SIZE;

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(
    image,
    CROP_OUTPUT_SIZE / 2 - drawWidth / 2 + offsetX,
    CROP_OUTPUT_SIZE / 2 - drawHeight / 2 + offsetY,
    drawWidth,
    drawHeight
  );

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (!result) {
        reject(new Error("Nao foi possivel gerar a imagem recortada."));
        return;
      }

      resolve(result);
    }, "image/jpeg", 0.92);
  });

  const sanitizedName = fileName.toLowerCase().replace(/[^a-z0-9.]+/g, "-") || "avatar.jpg";

  return new File([blob], sanitizedName.replace(/\.[^.]+$/, ".jpg"), {
    type: "image/jpeg",
  });
};

const normalizeOrder = (id: string, data: Record<string, unknown>): UserOrder => ({
  createdAt: data.createdAt as UserOrder["createdAt"],
  id,
  itemCount: Number(data.itemCount ?? 0),
  items: Array.isArray(data.items) ? (data.items as OrderItem[]) : [],
  status: data.status ? String(data.status) : undefined,
  total: Number(data.total ?? 0),
});

const getDateLabel = (value?: { toDate?: () => Date } | null) => {
  const date = value?.toDate?.();

  if (!date) {
    return "Agora";
  }

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStatusLabel = (status?: string) => {
  if (status === "confirmed") {
    return "Confirmado";
  }

  return status || "Em andamento";
};

const ProfileAvatar = ({
  initials,
  onPhotoChange,
  photoURL,
  size = "lg",
}: {
  initials: string;
  onPhotoChange: (event: ChangeEvent<HTMLInputElement>) => void;
  photoURL: string;
  size?: "md" | "lg";
}) => {
  const sizeClassName = size === "lg" ? "h-20 w-20 text-[28px]" : "h-14 w-14 text-[18px]";

  return (
    <label
      className={`group relative flex shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-[#dfe3e8] bg-white text-[#167307] shadow-[0_1px_2px_rgba(0,0,0,0.05)] ${sizeClassName}`}
    >
      {photoURL ? (
        <img className="h-full w-full object-cover" alt="Foto de perfil" src={photoURL} />
      ) : (
        <span>{initials || "U"}</span>
      )}
      <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100">
        <FiCamera />
      </span>
      <input className="hidden" accept="image/*" onChange={onPhotoChange} type="file" />
    </label>
  );
};

const WipPanel = ({
  actionLabel,
  actionTo,
  description,
  title,
}: {
  actionLabel?: string;
  actionTo?: string;
  description: string;
  title: string;
}) => (
  <section className="relative min-h-[360px] overflow-hidden rounded-[8px] border border-[#dfe3e8] bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
    <div className="absolute right-8 top-8 h-20 w-20 rounded-full bg-[#ecf8e8] opacity-80 animate-pulse" />
    <div className="absolute right-14 top-14 h-10 w-10 rounded-full border-2 border-[#167307] animate-ping" />
    <div className="relative max-w-[560px]">
      <span className="inline-flex h-11 items-center rounded-full bg-[#ecf8e8] px-4 text-[12px] font-medium uppercase tracking-[0.16em] text-[#167307]">
        W.I.P
      </span>
      <h2 className="mt-5 text-[28px] leading-[36px] text-[#111]">{title}</h2>
      <p className="mt-3 text-[14px] leading-[23px] text-[#52606d]">{description}</p>
      <div className="mt-7 grid max-w-[420px] gap-2">
        {[0, 1, 2].map((item) => (
          <span
            className="h-2 rounded-full bg-[#d7e8d4] animate-pulse"
            key={item}
            style={{ animationDelay: `${item * 120}ms`, width: `${100 - item * 18}%` }}
          />
        ))}
      </div>
      {actionLabel && actionTo ? (
        <Link
          className="mt-8 inline-flex h-10 items-center justify-center rounded-[6px] bg-[#167307] px-4 text-[13px] text-white no-underline"
          to={actionTo}
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  </section>
);

const TelaPerfil = () => {
  const navigate = useNavigate();
  const { user, profile, loading, refreshProfile } = useAuth();
  const { products } = useProducts();
  const cropFrameRef = useRef<HTMLDivElement | null>(null);
  const sourceUrlRef = useRef<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const dragStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const [activeSection, setActiveSection] = useState<AccountSection>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [securityPromptOpen, setSecurityPromptOpen] = useState(true);
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [bio, setBio] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [cropSourceUrl, setCropSourceUrl] = useState("");
  const [cropFileName, setCropFileName] = useState("");
  const [cropDimensions, setCropDimensions] = useState<CropDimensions | null>(null);
  const [cropFrameSize, setCropFrameSize] = useState(320);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropOffset, setCropOffset] = useState<CropOffset>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const sellerProducts = useMemo(
    () => (user ? products.filter((product) => product.sellerId === user.uid) : []),
    [products, user]
  );

  const initials = useMemo(() => {
    const source = fullName.trim() || user?.email?.split("@")[0] || "";

    return source
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }, [fullName, user]);

  const profileName = fullName || user?.displayName || user?.email?.split("@")[0] || "Usuario Acesse+";
  const providerLabels = user?.providerData.map((provider) => provider.providerId.replace(".com", "")) ?? [];

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, navigate, user]);

  useEffect(() => {
    return () => {
      if (sourceUrlRef.current) {
        URL.revokeObjectURL(sourceUrlRef.current);
        sourceUrlRef.current = null;
      }

      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    setFullName(profile?.fullName ?? user?.displayName ?? "");
    setPhone(profile?.phone ?? "");
    setCity(profile?.city ?? "");
    setState(profile?.state ?? "");
    setBio(profile?.bio ?? "");
    setPhotoURL(profile?.photoURL ?? user?.photoURL ?? "");
  }, [profile, user]);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setOrdersLoading(false);
      return undefined;
    }

    setOrdersLoading(true);

    const ordersQuery = query(collection(firestore, "users", user.uid, "orders"), orderBy("createdAt", "desc"));

    return onSnapshot(
      ordersQuery,
      (snapshot) => {
        setOrders(snapshot.docs.map((orderDoc) => normalizeOrder(orderDoc.id, orderDoc.data())));
        setOrdersLoading(false);
      },
      () => {
        setOrders([]);
        setOrdersLoading(false);
      }
    );
  }, [user]);

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Escolha uma imagem PNG ou JPG.");
      event.target.value = "";
      return;
    }

    if (sourceUrlRef.current) {
      URL.revokeObjectURL(sourceUrlRef.current);
    }

    const objectUrl = URL.createObjectURL(file);
    sourceUrlRef.current = objectUrl;

    setCropSourceUrl(objectUrl);
    setCropFileName(file.name);
    setCropDimensions(null);
    setCropZoom(1);
    setCropOffset({ x: 0, y: 0 });
    setCropOpen(true);
    setErrorMessage("");
    event.target.value = "";
  };

  const closeCropModal = () => {
    if (sourceUrlRef.current) {
      URL.revokeObjectURL(sourceUrlRef.current);
      sourceUrlRef.current = null;
    }

    dragStateRef.current = null;
    setIsDragging(false);
    setCropOpen(false);
    setCropSourceUrl("");
    setCropFileName("");
    setCropDimensions(null);
    setCropZoom(1);
    setCropOffset({ x: 0, y: 0 });
  };

  const applyCrop = async () => {
    if (!user || !cropSourceUrl || !cropDimensions) {
      return;
    }

    setIsCropping(true);
    setErrorMessage("");

    try {
      const croppedFile = await createCroppedAvatarFile({
        sourceUrl: cropSourceUrl,
        fileName: cropFileName || "avatar.jpg",
        dimensions: cropDimensions,
        frameSize: cropFrameSize,
        zoom: cropZoom,
        offset: cropOffset,
      });

      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }

      const previewUrl = URL.createObjectURL(croppedFile);
      previewUrlRef.current = previewUrl;

      setPhotoFile(croppedFile);
      setPhotoURL(previewUrl);
      setSuccessMessage("Foto recortada. Salve as alteracoes para publicar no perfil.");
      closeCropModal();
    } catch {
      setErrorMessage("Nao foi possivel recortar a imagem. Tente outra foto.");
    } finally {
      setIsCropping(false);
    }
  };

  useEffect(() => {
    if (!cropOpen) {
      return undefined;
    }

    const element = cropFrameRef.current;

    if (!element) {
      return undefined;
    }

    const updateFrameSize = () => {
      setCropFrameSize(element.clientWidth || 320);
    };

    updateFrameSize();

    const observer = new ResizeObserver(updateFrameSize);
    observer.observe(element);

    return () => observer.disconnect();
  }, [cropOpen]);

  useEffect(() => {
    setCropOffset((current) => clampOffset(current, cropDimensions, cropFrameSize, cropZoom));
  }, [cropDimensions, cropFrameSize, cropZoom]);

  const handleCropPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!cropDimensions) {
      return;
    }

    event.preventDefault();

    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: cropOffset.x,
      originY: cropOffset.y,
    };

    setIsDragging(true);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!dragStateRef.current) {
        return;
      }

      const deltaX = ((moveEvent.clientX - dragStateRef.current.startX) / cropFrameSize) * 100;
      const deltaY = ((moveEvent.clientY - dragStateRef.current.startY) / cropFrameSize) * 100;

      setCropOffset(
        clampOffset(
          {
            x: dragStateRef.current.originX + deltaX,
            y: dragStateRef.current.originY + deltaY,
          },
          cropDimensions,
          cropFrameSize,
          cropZoom
        )
      );
    };

    const handlePointerUp = () => {
      dragStateRef.current = null;
      setIsDragging(false);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const saveProfile = async () => {
    if (!user || !auth.currentUser) {
      return;
    }

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      let uploadedPhotoURL = photoURL;

      if (photoFile) {
        const fileName = photoFile.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
        const storageRef = ref(storage, `users/${user.uid}/profile/${Date.now()}-${fileName}`);

        await uploadBytes(storageRef, photoFile, {
          contentType: photoFile.type,
        });
        uploadedPhotoURL = await getDownloadURL(storageRef);
      }

      const sellerDisplayName = fullName || user.displayName || user.email || "Vendedor Acesse+";

      await updateAuthProfile(auth.currentUser, {
        displayName: fullName,
        photoURL: uploadedPhotoURL,
      });

      await setDoc(
        doc(firestore, "users", user.uid),
        {
          bio,
          city,
          email: user.email ?? "",
          fullName,
          phone,
          photoURL: uploadedPhotoURL,
          state,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      await setDoc(
        doc(firestore, "sellerProfiles", user.uid),
        {
          bio,
          city,
          displayName: sellerDisplayName,
          email: user.email ?? "",
          photoURL: uploadedPhotoURL,
          sellerId: user.uid,
          state,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      const sellerProductsSnapshot = await getDocs(query(collection(firestore, "products"), where("sellerId", "==", user.uid)));
      const sellerProductsBatch = writeBatch(firestore);

      sellerProductsSnapshot.forEach((productDoc) => {
        sellerProductsBatch.update(productDoc.ref, {
          sellerCity: city,
          sellerName: sellerDisplayName,
          sellerPhotoURL: uploadedPhotoURL,
          sellerState: state,
          updatedAt: serverTimestamp(),
        });
      });

      if (!sellerProductsSnapshot.empty) {
        await sellerProductsBatch.commit();
      }

      await refreshProfile();
      setPhotoURL(uploadedPhotoURL);
      setPhotoFile(null);
      setSuccessMessage("Perfil atualizado com sucesso.");
    } catch {
      setErrorMessage("Nao foi possivel salvar o perfil agora. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await saveProfile();
  };

  const sendPasswordEmail = async () => {
    if (!user?.email) {
      setPasswordMessage("Sua conta nao tem e-mail disponivel para receber o link.");
      return;
    }

    setPasswordMessage("");

    try {
      await sendPasswordResetEmail(auth, user.email);
      setPasswordMessage("Enviamos um link para criar ou trocar sua senha.");
    } catch {
      setPasswordMessage("Nao foi possivel enviar o link agora. Tente novamente mais tarde.");
    }
  };

  const selectSection = (section: AccountSection) => {
    setActiveSection(section);
    setSidebarOpen(false);
  };

  const renderProfileForm = () => (
    <section className="rounded-[8px] border border-[#dfe3e8] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#edf0f2] pb-5">
        <div>
          <p className="text-[12px] uppercase tracking-[0.16em] text-[#167307]">Perfil</p>
          <h2 className="mt-1 text-[22px] leading-[29px] text-[#111]">Informacoes do seu perfil</h2>
        </div>
        <ProfileAvatar initials={initials} onPhotoChange={handlePhotoChange} photoURL={photoURL} size="md" />
      </div>

      <form className="mt-5 grid gap-5" onSubmit={handleSubmit}>
        <div className="grid gap-5 md:grid-cols-2">
          <label>
            <span className={labelClassName}>Nome completo</span>
            <input
              className={fieldClassName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Seu nome"
              value={fullName}
            />
          </label>

          <label>
            <span className={labelClassName}>Telefone</span>
            <input
              className={fieldClassName}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="(81) 99999-9999"
              value={phone}
            />
          </label>

          <label>
            <span className={labelClassName}>Cidade</span>
            <input
              className={fieldClassName}
              onChange={(event) => setCity(event.target.value)}
              placeholder="Recife"
              value={city}
            />
          </label>

          <label>
            <span className={labelClassName}>Estado</span>
            <input
              className={fieldClassName}
              maxLength={2}
              onChange={(event) => setState(event.target.value.toUpperCase().slice(0, 2))}
              placeholder="PE"
              value={state}
            />
          </label>
        </div>

        <label>
          <span className={labelClassName}>Sobre voce</span>
          <textarea
            className="min-h-[118px] w-full resize-y rounded-[6px] border border-[#dfe3e8] bg-white px-3 py-3 text-[14px] leading-[22px] text-[#071735] outline-none transition-colors placeholder:text-[#98a2b3] focus:border-[#167307]"
            onChange={(event) => setBio(event.target.value)}
            placeholder="Conte um pouco sobre voce ou sobre sua loja."
            value={bio}
          />
        </label>

        <div className="rounded-[8px] bg-[#f7faf6] p-4">
          <p className="text-[13px] leading-[20px] text-[#52606d]">
            A foto e o nome tambem atualizam seus produtos, sua loja de vendedor e as conversas ligadas ao seu perfil.
          </p>
          {photoFile ? (
            <p className="mt-2 text-[13px] leading-[19px] text-[#167307]">
              Nova foto pronta para envio. Salve as alteracoes para publicar.
            </p>
          ) : null}
        </div>

        {errorMessage ? <p className="text-[13px] leading-[19px] text-[#b42318]">{errorMessage}</p> : null}
        {successMessage ? <p className="text-[13px] leading-[19px] text-[#167307]">{successMessage}</p> : null}

        <div className="flex flex-wrap items-center gap-3">
          <button
            className="inline-flex h-11 items-center gap-2 rounded-[6px] border-0 bg-[#167307] px-5 text-[14px] font-medium text-white transition-colors hover:bg-[#125d05] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={saving}
            type="submit"
          >
            <FiSave />
            {saving ? "Salvando..." : "Salvar alteracoes"}
          </button>
          <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-[6px] border border-[#dfe3e8] bg-white px-4 text-[14px] font-medium text-[#167307] transition-colors hover:border-[#167307]">
            <FiCamera />
            Trocar foto
            <input className="hidden" accept="image/*" onChange={handlePhotoChange} type="file" />
          </label>
        </div>
      </form>
    </section>
  );

  const renderSecurity = () => (
    <section className="rounded-[8px] border border-[#dfe3e8] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#edf0f2] pb-5">
        <div>
          <p className="text-[12px] uppercase tracking-[0.16em] text-[#167307]">Seguranca</p>
          <h2 className="mt-1 text-[22px] leading-[29px] text-[#111]">Proteja sua conta</h2>
          <p className="mt-2 max-w-[620px] text-[14px] leading-[22px] text-[#52606d]">
            O fluxo disponivel hoje usa o Firebase Auth para enviar um link seguro de criacao ou troca de senha.
          </p>
        </div>
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ecf8e8] text-[#167307]">
          <FiShield size={22} />
        </span>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <article className="rounded-[8px] bg-[#f7faf6] p-4">
          <p className="text-[12px] uppercase tracking-[0.14em] text-[#667085]">E-mail de acesso</p>
          <p className="mt-2 break-all text-[15px] leading-[21px] text-[#111]">{user?.email}</p>
        </article>
        <article className="rounded-[8px] bg-[#f7faf6] p-4">
          <p className="text-[12px] uppercase tracking-[0.14em] text-[#667085]">Provedores</p>
          <p className="mt-2 text-[15px] leading-[21px] text-[#111]">
            {providerLabels.length > 0 ? providerLabels.join(", ") : "E-mail e senha"}
          </p>
        </article>
      </div>

      <div className="mt-5 rounded-[8px] border border-[#dfe3e8] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-[16px] leading-[22px] text-[#111]">Criar ou trocar senha</h3>
            <p className="mt-1 text-[13px] leading-[20px] text-[#52606d]">
              Voce recebera um link no e-mail cadastrado.
            </p>
          </div>
          <button
            className="h-10 rounded-[6px] bg-[#167307] px-4 text-[13px] text-white"
            onClick={() => void sendPasswordEmail()}
            type="button"
          >
            Enviar link
          </button>
        </div>
        {passwordMessage ? <p className="mt-3 text-[13px] leading-[19px] text-[#167307]">{passwordMessage}</p> : null}
      </div>
    </section>
  );

  const renderPurchases = () => (
    <section className="rounded-[8px] border border-[#dfe3e8] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0f2] pb-5">
        <div>
          <p className="text-[12px] uppercase tracking-[0.16em] text-[#167307]">Compras</p>
          <h2 className="mt-1 text-[22px] leading-[29px] text-[#111]">Historico de pedidos</h2>
        </div>
        <Link className="rounded-[6px] bg-[#167307] px-4 py-2 text-[13px] text-white no-underline" to="/buscar">
          Comprar produtos
        </Link>
      </div>

      <div className="mt-5 grid gap-3">
        {ordersLoading ? (
          <p className="text-[14px] leading-[22px] text-[#52606d]">Carregando pedidos...</p>
        ) : orders.length === 0 ? (
          <div className="rounded-[8px] bg-[#f7faf6] p-5">
            <p className="text-[15px] leading-[22px] text-[#111]">Voce ainda nao tem compras confirmadas.</p>
            <p className="mt-1 text-[13px] leading-[20px] text-[#52606d]">
              Quando finalizar um checkout logado, os pedidos aparecem aqui e tambem podem ser anexados no chat.
            </p>
          </div>
        ) : (
          orders.map((order) => (
            <article className="rounded-[8px] border border-[#dfe3e8] p-4" key={order.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[14px] leading-[20px] text-[#111]">Pedido #{order.id.slice(0, 8)}</p>
                  <p className="mt-1 text-[12px] leading-[17px] text-[#667085]">
                    {getDateLabel(order.createdAt)} - {getStatusLabel(order.status)}
                  </p>
                </div>
                <p className="text-[18px] leading-[24px] text-[#167307]">{formatCurrency(order.total)}</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {order.items.slice(0, 4).map((item) => (
                  <Link
                    className="flex min-w-[180px] flex-1 items-center gap-3 rounded-[6px] bg-[#f7faf6] p-2 text-[#111] no-underline"
                    key={`${order.id}-${item.productId}`}
                    to={`/produto/${item.productId}`}
                  >
                    <img className="h-12 w-12 object-contain" alt="" src={item.image} />
                    <span className="min-w-0">
                      <span className="block truncate text-[12px] leading-[17px]">{item.name}</span>
                      <span className="mt-1 block text-[11px] text-[#667085]">Qtd. {item.quantity}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );

  const renderSales = () => (
    <section className="rounded-[8px] border border-[#dfe3e8] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0f2] pb-5">
        <div>
          <p className="text-[12px] uppercase tracking-[0.16em] text-[#167307]">Vendas</p>
          <h2 className="mt-1 text-[22px] leading-[29px] text-[#111]">Sua operacao de vendedor</h2>
          <p className="mt-2 text-[14px] leading-[22px] text-[#52606d]">
            Produtos cadastrados, loja publica e entrada para criar novos anuncios.
          </p>
        </div>
        <Link className="rounded-[6px] bg-[#167307] px-4 py-2 text-[13px] text-white no-underline" to="/produtos/novo">
          Criar produto
        </Link>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <article className="rounded-[8px] bg-[#f7faf6] p-4">
          <p className="text-[12px] uppercase tracking-[0.14em] text-[#667085]">Produtos ativos</p>
          <p className="mt-2 text-[30px] leading-[36px] text-[#167307]">{sellerProducts.length}</p>
        </article>
        <article className="rounded-[8px] bg-[#f7faf6] p-4">
          <p className="text-[12px] uppercase tracking-[0.14em] text-[#667085]">Loja publica</p>
          <p className="mt-2 text-[15px] leading-[22px] text-[#111]">
            {sellerProducts.length > 0 ? "Disponivel no perfil" : "Aparece apos o primeiro produto"}
          </p>
        </article>
        <article className="rounded-[8px] bg-[#f7faf6] p-4">
          <p className="text-[12px] uppercase tracking-[0.14em] text-[#667085]">Chat</p>
          <p className="mt-2 text-[15px] leading-[22px] text-[#111]">Atendimento pelo painel de mensagens</p>
        </article>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        {sellerProducts.length > 0 && user ? (
          <Link
            className="inline-flex h-10 items-center justify-center rounded-[6px] border border-[#167307] bg-white px-4 text-[13px] text-[#167307] no-underline"
            to={`/loja/${user.uid}`}
          >
            Editar minha loja
          </Link>
        ) : null}
        <Link
          className="inline-flex h-10 items-center justify-center rounded-[6px] border border-[#dfe3e8] bg-white px-4 text-[13px] text-[#071735] no-underline"
          to="/mensagens"
        >
          Conversas de venda
        </Link>
      </div>
    </section>
  );

  const renderCommunications = () => (
    <section className="rounded-[8px] border border-[#dfe3e8] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[12px] uppercase tracking-[0.16em] text-[#167307]">Comunicacoes</p>
          <h2 className="mt-1 text-[22px] leading-[29px] text-[#111]">Mensagens e notificacoes</h2>
          <p className="mt-2 max-w-[620px] text-[14px] leading-[22px] text-[#52606d]">
            O chat com vendedores e compradores ja esta ativo. As notificacoes novas aparecem no sino do navbar.
          </p>
        </div>
        <Link className="rounded-[6px] bg-[#167307] px-4 py-2 text-[13px] text-white no-underline" to="/mensagens">
          Abrir conversas
        </Link>
      </div>
    </section>
  );

  const renderOverview = () => (
    <>
      {securityPromptOpen ? (
        <section className="mb-8 flex flex-wrap items-center gap-4 rounded-[8px] border border-[#dfe3e8] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ecf8e8] text-[#167307]">
            <FiLock size={20} />
          </span>
          <div className="min-w-[220px] flex-1">
            <p className="text-[15px] leading-[21px] text-[#111]">Crie uma senha e mantenha sua conta segura</p>
            <p className="mt-1 text-[12px] leading-[17px] text-[#667085]">
              Enviamos um link pelo Firebase Auth para definir ou atualizar a senha.
            </p>
          </div>
          <button
            className="h-9 rounded-[6px] bg-[#3483fa] px-4 text-[13px] text-white"
            onClick={() => void sendPasswordEmail()}
            type="button"
          >
            Criar
          </button>
          <button
            aria-label="Fechar aviso de seguranca"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f1f3f5] text-[#52606d]"
            onClick={() => setSecurityPromptOpen(false)}
            type="button"
          >
            <FiX />
          </button>
          {passwordMessage ? <p className="basis-full pl-[60px] text-[12px] leading-[17px] text-[#167307]">{passwordMessage}</p> : null}
        </section>
      ) : null}

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {dashboardCards.map((card) => (
          <button
            className="min-h-[142px] rounded-[8px] border border-[#dfe3e8] bg-white p-4 text-left shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-colors hover:border-[#167307]"
            key={card.id}
            onClick={() => selectSection(card.id)}
            type="button"
          >
            <span className="flex items-start justify-between gap-3">
              <span className="flex h-9 w-9 items-center justify-center text-[#111]">{card.icon}</span>
              {card.ready ? null : (
                <span className="rounded-full bg-[#fff4e5] px-2 py-1 text-[10px] font-medium text-[#b54708]">W.I.P</span>
              )}
            </span>
            <span className="mt-5 block text-[16px] leading-[22px] text-[#111]">{card.title}</span>
            <span className="mt-1 block text-[13px] leading-[20px] text-[#52606d]">{card.description}</span>
          </button>
        ))}
      </section>

      <p className="mt-10 text-[13px] leading-[20px] text-[#52606d]">
        Voce pode{" "}
        <button className="text-[#167307]" onClick={() => selectSection("privacy")} type="button">
          cancelar sua conta
        </button>{" "}
        quando esse fluxo estiver disponivel na central de privacidade.
      </p>
    </>
  );

  const renderActiveSection = () => {
    if (activeSection === "overview") {
      return renderOverview();
    }

    if (activeSection === "profile") {
      return renderProfileForm();
    }

    if (activeSection === "security") {
      return renderSecurity();
    }

    if (activeSection === "purchases") {
      return renderPurchases();
    }

    if (activeSection === "sales") {
      return renderSales();
    }

    if (activeSection === "communications") {
      return renderCommunications();
    }

    return <WipPanel {...wipContent[activeSection]} />;
  };

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#e9e9e9] font-['Montserrat',sans-serif] text-[#071735] [&_button]:font-[inherit] [&_h1]:m-0 [&_h2]:m-0 [&_h3]:m-0 [&_p]:m-0">
      <AppHeader showNav={false} />

      <div className="mx-auto grid min-h-[calc(100vh-78px)] w-full max-w-[1512px] lg:grid-cols-[264px_minmax(0,1fr)]">
        <aside
          className={`fixed inset-y-0 left-0 z-[80] w-[264px] bg-[#f5f5f5] pt-[78px] shadow-[16px_0_50px_rgba(0,0,0,0.18)] transition-transform lg:sticky lg:top-[78px] lg:z-0 lg:h-[calc(100vh-78px)] lg:translate-x-0 lg:pt-0 lg:shadow-none ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col overflow-y-auto px-5 py-6">
            <button
              className="mb-8 flex items-center gap-4 bg-transparent p-0 text-left text-[15px] font-semibold text-[#111]"
              onClick={() => selectSection("overview")}
              type="button"
            >
              <FiMenu size={22} />
              Minha conta
            </button>

            <nav className="grid gap-1">
              {accountNavigation.map((item) => {
                const active = activeSection === item.id;

                return (
                  <button
                    className={`flex min-h-11 items-center gap-3 rounded-[6px] px-2 text-left text-[13px] leading-[18px] transition-colors ${
                      active ? "bg-[#ecf8e8] text-[#167307]" : "text-[#52606d] hover:bg-white"
                    }`}
                    key={item.id}
                    onClick={() => selectSection(item.id)}
                    type="button"
                  >
                    <span className="relative flex h-7 w-7 items-center justify-center text-[19px]">
                      {item.icon}
                      {item.ready ? <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-[#3483fa]" /> : null}
                    </span>
                    <span className="min-w-0 flex-1">{item.label}</span>
                    {!item.ready ? <FiChevronDown size={16} className="-rotate-90 text-[#98a2b3]" /> : null}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {sidebarOpen ? (
          <button
            aria-label="Fechar menu da conta"
            className="fixed inset-0 z-[70] bg-black/30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            type="button"
          />
        ) : null}

        <section className="min-w-0 px-4 py-7 sm:px-8 lg:px-[88px] lg:py-10">
          <button
            className="mb-5 flex h-10 items-center gap-2 rounded-[6px] bg-white px-3 text-[13px] text-[#071735] shadow-[0_1px_3px_rgba(0,0,0,0.08)] lg:hidden"
            onClick={() => setSidebarOpen(true)}
            type="button"
          >
            <FiMenu />
            Menu da conta
          </button>

          <header className="mb-8 flex flex-wrap items-center gap-5">
            <ProfileAvatar initials={initials} onPhotoChange={handlePhotoChange} photoURL={photoURL} />
            <div className="min-w-0">
              <h1 className="truncate text-[24px] leading-[31px] text-[#111] sm:text-[28px] sm:leading-[36px]">
                {profileName}
              </h1>
              <p className="mt-1 break-all text-[14px] leading-[20px] text-[#111]">{user.email}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] leading-[15px]">
                <span className="rounded-full bg-white px-3 py-1 text-[#52606d]">{profile?.accountType ?? "Usuario"}</span>
                {sellerProducts.length > 0 ? (
                  <span className="rounded-full bg-[#ecf8e8] px-3 py-1 text-[#167307]">
                    {sellerProducts.length} produto(s) a venda
                  </span>
                ) : null}
                {photoFile ? <span className="rounded-full bg-[#fff4e5] px-3 py-1 text-[#b54708]">Foto pendente</span> : null}
              </div>
            </div>
            {photoFile ? (
              <button
                className="ml-auto h-10 rounded-[6px] bg-[#167307] px-4 text-[13px] text-white disabled:opacity-70"
                disabled={saving}
                onClick={() => void saveProfile()}
                type="button"
              >
                Salvar foto
              </button>
            ) : null}
          </header>

          {renderActiveSection()}
        </section>
      </div>

      {cropOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-[2px]">
          <div className="max-h-[calc(100vh-3rem)] w-full max-w-[920px] overflow-hidden rounded-[8px] border border-white/10 bg-white text-[#071735] shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between border-b border-[#e4e7eb] px-5 py-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#667085]">Foto de perfil</p>
                <h2 className="mt-1 text-[22px] font-semibold leading-[28px] text-[#071735]">
                  Posicione e recorte sua imagem
                </h2>
              </div>

              <button
                aria-label="Fechar recorte"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f1f3f5] text-[#667085] transition-colors hover:text-[#071735]"
                onClick={closeCropModal}
                type="button"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="grid max-h-[calc(100vh-8.5rem)] gap-0 overflow-y-auto lg:grid-cols-[1fr_300px] lg:overflow-hidden">
              <div className="border-b border-[#e4e7eb] bg-[#0b0f12] p-4 lg:border-b-0 lg:border-r lg:border-[#e4e7eb]">
                <div
                  ref={cropFrameRef}
                  className={`relative aspect-square w-full max-h-[min(70vh,560px)] overflow-hidden bg-[#0f1215] ${
                    isDragging ? "cursor-grabbing" : "cursor-grab"
                  }`}
                  onPointerDown={handleCropPointerDown}
                >
                  {cropSourceUrl ? (
                    <img
                      alt="Recorte da foto"
                      className="absolute select-none"
                      draggable={false}
                      onDragStart={(event) => event.preventDefault()}
                      onLoad={(event) => {
                        const target = event.currentTarget;
                        setCropDimensions({
                          width: target.naturalWidth,
                          height: target.naturalHeight,
                        });
                      }}
                      src={cropSourceUrl}
                      style={
                        cropDimensions
                          ? (() => {
                              const baseScale = Math.max(
                                cropFrameSize / cropDimensions.width,
                                cropFrameSize / cropDimensions.height
                              );

                              return {
                                height: `${cropDimensions.height * baseScale * cropZoom}px`,
                                left: `${50 + cropOffset.x}%`,
                                top: `${50 + cropOffset.y}%`,
                                transform: "translate(-50%, -50%)",
                                width: `${cropDimensions.width * baseScale * cropZoom}px`,
                              };
                            })()
                          : {
                              height: "100%",
                              left: "50%",
                              top: "50%",
                              transform: "translate(-50%, -50%)",
                              width: "100%",
                            }
                      }
                    />
                  ) : null}

                  <div className="pointer-events-none absolute inset-0 border border-white/10" />
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0,transparent_36%,rgba(0,0,0,0.22)_100%)]" />
                </div>
              </div>

              <aside className="bg-white p-5">
                <div className="rounded-[8px] border border-[#e4e7eb] bg-[#f8fafc] p-4">
                  <p className="text-[12px] uppercase tracking-[0.16em] text-[#667085]">Ajustes</p>

                  <div className="mt-4 space-y-3">
                    <label className="block">
                      <span className="mb-2 block text-[13px] font-medium text-[#344054]">Zoom</span>
                      <div className="flex items-center gap-3">
                        <FiZoomOut className="shrink-0 text-[#98a2b3]" />
                        <input
                          className="h-2 w-full accent-[#167307]"
                          max="3"
                          min="1"
                          onChange={(event) => setCropZoom(Number(event.target.value))}
                          step="0.01"
                          type="range"
                          value={cropZoom}
                        />
                        <FiZoomIn className="shrink-0 text-[#98a2b3]" />
                      </div>
                    </label>

                    <p className="text-[12px] leading-[18px] text-[#667085]">
                      Arraste a imagem para posicionar o rosto. Depois salve o perfil para publicar a foto.
                    </p>
                  </div>

                  <div className="mt-4 border-t border-[#e4e7eb] pt-4">
                    <div className="relative mx-auto flex h-[180px] w-[180px] items-center justify-center overflow-hidden rounded-full border border-[#d0d5dd] bg-[#ecf8e8]">
                      {cropSourceUrl && cropDimensions ? (
                        <img
                          alt="Previa do recorte"
                          className="absolute select-none"
                          draggable={false}
                          src={cropSourceUrl}
                          style={{
                            height: `${
                              cropDimensions.height *
                              Math.max(cropFrameSize / cropDimensions.width, cropFrameSize / cropDimensions.height) *
                              cropZoom *
                              (180 / cropFrameSize)
                            }px`,
                            left: `calc(50% + ${cropOffset.x}%)`,
                            top: `calc(50% + ${cropOffset.y}%)`,
                            transform: "translate(-50%, -50%)",
                            width: `${
                              cropDimensions.width *
                              Math.max(cropFrameSize / cropDimensions.width, cropFrameSize / cropDimensions.height) *
                              cropZoom *
                              (180 / cropFrameSize)
                            }px`,
                          }}
                        />
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    className="inline-flex h-11 items-center gap-2 rounded-[6px] border border-[#d0d5dd] bg-white px-4 text-[14px] font-medium text-[#344054] transition-colors hover:border-[#98a2b3]"
                    onClick={closeCropModal}
                    type="button"
                  >
                    Cancelar
                  </button>
                  <button
                    className="inline-flex h-11 items-center gap-2 rounded-[6px] border-0 bg-[#167307] px-4 text-[14px] font-medium text-white transition-colors hover:bg-[#125d05] disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={isCropping || !cropSourceUrl || !cropDimensions}
                    onClick={() => {
                      void applyCrop();
                    }}
                    type="button"
                  >
                    <FiCheck />
                    {isCropping ? "Aplicando..." : "Usar foto"}
                  </button>
                </div>
              </aside>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
};

export default TelaPerfil;
