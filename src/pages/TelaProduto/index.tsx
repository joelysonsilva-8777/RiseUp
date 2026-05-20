import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type FunctionComponent } from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FiCheckCircle,
  FiHeart,
  FiMapPin,
  FiMessageCircle,
  FiPackage,
  FiSend,
  FiShoppingCart,
  FiStar,
  FiTrash2,
  FiUser,
  FiX,
} from "react-icons/fi";
import { AppHeader } from "../../components/AppHeader";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { defaultProducts, formatCurrency, type Product } from "../../data/products";
import { firestore, storage } from "../../firebase/firebase";
import { useProducts } from "../../hooks/useProducts";

type SellerProfile = {
  bio?: string;
  city?: string;
  displayName?: string;
  photoURL?: string;
  state?: string;
};

type ProductComment = {
  createdAt?: { toDate?: () => Date } | null;
  id: string;
  parentId?: string | null;
  text: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
};

type ProductReview = ProductComment & {
  image?: string;
  productId: string;
  rating: number;
};

type ZoomPosition = {
  x: number;
  y: number;
};

const conditionLabels: Record<string, string> = {
  novo: "Novo",
  usado: "Usado",
  recondicionado: "Recondicionado",
  "caixa-aberta": "Caixa aberta",
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
    month: "short",
    year: "numeric",
  });
};

const getSellerDisplayName = (product: Product, sellerProfile: SellerProfile | null) =>
  sellerProfile?.displayName ?? product.sellerName ?? "Vendedor Acesse+";

const getSellerLocation = (product: Product, sellerProfile: SellerProfile | null) => {
  const city = sellerProfile?.city ?? product.sellerCity ?? product.city ?? "Paulista";
  const state = sellerProfile?.state ?? product.sellerState ?? product.state ?? "PE";

  return `${city} - ${state}`;
};

const normalizeComment = (id: string, data: Record<string, unknown>): ProductComment => ({
  createdAt: data.createdAt as ProductComment["createdAt"],
  id,
  parentId: data.parentId ? String(data.parentId) : null,
  text: String(data.text ?? ""),
  userId: String(data.userId ?? ""),
  userName: String(data.userName ?? "Usuario Acesse+"),
  userPhotoURL: data.userPhotoURL ? String(data.userPhotoURL) : undefined,
});

const normalizeReview = (id: string, data: Record<string, unknown>): ProductReview => ({
  ...normalizeComment(id, data),
  image: data.image ? String(data.image) : undefined,
  productId: String(data.productId ?? ""),
  rating: Math.max(1, Math.min(5, Number(data.rating ?? 5))),
});

const createThreadId = (buyerId: string, sellerId: string, productId: string) =>
  `${buyerId}_${sellerId}_${productId}`.replace(/[^a-zA-Z0-9_-]/g, "_");

const Avatar = ({
  name,
  photoURL,
  size = "md",
}: {
  name: string;
  photoURL?: string;
  size?: "sm" | "md" | "lg";
}) => {
  const sizeClassName = size === "lg" ? "h-14 w-14" : size === "sm" ? "h-9 w-9" : "h-11 w-11";

  return (
    <span className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#ecf8e8] text-[#167307] ${sizeClassName}`}>
      {photoURL ? <img className="h-full w-full object-cover" alt={name} src={photoURL} /> : <FiUser size={size === "lg" ? 24 : 18} />}
    </span>
  );
};

const RatingPills = ({ rating }: { rating: number }) => (
  <span className="flex items-center gap-1 text-[#167307]">
    {Array.from({ length: 5 }, (_, index) => (
      <FiStar
        fill={index < rating ? "currentColor" : "none"}
        key={index}
        size={15}
        strokeWidth={2.1}
      />
    ))}
  </span>
);

const SimilarProductCard = ({
  onPreview,
  product,
}: {
  onPreview: (product: Product | null) => void;
  product: Product;
}) => (
  <article className="min-w-0 rounded-[8px] border border-[#dfe3e8] bg-white p-3">
    <Link className="block text-[#111] no-underline" to={`/produto/${product.id}`}>
      <div
        className="aspect-square rounded-[6px] bg-[#f7faf6]"
        onMouseEnter={() => onPreview(product)}
        onMouseLeave={() => onPreview(null)}
      >
        <img className="h-full w-full object-contain p-3" alt={product.name} src={product.image} />
      </div>
      <h3 className="mt-3 line-clamp-2 min-h-[40px] text-[14px] leading-[20px] text-[#111]">{product.name}</h3>
      <p className="mt-2 text-[17px] leading-[22px] text-[#111]">{formatCurrency(product.price)}</p>
      <p className="mt-2 text-[11px] leading-[15px] text-[#52606d]">{product.city ?? "Paulista"} - {product.state ?? "PE"}</p>
    </Link>
  </article>
);

const TelaProduto: FunctionComponent = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { products } = useProducts();
  const { addItem } = useCart();
  const { displayName, photoURL, profile, user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPosition, setZoomPosition] = useState<ZoomPosition>({ x: 50, y: 50 });
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [comments, setComments] = useState<ProductComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewImageFile, setReviewImageFile] = useState<File | null>(null);
  const [reviewImagePreview, setReviewImagePreview] = useState("");
  const [hasPurchased, setHasPurchased] = useState(false);
  const [hoveredSimilarProduct, setHoveredSimilarProduct] = useState<Product | null>(null);
  const [interactionError, setInteractionError] = useState("");

  const product = useMemo(
    () =>
      products.find((item) => item.id === productId) ??
      defaultProducts.find((item) => item.id === productId) ??
      products[0] ??
      defaultProducts[0],
    [productId, products]
  );

  const galleryImages = useMemo(() => {
    const ownImages = product.images && product.images.length > 0 ? product.images : [product.image];

    return Array.from(new Set(ownImages)).slice(0, 5);
  }, [product.image, product.images]);

  const similarProducts = useMemo(() => {
    const currentTags = new Set((product.tags ?? []).map((tag) => tag.toLowerCase()));

    return products
      .filter((item) => item.id !== product.id)
      .map((item) => {
        const tagScore = (item.tags ?? []).filter((tag) => currentTags.has(tag.toLowerCase())).length;
        const categoryScore = item.category === product.category ? 2 : 0;
        const groupScore = item.listingGroup && item.listingGroup === product.listingGroup ? 1 : 0;

        return { item, score: tagScore * 3 + categoryScore + groupScore };
      })
      .filter(({ score }) => score > 0)
      .sort((first, second) => second.score - first.score)
      .map(({ item }) => item)
      .slice(0, 4);
  }, [product, products]);

  const sellerName = getSellerDisplayName(product, sellerProfile);
  const isOwnProduct = Boolean(user && product.sellerId && user.uid === product.sellerId);
  const sellerPhotoURL = sellerProfile?.photoURL || product.sellerPhotoURL || (isOwnProduct ? photoURL : "");
  const sellerLocation = getSellerLocation(product, sellerProfile);
  const averageRating =
    reviews.length > 0 ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length : 0;
  const parentComments = comments.filter((comment) => !comment.parentId);

  useEffect(() => {
    setSelectedImage(galleryImages[0] ?? product.image);
  }, [galleryImages, product.image]);

  useEffect(() => {
    try {
      window.sessionStorage.setItem("acesse-last-viewed-product-id", product.id);
    } catch {
      // Sessao indisponivel em alguns navegadores privados.
    }
  }, [product.id]);

  useEffect(() => {
    if (!product.sellerId) {
      setSellerProfile(null);
      return;
    }

    return onSnapshot(doc(firestore, "sellerProfiles", product.sellerId), (snapshot) => {
      setSellerProfile(snapshot.exists() ? (snapshot.data() as SellerProfile) : null);
    });
  }, [product.sellerId]);

  useEffect(() => {
    if (!user || user.uid !== product.sellerId) {
      return;
    }

    const sellerDisplayName = displayName || user.email || "Vendedor Acesse+";
    const nextSellerPhotoURL = photoURL || product.sellerPhotoURL || "";

    void setDoc(
      doc(firestore, "sellerProfiles", user.uid),
      {
        bio: profile?.bio ?? "",
        city: profile?.city ?? product.city ?? "",
        displayName: sellerDisplayName,
        photoURL: nextSellerPhotoURL,
        sellerId: user.uid,
        state: profile?.state ?? product.state ?? "",
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    ).catch(() => undefined);

    void updateDoc(doc(firestore, "products", product.id), {
      sellerCity: profile?.city ?? product.city ?? "",
      sellerName: sellerDisplayName,
      sellerPhotoURL: nextSellerPhotoURL,
      sellerState: profile?.state ?? product.state ?? "",
      updatedAt: serverTimestamp(),
    }).catch(() => undefined);
  }, [
    displayName,
    photoURL,
    product.city,
    product.id,
    product.sellerId,
    product.sellerPhotoURL,
    product.state,
    profile?.bio,
    profile?.city,
    profile?.state,
    user,
  ]);

  useEffect(() => {
    if (!product.sellerId) {
      setFollowersCount(0);
      return undefined;
    }

    return onSnapshot(collection(firestore, "sellerProfiles", product.sellerId, "followers"), (snapshot) => {
      setFollowersCount(snapshot.size);
    });
  }, [product.sellerId]);

  useEffect(() => {
    if (!user || !product.sellerId) {
      setIsFollowing(false);
      return undefined;
    }

    return onSnapshot(doc(firestore, "sellerProfiles", product.sellerId, "followers", user.uid), (snapshot) => {
      setIsFollowing(snapshot.exists());
    });
  }, [product.sellerId, user]);

  useEffect(() => {
    const commentsQuery = query(collection(firestore, "products", product.id, "comments"), orderBy("createdAt", "asc"));

    return onSnapshot(commentsQuery, (snapshot) => {
      setComments(snapshot.docs.map((commentDoc) => normalizeComment(commentDoc.id, commentDoc.data())));
    });
  }, [product.id]);

  useEffect(() => {
    const reviewsQuery = query(collection(firestore, "products", product.id, "reviews"), orderBy("createdAt", "desc"));

    return onSnapshot(reviewsQuery, (snapshot) => {
      setReviews(snapshot.docs.map((reviewDoc) => normalizeReview(reviewDoc.id, reviewDoc.data())));
    });
  }, [product.id]);

  useEffect(() => {
    if (!user) {
      setHasPurchased(false);
      return undefined;
    }

    return onSnapshot(doc(firestore, "productPurchases", `${user.uid}_${product.id}`), (snapshot) => {
      setHasPurchased(snapshot.exists());
    });
  }, [product.id, user]);

  const requireLogin = () => {
    if (!user) {
      navigate("/login");
      return false;
    }

    return true;
  };

  const handleAddToCart = async () => {
    await addItem(product, quantity);
    setAddedMessage("Produto adicionado ao carrinho.");
  };

  const toggleFollow = async () => {
    if (!product.sellerId || isOwnProduct || !requireLogin()) {
      return;
    }

    setInteractionError("");

    const followerRef = doc(firestore, "sellerProfiles", product.sellerId, "followers", user!.uid);

    if (isFollowing) {
      await deleteDoc(followerRef);
      return;
    }

    await setDoc(followerRef, {
      createdAt: serverTimestamp(),
      followerId: user!.uid,
      followerName: displayName || user!.email || "Usuario Acesse+",
      followerPhotoURL: photoURL,
    });
  };

  const openMessageThread = async () => {
    if (!product.sellerId || isOwnProduct || !requireLogin()) {
      return;
    }

    const threadId = createThreadId(user!.uid, product.sellerId, product.id);
    const threadRef = doc(firestore, "messageThreads", threadId);

    try {
      await setDoc(
        threadRef,
        {
          buyer: {
            id: user!.uid,
            name: displayName || user!.email || "Usuario Acesse+",
            photoURL,
          },
          buyerId: user!.uid,
          participantIds: [user!.uid, product.sellerId],
          product: {
            id: product.id,
            image: product.image,
            name: product.name,
          },
          seller: {
            id: product.sellerId,
            name: sellerName,
            photoURL: sellerPhotoURL,
          },
          sellerId: product.sellerId,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      navigate(`/mensagens/${threadId}`);
    } catch {
      setInteractionError("Nao foi possivel abrir o chat agora. Confira as regras e tente novamente.");
    }
  };

  const addComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!requireLogin()) {
      return;
    }

    const text = commentText.trim();

    if (text.length < 3) {
      setInteractionError("Escreva um comentario antes de enviar.");
      return;
    }

    await setDoc(doc(collection(firestore, "products", product.id, "comments")), {
      createdAt: serverTimestamp(),
      parentId: null,
      text,
      userId: user!.uid,
      userName: displayName || user!.email || "Usuario Acesse+",
      userPhotoURL: photoURL,
    });

    setCommentText("");
    setInteractionError("");
  };

  const addReply = async (parentId: string) => {
    if (!requireLogin()) {
      return;
    }

    const text = replyText.trim();

    if (text.length < 2) {
      setInteractionError("Escreva uma resposta antes de enviar.");
      return;
    }

    await setDoc(doc(collection(firestore, "products", product.id, "comments")), {
      createdAt: serverTimestamp(),
      parentId,
      text,
      userId: user!.uid,
      userName: displayName || user!.email || "Usuario Acesse+",
      userPhotoURL: photoURL,
    });

    setActiveReplyId(null);
    setReplyText("");
    setInteractionError("");
  };

  const removeComment = async (commentId: string) => {
    await deleteDoc(doc(firestore, "products", product.id, "comments", commentId));
  };

  const handleReviewImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    setReviewImageFile(file);

    if (reviewImagePreview) {
      URL.revokeObjectURL(reviewImagePreview);
    }

    setReviewImagePreview(file ? URL.createObjectURL(file) : "");
  };

  const uploadReviewImage = async () => {
    if (!user || !reviewImageFile) {
      return "";
    }

    const fileName = reviewImageFile.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
    const storageRef = ref(storage, `reviews/${user.uid}/${product.id}/${Date.now()}-${fileName}`);

    await uploadBytes(storageRef, reviewImageFile, {
      contentType: reviewImageFile.type,
    });

    return getDownloadURL(storageRef);
  };

  const addReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!requireLogin()) {
      return;
    }

    if (!hasPurchased) {
      setInteractionError("Somente quem comprou este produto pode avaliar.");
      return;
    }

    const image = await uploadReviewImage();

    await setDoc(
      doc(firestore, "products", product.id, "reviews", user!.uid),
      {
        createdAt: serverTimestamp(),
        image: image || null,
        productId: product.id,
        rating: reviewRating,
        text: reviewText.trim() || "Avaliacao sem comentario.",
        userId: user!.uid,
        userName: displayName || user!.email || "Usuario Acesse+",
        userPhotoURL: photoURL,
      },
      { merge: true }
    );

    setReviewText("");
    setReviewRating(5);
    setReviewImageFile(null);
    setReviewImagePreview("");
    setInteractionError("");
  };

  const removeReview = async (reviewId: string) => {
    await deleteDoc(doc(firestore, "products", product.id, "reviews", reviewId));
  };

  const handleZoomMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;

    setZoomPosition({ x, y });
  };

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#f5f6f7] font-['Montserrat',sans-serif] text-black [&_button]:font-[inherit] [&_h1]:m-0 [&_h2]:m-0 [&_p]:m-0">
      <AppHeader />

      <section className="mx-auto grid w-full max-w-[1240px] grid-cols-1 gap-8 px-4 py-8 md:px-6 lg:grid-cols-[minmax(0,600px)_minmax(360px,1fr)] lg:gap-[48px]">
        <div className="min-w-0 rounded-[8px] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div
            className="relative flex h-[340px] items-center justify-center sm:h-[500px]"
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
            onMouseMove={handleZoomMove}
          >
            <img
              className="h-full max-h-[455px] w-full max-w-[510px] object-contain"
              alt={product.name}
              src={selectedImage || product.image}
            />
            {isZooming ? (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-full top-4 z-30 ml-4 hidden h-[360px] w-[360px] rounded-[8px] border border-[#dfe3e8] bg-white bg-no-repeat shadow-[0_16px_55px_rgba(0,0,0,0.22)] lg:block"
                style={{
                  backgroundImage: `url(${selectedImage || product.image})`,
                  backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  backgroundSize: "230%",
                }}
              />
            ) : null}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            {galleryImages.map((thumb, index) => (
              <button
                className={`flex h-[72px] w-[78px] items-center justify-center rounded-[6px] border bg-white p-1 ${
                  selectedImage === thumb ? "border-[#167307]" : "border-[#dfe3e8]"
                }`}
                type="button"
                key={`${thumb}-${index}`}
                onClick={() => setSelectedImage(thumb)}
              >
                <img className="max-h-full max-w-full object-contain" alt="" src={thumb} />
              </button>
            ))}
          </div>
        </div>

        <div className="min-w-0">
          <section className="rounded-[8px] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="flex flex-wrap items-center gap-2 text-[12px] leading-[16px] text-[#52606d]">
              <span>{conditionLabels[product.condition ?? ""] ?? "Produto"}</span>
              <span>-</span>
              <span>{product.stock ?? 1} unidade(s) disponiveis</span>
              <span>-</span>
              <span>COD {product.catalogCode ?? product.id.slice(0, 10).toUpperCase()}</span>
            </div>

            <h1 className="mt-3 max-w-[560px] text-[24px] leading-[32px] text-black">{product.name}</h1>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#ecf8e8] px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-[#167307]">
                {product.category}
              </span>
              {(product.tags ?? []).slice(0, 5).map((tag) => (
                <span className="rounded-full bg-[#f1f4f7] px-3 py-1 text-[11px] text-[#52606d]" key={tag}>
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-8">
              {product.oldPrice ? (
                <p className="text-[14px] leading-[18px] text-[#8493ad]">{formatCurrency(product.oldPrice)}</p>
              ) : null}
              <p className="text-[32px] leading-[40px] text-black">{formatCurrency(product.price)}</p>
              <p className="mt-2 text-[14px] leading-[18px] text-[#167307]">
                Ou 5x de {formatCurrency(product.price / 5)}
              </p>
            </div>

            <section className="mt-7 flex min-h-[76px] items-center justify-between rounded-[8px] bg-[#f5f6f7] px-5">
              <span className="text-[13px] leading-[17px] text-[#257a0d]">Selecione a quantidade</span>
              <div className="grid h-[44px] w-[124px] grid-cols-3 items-center rounded-[5px] border border-[#257a0d] bg-white text-center text-[18px] text-[#257a0d]">
                <button className="border-0 bg-transparent text-[20px] text-[#777]" onClick={() => setQuantity((current) => Math.max(1, current - 1))} type="button">
                  -
                </button>
                <span>{quantity}</span>
                <button className="border-0 bg-transparent text-[22px] text-[#257a0d]" onClick={() => setQuantity((current) => Math.min(product.stock ?? 99, current + 1))} type="button">
                  +
                </button>
              </div>
            </section>

            <button
              className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-[6px] border-0 bg-[#167307] text-[14px] leading-[18px] text-white transition-colors hover:bg-[#125d05]"
              onClick={() => void handleAddToCart()}
              type="button"
            >
              <FiShoppingCart />
              ADICIONAR AO CARRINHO
            </button>
            {addedMessage ? (
              <div className="mt-3 flex flex-wrap items-center gap-3 text-[12px] leading-[16px] text-[#167307]">
                <span>{addedMessage}</span>
                <Link className="text-[#167307]" to="/carrinho">
                  Ver carrinho
                </Link>
              </div>
            ) : null}
          </section>

          <section className="mt-5 rounded-[8px] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            {product.sellerId ? (
              <Link className="flex items-start gap-4 text-black no-underline" to={`/loja/${product.sellerId}`}>
                <Avatar name={sellerName} photoURL={sellerPhotoURL} size="lg" />
                <div className="min-w-0 flex-1">
                  <h2 className="text-[18px] leading-[23px] text-black">{sellerName}</h2>
                  <p className="mt-1 flex items-center gap-2 text-[13px] leading-[18px] text-[#52606d]">
                    <FiMapPin className="shrink-0" />
                    {sellerLocation}
                  </p>
                  <p className="mt-2 text-[13px] leading-[19px] text-[#52606d]">
                    {sellerProfile?.bio ?? "Vendedor Acesse+ com anuncios focados em acessibilidade e autonomia."}
                  </p>
                  <p className="mt-3 flex flex-wrap gap-3 text-[12px] leading-[16px] text-[#167307]">
                    <span>{followersCount} seguidor(es)</span>
                    <span>{reviews.length} avaliacao(oes)</span>
                    {averageRating > 0 ? <span>Nota media {averageRating.toFixed(1)}/5</span> : null}
                  </p>
                  <span className="mt-2 block text-[12px] leading-[16px] text-[#167307]">Ver loja do vendedor</span>
                </div>
              </Link>
            ) : (
              <div className="flex items-start gap-4">
                <Avatar name={sellerName} photoURL={sellerPhotoURL} size="lg" />
                <div className="min-w-0 flex-1">
                  <h2 className="text-[18px] leading-[23px] text-black">{sellerName}</h2>
                  <p className="mt-1 flex items-center gap-2 text-[13px] leading-[18px] text-[#52606d]">
                    <FiMapPin className="shrink-0" />
                    {sellerLocation}
                  </p>
                  <p className="mt-2 text-[13px] leading-[19px] text-[#52606d]">
                    {sellerProfile?.bio ?? "Vendedor Acesse+ com anuncios focados em acessibilidade e autonomia."}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                className="flex h-10 items-center justify-center gap-2 rounded-[6px] border border-[#167307] bg-white text-[14px] text-[#167307] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!product.sellerId || isOwnProduct}
                onClick={() => void toggleFollow()}
                type="button"
              >
                <FiHeart fill={isFollowing ? "currentColor" : "none"} />
                {isOwnProduct ? "Seu perfil" : isFollowing ? "Seguindo" : "Seguir vendedor"}
              </button>
              <button
                className="flex h-10 items-center justify-center gap-2 rounded-[6px] bg-[#ecf8e8] text-[14px] text-[#167307] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!product.sellerId || isOwnProduct}
                onClick={() => void openMessageThread()}
                type="button"
              >
                <FiMessageCircle />
                Mandar mensagem
              </button>
            </div>
          </section>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1240px] grid-cols-1 gap-6 px-4 pb-12 md:px-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-6">
          <section className="rounded-[8px] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <h2 className="text-[20px] leading-[26px] text-black">Descricao</h2>
            <p className="mt-4 whitespace-pre-line text-[15px] leading-[25px] text-[#333]">{product.description}</p>
          </section>

          {product.attributes && Object.keys(product.attributes).length > 0 ? (
            <section className="rounded-[8px] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <h2 className="text-[20px] leading-[26px] text-black">Caracteristicas principais</h2>
              <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                {Object.entries(product.attributes).map(([key, value]) => (
                  <div className="rounded-[6px] bg-[#f5f6f7] px-4 py-3" key={key}>
                    <dt className="text-[12px] leading-[16px] text-[#777]">{key}</dt>
                    <dd className="m-0 mt-1 text-[14px] leading-[19px] text-[#222]">
                      {Array.isArray(value) ? value.join(", ") : value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          <section className="rounded-[8px] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <h2 className="text-[20px] leading-[26px] text-black">Comentarios</h2>
            <form className="mt-5 grid gap-3" onSubmit={addComment}>
              <textarea
                className="min-h-[92px] resize-y rounded-[6px] border border-[#dfe3e8] bg-white px-4 py-3 text-[14px] leading-[21px] outline-none focus:border-[#167307]"
                onChange={(event) => setCommentText(event.target.value)}
                placeholder="Pergunte algo sobre o produto."
                value={commentText}
              />
              <button className="ml-auto flex h-10 items-center gap-2 rounded-[6px] bg-[#167307] px-4 text-[14px] text-white" type="submit">
                <FiSend />
                Comentar
              </button>
            </form>
            <div className="mt-6 grid gap-5">
              {parentComments.length === 0 ? (
                <p className="text-[13px] leading-[19px] text-[#52606d]">Ainda nao ha comentarios neste produto.</p>
              ) : (
                parentComments.map((comment) => {
                  const replies = comments.filter((reply) => reply.parentId === comment.id);

                  return (
                    <article className="border-t border-[#edf0f2] pt-5" key={comment.id}>
                      <div className="flex gap-3">
                        <Avatar name={comment.userName} photoURL={comment.userPhotoURL} size="sm" />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-[14px] leading-[18px] text-[#111]">{comment.userName}</h3>
                            <span className="text-[11px] leading-[14px] text-[#777]">{getDateTimeLabel(comment.createdAt)}</span>
                          </div>
                          <p className="mt-2 text-[14px] leading-[21px] text-[#222]">{comment.text}</p>
                          <div className="mt-2 flex gap-3">
                            <button className="bg-transparent p-0 text-[12px] text-[#167307]" onClick={() => setActiveReplyId(comment.id)} type="button">
                              Responder
                            </button>
                            {user?.uid === comment.userId ? (
                              <button className="flex items-center gap-1 bg-transparent p-0 text-[12px] text-[#b42318]" onClick={() => void removeComment(comment.id)} type="button">
                                <FiTrash2 size={13} />
                                Remover
                              </button>
                            ) : null}
                          </div>

                          {activeReplyId === comment.id ? (
                            <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_104px]">
                              <input
                                className="h-10 rounded-[6px] border border-[#dfe3e8] px-3 text-[13px] outline-none focus:border-[#167307]"
                                onChange={(event) => setReplyText(event.target.value)}
                                placeholder="Escreva uma resposta"
                                value={replyText}
                              />
                              <button className="h-10 rounded-[6px] bg-[#167307] text-[13px] text-white" onClick={() => void addReply(comment.id)} type="button">
                                Enviar
                              </button>
                            </div>
                          ) : null}

                          {replies.length > 0 ? (
                            <div className="mt-4 grid gap-3 border-l-2 border-[#ecf8e8] pl-4">
                              {replies.map((reply) => (
                                <article className="flex gap-3" key={reply.id}>
                                  <Avatar name={reply.userName} photoURL={reply.userPhotoURL} size="sm" />
                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <h4 className="text-[13px] leading-[17px] text-[#111]">{reply.userName}</h4>
                                      <span className="text-[11px] leading-[14px] text-[#777]">{getDateTimeLabel(reply.createdAt)}</span>
                                    </div>
                                    <p className="mt-1 text-[13px] leading-[20px] text-[#333]">{reply.text}</p>
                                    {user?.uid === reply.userId ? (
                                      <button className="mt-1 flex items-center gap-1 bg-transparent p-0 text-[11px] text-[#b42318]" onClick={() => void removeComment(reply.id)} type="button">
                                        <FiTrash2 size={12} />
                                        Remover
                                      </button>
                                    ) : null}
                                  </div>
                                </article>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>

          <section className="rounded-[8px] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <h2 className="text-[20px] leading-[26px] text-black">Avaliacoes</h2>
            {hasPurchased ? (
              <form className="mt-5 grid gap-3" onSubmit={addReview}>
                <label>
                  <span className="mb-2 block text-[13px] text-[#333]">Nota</span>
                  <select
                    className="h-10 rounded-[6px] border border-[#dfe3e8] bg-white px-3 text-[14px] outline-none focus:border-[#167307]"
                    onChange={(event) => setReviewRating(Number(event.target.value))}
                    value={reviewRating}
                  >
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <option key={rating} value={rating}>
                        {rating} estrela(s)
                      </option>
                    ))}
                  </select>
                </label>
                <textarea
                  className="min-h-[92px] resize-y rounded-[6px] border border-[#dfe3e8] bg-white px-4 py-3 text-[14px] leading-[21px] outline-none focus:border-[#167307]"
                  onChange={(event) => setReviewText(event.target.value)}
                  placeholder="Conte como foi sua experiencia com este produto ou vendedor."
                  value={reviewText}
                />
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex h-10 cursor-pointer items-center gap-2 rounded-[6px] border border-[#dfe3e8] bg-white px-4 text-[13px] text-[#167307]">
                    <FiPackage />
                    Foto do produto comprado
                    <input className="hidden" accept="image/*" onChange={handleReviewImageChange} type="file" />
                  </label>
                  {reviewImagePreview ? (
                    <span className="flex items-center gap-2 text-[12px] text-[#52606d]">
                      <img className="h-10 w-10 rounded-[5px] object-cover" alt="" src={reviewImagePreview} />
                      Foto selecionada
                      <button
                        className="text-[#b42318]"
                        onClick={() => {
                          setReviewImageFile(null);
                          setReviewImagePreview("");
                        }}
                        type="button"
                      >
                        <FiX />
                      </button>
                    </span>
                  ) : null}
                </div>
                <button className="ml-auto flex h-10 items-center gap-2 rounded-[6px] bg-[#167307] px-4 text-[14px] text-white" type="submit">
                  <FiStar />
                  Avaliar
                </button>
              </form>
            ) : (
              <p className="mt-4 rounded-[6px] bg-[#f5f6f7] px-4 py-3 text-[13px] leading-[20px] text-[#52606d]">
                Apenas quem comprou este produto pela Acesse+ pode publicar uma avaliacao.
              </p>
            )}

            <div className="mt-6 grid gap-5">
              {reviews.length === 0 ? (
                <p className="text-[13px] leading-[19px] text-[#52606d]">Este produto ainda nao recebeu avaliacoes.</p>
              ) : (
                reviews.map((review) => (
                  <article className="border-t border-[#edf0f2] pt-5" key={review.id}>
                    <div className="flex gap-3">
                      <Avatar name={review.userName} photoURL={review.userPhotoURL} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <h3 className="text-[14px] leading-[18px] text-[#111]">{review.userName}</h3>
                            <p className="mt-1 text-[11px] leading-[14px] text-[#777]">{getDateTimeLabel(review.createdAt)}</p>
                          </div>
                          <RatingPills rating={review.rating} />
                        </div>
                        <p className="mt-3 text-[14px] leading-[21px] text-[#222]">{review.text}</p>
                        {review.image ? <img className="mt-3 h-[96px] w-[96px] rounded-[6px] object-cover" alt="Foto enviada na avaliacao" src={review.image} /> : null}
                        {user?.uid === review.userId ? (
                          <button className="mt-3 flex items-center gap-1 bg-transparent p-0 text-[12px] text-[#b42318]" onClick={() => void removeReview(review.id)} type="button">
                            <FiTrash2 size={13} />
                            Remover avaliacao
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="rounded-[8px] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <h2 className="text-[20px] leading-[26px] text-black">Produtos semelhantes</h2>
            {similarProducts.length === 0 ? (
              <p className="mt-4 text-[13px] leading-[19px] text-[#52606d]">Ainda nao encontramos produtos com tags parecidas.</p>
            ) : (
              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {similarProducts.map((similarProduct) => (
                  <SimilarProductCard key={similarProduct.id} onPreview={setHoveredSimilarProduct} product={similarProduct} />
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="h-fit rounded-[8px] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] lg:sticky lg:top-[112px]">
          <h2 className="text-[18px] leading-[23px] text-black">Detalhes do anuncio</h2>
          <div className="mt-5 grid gap-3 text-[13px] leading-[19px] text-[#52606d]">
            <p className="flex items-center gap-2">
              <FiPackage className="shrink-0 text-[#167307]" />
              SKU: {product.sku || "Nao informado"}
            </p>
            <p className="flex items-center gap-2">
              <FiMapPin className="shrink-0 text-[#167307]" />
              Produto em {product.city ?? "Paulista"} - {product.state ?? "PE"}
            </p>
            <p className="flex items-center gap-2">
              <FiCheckCircle className="shrink-0 text-[#167307]" />
              Compra segura com historico no Firebase.
            </p>
          </div>
          {interactionError ? <p className="mt-4 text-[13px] leading-[19px] text-[#b42318]">{interactionError}</p> : null}
        </aside>
      </section>

      {hoveredSimilarProduct ? (
        <div className="pointer-events-none fixed bottom-6 right-6 z-50 hidden w-[280px] rounded-[10px] border border-[#dfe3e8] bg-white p-4 shadow-[0_18px_60px_rgba(0,0,0,0.22)] lg:block">
          <div className="aspect-square bg-[#f7faf6]">
            <img className="h-full w-full object-contain p-3" alt={hoveredSimilarProduct.name} src={hoveredSimilarProduct.image} />
          </div>
          <p className="mt-3 text-[13px] leading-[18px] text-[#111]">{hoveredSimilarProduct.name}</p>
        </div>
      ) : null}
    </main>
  );
};

export default TelaProduto;
