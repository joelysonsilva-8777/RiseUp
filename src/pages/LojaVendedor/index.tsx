import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { collection, deleteDoc, doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FiArrowDown,
  FiArrowUp,
  FiCamera,
  FiCheckCircle,
  FiEdit3,
  FiHeart,
  FiImage,
  FiLayers,
  FiMapPin,
  FiPackage,
  FiSave,
  FiShare2,
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

type SellerStoreProfile = {
  bio?: string;
  city?: string;
  coverURL?: string;
  displayName?: string;
  photoURL?: string;
  sellerId?: string;
  state?: string;
  storeAbout?: string;
  storeCategories?: string[];
  storeProductOrder?: string[];
  storeTitle?: string;
};

const toStringArray = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

const normalizeStoreProfile = (data: Record<string, unknown>): SellerStoreProfile => ({
  bio: data.bio ? String(data.bio) : undefined,
  city: data.city ? String(data.city) : undefined,
  coverURL: data.coverURL ? String(data.coverURL) : undefined,
  displayName: data.displayName ? String(data.displayName) : undefined,
  photoURL: data.photoURL ? String(data.photoURL) : undefined,
  sellerId: data.sellerId ? String(data.sellerId) : undefined,
  state: data.state ? String(data.state) : undefined,
  storeAbout: data.storeAbout ? String(data.storeAbout) : undefined,
  storeCategories: toStringArray(data.storeCategories),
  storeProductOrder: toStringArray(data.storeProductOrder),
  storeTitle: data.storeTitle ? String(data.storeTitle) : undefined,
});

const getUniqueValues = (values: string[]) =>
  Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));

const getSafeFileName = (name: string) => name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");

const Avatar = ({ name, photoURL }: { name: string; photoURL?: string }) => (
  <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#e6e8eb] bg-[#ecf8e8] text-[#167307]">
    {photoURL ? <img className="h-full w-full object-cover" alt={name} src={photoURL} /> : <FiUser size={26} />}
  </span>
);

const StoreProductCard = ({
  onAddToCart,
  product,
}: {
  onAddToCart: (product: Product) => void;
  product: Product;
}) => (
  <article className="min-w-0 rounded-[8px] border border-[#dfe3e8] bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
    <Link className="block text-[#111] no-underline" to={`/produto/${product.id}`}>
      <div className="aspect-square rounded-[6px] bg-[#f7faf6]">
        <img className="h-full w-full object-contain p-4" alt={product.name} loading="lazy" src={product.image} />
      </div>
      <h3 className="mt-3 line-clamp-2 min-h-[40px] text-[14px] leading-[20px] text-[#222]">{product.name}</h3>
      <div className="mt-3 min-h-[74px]">
        {product.oldPrice ? (
          <p className="text-[12px] leading-[15px] text-[#8493ad] line-through">{formatCurrency(product.oldPrice)}</p>
        ) : null}
        <p className="text-[20px] leading-[25px] text-[#111]">{formatCurrency(product.price)}</p>
        <p className="mt-1 text-[12px] leading-[16px] text-[#00a650]">5x sem juros</p>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <span className="rounded-[4px] bg-[#d9eaff] px-2 py-1 text-[11px] leading-[14px] text-[#167307]">
          Acesse+ protegido
        </span>
        <span className="rounded-[4px] bg-[#d7f5e2] px-2 py-1 text-[11px] leading-[14px] text-[#008a46]">
          Frete gratis
        </span>
      </div>
    </Link>
    <button
      className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-[6px] bg-[#167307] px-3 text-[12px] leading-[16px] text-white transition-colors hover:bg-[#125d05]"
      onClick={() => onAddToCart(product)}
      type="button"
    >
      <FiShoppingCart size={15} />
      Adicionar
    </button>
  </article>
);

const LojaVendedor = () => {
  const { sellerId: sellerIdParam } = useParams();
  const sellerId = sellerIdParam ?? "";
  const navigate = useNavigate();
  const { displayName, photoURL, user } = useAuth();
  const { addItem } = useCart();
  const { loading: productsLoading, products } = useProducts();
  const [sellerProfile, setSellerProfile] = useState<SellerStoreProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [followersCount, setFollowersCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeCategory, setActiveCategory] = useState("inicio");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [storeTitle, setStoreTitle] = useState("");
  const [storeAboutDraft, setStoreAboutDraft] = useState("");
  const [categoriesText, setCategoriesText] = useState("");
  const [orderedProductIds, setOrderedProductIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [editMessage, setEditMessage] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [cartMessage, setCartMessage] = useState("");
  const [lastViewedProductId, setLastViewedProductId] = useState("");

  const sellerProducts = useMemo(
    () => products.filter((product) => product.sellerId === sellerId),
    [products, sellerId]
  );

  const derivedCategories = useMemo(
    () => getUniqueValues(sellerProducts.map((product) => product.category)).slice(0, 8),
    [sellerProducts]
  );

  const storeCategories = sellerProfile?.storeCategories?.length
    ? sellerProfile.storeCategories
    : derivedCategories;

  const sortedProducts = useMemo(() => {
    const orderedIds = sellerProfile?.storeProductOrder ?? [];
    const orderIndex = new Map(orderedIds.map((productId, index) => [productId, index]));
    const originalIndex = new Map(sellerProducts.map((product, index) => [product.id, index]));

    return [...sellerProducts].sort((first, second) => {
      const firstOrder = orderIndex.get(first.id) ?? Number.MAX_SAFE_INTEGER;
      const secondOrder = orderIndex.get(second.id) ?? Number.MAX_SAFE_INTEGER;

      if (firstOrder !== secondOrder) {
        return firstOrder - secondOrder;
      }

      return (originalIndex.get(first.id) ?? 0) - (originalIndex.get(second.id) ?? 0);
    });
  }, [sellerProducts, sellerProfile?.storeProductOrder]);

  const firstProduct = sortedProducts[0] ?? sellerProducts[0];
  const isOwner = Boolean(user && sellerId && user.uid === sellerId);
  const sellerName =
    sellerProfile?.storeTitle?.trim() ||
    sellerProfile?.displayName ||
    firstProduct?.sellerName ||
    (isOwner ? displayName : "") ||
    "Loja Acesse+";
  const sellerPhotoURL = sellerProfile?.photoURL || firstProduct?.sellerPhotoURL || (isOwner ? photoURL : "");
  const sellerLocation = [sellerProfile?.city || firstProduct?.sellerCity || firstProduct?.city, sellerProfile?.state || firstProduct?.sellerState || firstProduct?.state]
    .filter(Boolean)
    .join(" - ");
  const storeAboutText =
    sellerProfile?.storeAbout?.trim() ||
    sellerProfile?.bio?.trim() ||
    "Loja com produtos selecionados para acessibilidade, autonomia e compra segura.";

  const filteredProducts = useMemo(() => {
    if (activeCategory === "inicio" || activeCategory === "todos") {
      return sortedProducts;
    }

    return sortedProducts.filter((product) => product.category === activeCategory);
  }, [activeCategory, sortedProducts]);

  const relatedProducts = useMemo(() => {
    const lastViewedProduct = sortedProducts.find((product) => product.id === lastViewedProductId);

    if (!lastViewedProduct) {
      return sortedProducts.slice(0, 6);
    }

    return [
      lastViewedProduct,
      ...sortedProducts.filter((product) => product.id !== lastViewedProduct.id && product.category === lastViewedProduct.category),
      ...sortedProducts.filter((product) => product.id !== lastViewedProduct.id && product.category !== lastViewedProduct.category),
    ].slice(0, 6);
  }, [lastViewedProductId, sortedProducts]);

  const orderedProductsForEdit = useMemo(() => {
    const productById = new Map(sellerProducts.map((product) => [product.id, product]));
    const ordered = orderedProductIds
      .map((productId) => productById.get(productId))
      .filter((product): product is Product => Boolean(product));
    const missing = sellerProducts.filter((product) => !orderedProductIds.includes(product.id));

    return [...ordered, ...missing];
  }, [orderedProductIds, sellerProducts]);

  useEffect(() => {
    try {
      setLastViewedProductId(window.sessionStorage.getItem("acesse-last-viewed-product-id") ?? "");
    } catch {
      setLastViewedProductId("");
    }
  }, []);

  useEffect(() => {
    if (!sellerId) {
      setSellerProfile(null);
      setProfileLoading(false);
      return undefined;
    }

    setProfileLoading(true);

    return onSnapshot(
      doc(firestore, "sellerProfiles", sellerId),
      (snapshot) => {
        setSellerProfile(snapshot.exists() ? normalizeStoreProfile(snapshot.data()) : null);
        setProfileLoading(false);
      },
      () => {
        setSellerProfile(null);
        setProfileLoading(false);
      }
    );
  }, [sellerId]);

  useEffect(() => {
    if (!sellerId) {
      setFollowersCount(0);
      return undefined;
    }

    return onSnapshot(collection(firestore, "sellerProfiles", sellerId, "followers"), (snapshot) => {
      setFollowersCount(snapshot.size);
    });
  }, [sellerId]);

  useEffect(() => {
    if (!user || !sellerId) {
      setIsFollowing(false);
      return undefined;
    }

    return onSnapshot(doc(firestore, "sellerProfiles", sellerId, "followers", user.uid), (snapshot) => {
      setIsFollowing(snapshot.exists());
    });
  }, [sellerId, user]);

  useEffect(() => {
    if (!isOwner) {
      return;
    }

    const productIds = sellerProducts.map((product) => product.id);
    const savedOrder = sellerProfile?.storeProductOrder ?? [];
    const nextOrder = [
      ...savedOrder.filter((productId) => productIds.includes(productId)),
      ...productIds.filter((productId) => !savedOrder.includes(productId)),
    ];

    setStoreTitle(sellerProfile?.storeTitle ?? sellerProfile?.displayName ?? displayName ?? "");
    setStoreAboutDraft(sellerProfile?.storeAbout ?? sellerProfile?.bio ?? "");
    setCategoriesText((sellerProfile?.storeCategories?.length ? sellerProfile.storeCategories : derivedCategories).join(", "));
    setOrderedProductIds(nextOrder);
  }, [derivedCategories, displayName, isOwner, sellerProducts, sellerProfile]);

  const toggleFollow = async () => {
    if (!sellerId || isOwner) {
      return;
    }

    if (!user) {
      navigate("/login");
      return;
    }

    const followerRef = doc(firestore, "sellerProfiles", sellerId, "followers", user.uid);

    if (isFollowing) {
      await deleteDoc(followerRef);
      return;
    }

    await setDoc(followerRef, {
      createdAt: serverTimestamp(),
      followerId: user.uid,
      followerName: displayName || user.email || "Usuario Acesse+",
      followerPhotoURL: photoURL,
    });
  };

  const shareStore = async () => {
    const shareUrl = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ text: "Conheca esta loja na Acesse+.", title: sellerName, url: shareUrl });
        setShareMessage("Loja compartilhada.");
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      setShareMessage("Link da loja copiado.");
    } catch {
      setShareMessage("Nao foi possivel compartilhar agora.");
    }
  };

  const addProductToCart = async (product: Product) => {
    await addItem(product, 1);
    setCartMessage(`${product.name} foi adicionado ao carrinho.`);
  };

  const uploadCover = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file || !user || user.uid !== sellerId) {
      return;
    }

    setIsUploadingCover(true);
    setEditMessage("");

    try {
      const storageRef = ref(storage, `sellerStores/${user.uid}/cover/${Date.now()}-${getSafeFileName(file.name)}`);

      await uploadBytes(storageRef, file, { contentType: file.type });
      const coverURL = await getDownloadURL(storageRef);

      await setDoc(
        doc(firestore, "sellerProfiles", user.uid),
        {
          coverURL,
          sellerId: user.uid,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setEditMessage("Capa atualizada.");
    } catch {
      setEditMessage("Nao foi possivel enviar a capa agora.");
    } finally {
      setIsUploadingCover(false);
      event.target.value = "";
    }
  };

  const moveProduct = (productId: string, direction: "up" | "down") => {
    setOrderedProductIds((currentIds) => {
      const currentIndex = currentIds.indexOf(productId);

      if (currentIndex < 0) {
        return currentIds;
      }

      const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

      if (nextIndex < 0 || nextIndex >= currentIds.length) {
        return currentIds;
      }

      const nextIds = [...currentIds];
      [nextIds[currentIndex], nextIds[nextIndex]] = [nextIds[nextIndex], nextIds[currentIndex]];
      return nextIds;
    });
  };

  const saveStore = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user || user.uid !== sellerId) {
      return;
    }

    const storeCategoriesToSave = getUniqueValues(categoriesText.split(/[,\n]/)).slice(0, 8);

    setIsSaving(true);
    setEditMessage("");

    try {
      await setDoc(
        doc(firestore, "sellerProfiles", user.uid),
        {
          displayName: sellerProfile?.displayName || displayName || user.email || "Vendedor Acesse+",
          photoURL: sellerProfile?.photoURL || photoURL || "",
          sellerId: user.uid,
          storeAbout: storeAboutDraft.trim(),
          storeCategories: storeCategoriesToSave,
          storeProductOrder: orderedProductIds,
          storeTitle: storeTitle.trim(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setEditMessage("Loja salva.");
    } catch {
      setEditMessage("Nao foi possivel salvar a loja agora.");
    } finally {
      setIsSaving(false);
    }
  };

  const isLoading = productsLoading || profileLoading;

  if (!sellerId) {
    return (
      <main className="min-h-screen bg-[#f5f6f7] font-['Montserrat',sans-serif] text-[#071735]">
        <AppHeader />
        <section className="mx-auto max-w-[980px] px-4 py-10">
          <div className="rounded-[8px] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <h1 className="text-[24px] leading-[32px]">Loja nao encontrada</h1>
            <p className="mt-2 text-[14px] leading-[22px] text-[#52606d]">Nao encontramos o vendedor informado.</p>
          </div>
        </section>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#f5f6f7] font-['Montserrat',sans-serif] text-[#071735] [&_h1]:m-0 [&_p]:m-0">
        <AppHeader />
        <section className="mx-auto max-w-[980px] px-4 py-10">
          <div className="rounded-[8px] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <h1 className="text-[24px] leading-[32px]">Carregando loja</h1>
            <p className="mt-2 text-[14px] leading-[22px] text-[#52606d]">
              Estamos buscando os produtos e dados publicos deste vendedor.
            </p>
          </div>
        </section>
      </main>
    );
  }

  if (!isLoading && sellerProducts.length === 0) {
    return (
      <main className="min-h-screen bg-[#f5f6f7] font-['Montserrat',sans-serif] text-[#071735] [&_h1]:m-0 [&_p]:m-0">
        <AppHeader />
        <section className="mx-auto max-w-[980px] px-4 py-10">
          <div className="rounded-[8px] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <p className="text-[12px] uppercase tracking-[0.16em] text-[#167307]">Loja do vendedor</p>
            <h1 className="mt-2 text-[26px] leading-[34px]">Esta loja ainda nao tem produtos ativos</h1>
            <p className="mt-2 text-[14px] leading-[22px] text-[#52606d]">
              A pagina da loja aparece no menu do perfil depois que o primeiro produto e cadastrado.
            </p>
            {isOwner ? (
              <Link
                className="mt-5 inline-flex h-10 items-center justify-center rounded-[6px] bg-[#167307] px-4 text-[14px] text-white no-underline"
                to="/produtos/novo"
              >
                Cadastrar primeiro produto
              </Link>
            ) : (
              <Link
                className="mt-5 inline-flex h-10 items-center justify-center rounded-[6px] bg-[#167307] px-4 text-[14px] text-white no-underline"
                to="/buscar"
              >
                Ver outros produtos
              </Link>
            )}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f6f7] font-['Montserrat',sans-serif] text-[#071735] [&_button]:font-[inherit] [&_h1]:m-0 [&_h2]:m-0 [&_h3]:m-0 [&_p]:m-0">
      <AppHeader />

      <section className="bg-white">
        <div className="relative min-h-[230px] overflow-hidden bg-[#174b26]">
          {sellerProfile?.coverURL ? (
            <img className="absolute inset-0 h-full w-full object-cover" alt={`Capa da loja ${sellerName}`} src={sellerProfile.coverURL} />
          ) : (
            <div className="absolute inset-0 bg-[#174b26]">
              {firstProduct ? (
                <img
                  className="absolute bottom-[-32px] right-[5%] h-[270px] max-w-[48%] object-contain opacity-25"
                  alt=""
                  src={firstProduct.image}
                />
              ) : null}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-[#0e2f1a]" />
            </div>
          )}

          <div className="relative mx-auto flex min-h-[230px] w-full max-w-[1180px] items-end px-4 py-5 md:px-6">
            <div className="flex max-w-[520px] items-center gap-4 rounded-[8px] border border-[#e6e8eb] bg-white p-4 shadow-[0_14px_34px_rgba(0,0,0,0.18)]">
              <Avatar name={sellerName} photoURL={sellerPhotoURL} />
              <div className="min-w-0">
                <p className="flex items-center gap-1 text-[12px] leading-[16px] text-[#167307]">
                  <FiCheckCircle size={14} />
                  Loja oficial
                </p>
                <h1 className="mt-1 truncate text-[22px] leading-[28px] text-[#111]">{sellerName}</h1>
                {sellerLocation ? (
                  <p className="mt-1 flex items-center gap-1 text-[12px] leading-[16px] text-[#52606d]">
                    <FiMapPin size={13} />
                    {sellerLocation}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-[#e4e7eb] bg-white">
          <div className="mx-auto flex w-full max-w-[1180px] flex-wrap items-center gap-3 px-4 py-3 md:px-6">
            <button
              className={`h-9 border-0 bg-transparent px-1 text-[14px] ${
                activeCategory === "inicio" ? "border-b-2 border-[#167307] text-[#167307]" : "text-[#52606d]"
              }`}
              onClick={() => setActiveCategory("inicio")}
              type="button"
            >
              Inicio
            </button>
            {storeCategories.slice(0, 5).map((category) => (
              <button
                className={`h-9 border-0 bg-transparent px-1 text-[14px] ${
                  activeCategory === category ? "border-b-2 border-[#167307] text-[#167307]" : "text-[#52606d]"
                }`}
                key={category}
                onClick={() => setActiveCategory(category)}
                type="button"
              >
                {category}
              </button>
            ))}
            <button
              className={`h-9 border-0 bg-transparent px-1 text-[14px] ${
                activeCategory === "todos" ? "border-b-2 border-[#167307] text-[#167307]" : "text-[#52606d]"
              }`}
              onClick={() => setActiveCategory("todos")}
              type="button"
            >
              Todos os produtos
            </button>

            <div className="ml-auto flex flex-wrap items-center gap-3">
              <span className="text-[13px] leading-[17px] text-[#667085]">+{followersCount} seguidores</span>
              <button
                className="flex h-9 items-center justify-center gap-2 rounded-[6px] bg-[#e7f0ff] px-4 text-[13px] text-[#167307] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isOwner}
                onClick={() => void toggleFollow()}
                type="button"
              >
                <FiHeart fill={isFollowing ? "currentColor" : "none"} />
                {isOwner ? "Sua loja" : isFollowing ? "Seguindo" : "Seguir"}
              </button>
              <button
                className="flex h-9 items-center justify-center gap-2 rounded-[6px] bg-white px-3 text-[13px] text-[#167307]"
                onClick={() => void shareStore()}
                type="button"
              >
                <FiShare2 />
                Compartilhar
              </button>
            </div>
          </div>
        </div>
      </section>

      {shareMessage || cartMessage ? (
        <div className="mx-auto mt-4 flex w-full max-w-[1180px] flex-wrap gap-3 px-4 text-[13px] leading-[19px] md:px-6">
          {shareMessage ? <p className="rounded-[6px] bg-[#ecf8e8] px-3 py-2 text-[#167307]">{shareMessage}</p> : null}
          {cartMessage ? <p className="rounded-[6px] bg-[#ecf8e8] px-3 py-2 text-[#167307]">{cartMessage}</p> : null}
        </div>
      ) : null}

      {isOwner && sellerProducts.length > 0 ? (
        <section className="mx-auto mt-6 w-full max-w-[1180px] px-4 md:px-6">
          <div className="rounded-[8px] border border-[#dfe3e8] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[12px] uppercase tracking-[0.14em] text-[#167307]">Painel da loja</p>
                <h2 className="mt-1 text-[20px] leading-[26px] text-[#111]">Editar pagina do vendedor</h2>
              </div>
              <button
                className="flex h-10 items-center gap-2 rounded-[6px] bg-[#167307] px-4 text-[13px] text-white"
                onClick={() => setIsEditOpen((current) => !current)}
                type="button"
              >
                <FiEdit3 />
                {isEditOpen ? "Fechar edicao" : "Editar loja"}
              </button>
            </div>

            {isEditOpen ? (
              <form className="mt-5 grid gap-5 border-t border-[#edf0f2] pt-5" onSubmit={saveStore}>
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
                  <div className="grid gap-4">
                    <label className="grid gap-2">
                      <span className="text-[13px] leading-[17px] text-[#333]">Nome da loja</span>
                      <input
                        className="h-11 rounded-[6px] border border-[#dfe3e8] px-3 text-[14px] outline-none focus:border-[#167307]"
                        onChange={(event) => setStoreTitle(event.target.value)}
                        placeholder="Ex.: Acesse+ Labs"
                        value={storeTitle}
                      />
                    </label>

                    <label className="grid gap-2">
                      <span className="text-[13px] leading-[17px] text-[#333]">Sobre o que se trata a loja</span>
                      <textarea
                        className="min-h-[104px] resize-y rounded-[6px] border border-[#dfe3e8] px-3 py-3 text-[14px] leading-[21px] outline-none focus:border-[#167307]"
                        onChange={(event) => setStoreAboutDraft(event.target.value)}
                        placeholder="Conte o foco da loja, atendimento, produtos e diferenciais."
                        value={storeAboutDraft}
                      />
                    </label>

                    <label className="grid gap-2">
                      <span className="text-[13px] leading-[17px] text-[#333]">Categorias da loja</span>
                      <input
                        className="h-11 rounded-[6px] border border-[#dfe3e8] px-3 text-[14px] outline-none focus:border-[#167307]"
                        onChange={(event) => setCategoriesText(event.target.value)}
                        placeholder="Mobilidade, Tecnologia, Acesso tatil"
                        value={categoriesText}
                      />
                    </label>
                  </div>

                  <div className="rounded-[8px] bg-[#f7faf6] p-4">
                    <p className="flex items-center gap-2 text-[13px] leading-[18px] text-[#111]">
                      <FiImage className="text-[#167307]" />
                      Capa da loja
                    </p>
                    <div className="mt-3 aspect-[16/9] overflow-hidden rounded-[6px] bg-white">
                      {sellerProfile?.coverURL ? (
                        <img className="h-full w-full object-cover" alt="Capa atual da loja" src={sellerProfile.coverURL} />
                      ) : firstProduct ? (
                        <img className="h-full w-full object-contain p-4" alt="" src={firstProduct.image} />
                      ) : null}
                    </div>
                    <label className="mt-3 flex h-10 cursor-pointer items-center justify-center gap-2 rounded-[6px] border border-[#167307] bg-white px-3 text-[13px] text-[#167307]">
                      <FiCamera />
                      {isUploadingCover ? "Enviando..." : "Alterar capa"}
                      <input className="hidden" accept="image/*" disabled={isUploadingCover} onChange={uploadCover} type="file" />
                    </label>
                  </div>
                </div>

                <div className="rounded-[8px] bg-[#f7faf6] p-4">
                  <p className="flex items-center gap-2 text-[13px] leading-[18px] text-[#111]">
                    <FiLayers className="text-[#167307]" />
                    Posicionar produtos na loja
                  </p>
                  <div className="mt-3 grid gap-2">
                    {orderedProductsForEdit.map((product, index) => (
                      <div
                        className="grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-3 rounded-[6px] border border-[#dfe3e8] bg-white p-2"
                        key={product.id}
                      >
                        <img className="h-12 w-12 rounded-[5px] object-contain" alt="" src={product.image} />
                        <div className="min-w-0">
                          <p className="truncate text-[13px] leading-[18px] text-[#111]">{product.name}</p>
                          <p className="mt-1 text-[11px] leading-[14px] text-[#667085]">
                            Posicao {index + 1} - {product.category}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            aria-label="Subir produto"
                            className="flex h-8 w-8 items-center justify-center rounded-[5px] border border-[#dfe3e8] bg-white text-[#167307] disabled:opacity-40"
                            disabled={index === 0}
                            onClick={() => moveProduct(product.id, "up")}
                            type="button"
                          >
                            <FiArrowUp />
                          </button>
                          <button
                            aria-label="Descer produto"
                            className="flex h-8 w-8 items-center justify-center rounded-[5px] border border-[#dfe3e8] bg-white text-[#167307] disabled:opacity-40"
                            disabled={index === orderedProductsForEdit.length - 1}
                            onClick={() => moveProduct(product.id, "down")}
                            type="button"
                          >
                            <FiArrowDown />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  {editMessage ? <p className="text-[13px] leading-[19px] text-[#167307]">{editMessage}</p> : <span />}
                  <button
                    className="flex h-10 items-center gap-2 rounded-[6px] bg-[#167307] px-4 text-[13px] text-white disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isSaving}
                    type="submit"
                  >
                    <FiSave />
                    {isSaving ? "Salvando..." : "Salvar loja"}
                  </button>
                </div>
              </form>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="mx-auto w-full max-w-[1180px] px-4 py-8 md:px-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-[24px] leading-[31px] text-[#111]">
              {activeCategory === "inicio" ? "Relacionado ao ultimo produto que voce visualizou" : activeCategory === "todos" ? "Todos os produtos" : activeCategory}
            </h2>
            <p className="mt-1 text-[13px] leading-[19px] text-[#52606d]">
              {filteredProducts.length} produto(s) disponivel(is) nesta loja.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {(activeCategory === "inicio" ? relatedProducts : filteredProducts).map((product) => (
            <StoreProductCard key={product.id} onAddToCart={(item) => void addProductToCart(item)} product={product} />
          ))}
        </div>
      </section>

      <section className="bg-[#eef1f0] py-8">
        <div className="mx-auto w-full max-w-[1180px] px-4 md:px-6">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <h2 className="text-[24px] leading-[31px] text-[#111]">Frete gratis</h2>
            <button
              className="bg-transparent p-0 text-[13px] leading-[18px] text-[#167307]"
              onClick={() => setActiveCategory("todos")}
              type="button"
            >
              Ver mais
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {sortedProducts.slice(0, 5).map((product) => (
              <StoreProductCard key={product.id} onAddToCart={(item) => void addProductToCart(item)} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1180px] gap-5 px-4 py-8 md:px-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-[8px] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h2 className="text-[20px] leading-[26px] text-[#111]">Sobre a loja</h2>
          <p className="mt-3 whitespace-pre-line text-[14px] leading-[23px] text-[#333]">{storeAboutText}</p>
        </div>
        <aside className="rounded-[8px] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h2 className="text-[18px] leading-[23px] text-[#111]">Resumo do vendedor</h2>
          <div className="mt-4 grid gap-3 text-[13px] leading-[19px] text-[#52606d]">
            <p className="flex items-center gap-2">
              <FiPackage className="shrink-0 text-[#167307]" />
              {sellerProducts.length} produto(s) publicado(s)
            </p>
            <p className="flex items-center gap-2">
              <FiHeart className="shrink-0 text-[#167307]" />
              {followersCount} seguidor(es)
            </p>
            <p className="flex items-center gap-2">
              <FiStar className="shrink-0 text-[#167307]" />
              Atendimento com historico na Acesse+
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
};

export default LojaVendedor;
