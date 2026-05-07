import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import {
  FiCamera,
  FiCheckCircle,
  FiChevronLeft,
  FiCode,
  FiCpu,
  FiDollarSign,
  FiImage,
  FiPackage,
  FiSearch,
  FiSmartphone,
  FiTag,
  FiTool,
  FiUploadCloud,
  FiX,
} from "react-icons/fi";
import { AppHeader } from "../../components/AppHeader";
import { useAuth } from "../../context/AuthContext";
import { slugifyProductName, type Product } from "../../data/products";
import { saveProduct } from "../../hooks/useProducts";
import { firestore, storage } from "../../firebase/firebase";

type ListingGroup = NonNullable<Product["listingGroup"]>;
type ListingCondition = NonNullable<Product["condition"]>;
type WizardStep = "kind" | "search" | "details" | "price";

type ListingGroupOption = {
  description: string;
  icon: ReactNode;
  label: string;
  sample: string;
  value: ListingGroup;
};

type PhotoPreview = {
  file: File;
  id: string;
  url: string;
};

const listingGroups: ListingGroupOption[] = [
  {
    description: "Itens fisicos, pecas, acessorios e materiais de apoio.",
    icon: <FiPackage size={42} />,
    label: "Produtos",
    sample: "Ex.: teclado braille mecanico",
    value: "produtos",
  },
  {
    description: "Software, sensores, interfaces digitais e recursos inteligentes.",
    icon: <FiCpu size={42} />,
    label: "Tecnologia",
    sample: "Ex.: leitor de tela com IA",
    value: "tecnologia",
  },
  {
    description: "Equipamentos assistivos, dispositivos medicos e aparelhos.",
    icon: <FiSmartphone size={42} />,
    label: "Aparelhos",
    sample: "Ex.: cadeira motorizada dobravel",
    value: "aparelhos",
  },
  {
    description: "Anuncios especiais que nao entram nas categorias anteriores.",
    icon: <FiTool size={42} />,
    label: "Outros",
    sample: "Ex.: kit de adaptacao residencial",
    value: "outros",
  },
];

const attributesByGroup: Record<ListingGroup, string[]> = {
  produtos: ["Categoria", "Marca", "Modelo", "Material", "Dimensoes"],
  tecnologia: ["Tipo de tecnologia", "Marca", "Modelo", "Conectividade", "Compatibilidade"],
  aparelhos: ["Tipo de aparelho", "Marca", "Modelo", "Alimentacao", "Capacidade"],
  outros: ["Tipo", "Marca ou responsavel", "Publico indicado", "Principal beneficio", "Disponibilidade"],
};

const tagSuggestionsByGroup: Record<ListingGroup, string[]> = {
  produtos: ["produto assistivo", "acessorio", "uso diario", "inclusao"],
  tecnologia: ["tecnologia assistiva", "sensor", "software", "conectado"],
  aparelhos: ["aparelho assistivo", "mobilidade", "autonomia", "reabilitacao"],
  outros: ["adaptacao", "personalizado", "acessibilidade", "solucao"],
};

const conditionOptions: Array<{ description: string; label: string; value: ListingCondition }> = [
  { description: "Sem uso, na embalagem ou com garantia de novo.", label: "Novo", value: "novo" },
  { description: "Ja utilizado, funcionando e descrito com transparencia.", label: "Usado", value: "usado" },
  { description: "Revisado, higienizado ou restaurado antes da venda.", label: "Recondicionado", value: "recondicionado" },
  { description: "Produto aberto, devolvido ou com embalagem violada.", label: "Caixa aberta", value: "caixa-aberta" },
];

const conditionLabels: Record<ListingCondition, string> = {
  novo: "Novo",
  usado: "Usado",
  recondicionado: "Recondicionado",
  "caixa-aberta": "Caixa aberta",
};

const inputClassName =
  "h-[50px] w-full rounded-[7px] border border-[#cfd3d8] bg-white px-4 text-[15px] leading-[20px] text-[#222] outline-none transition-colors placeholder:text-[#8a8f98] focus:border-[#167307]";
const labelClassName = "mb-2 block text-[13px] leading-[16px] text-[#333]";

const createLocalId = () => window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

const normalizeTag = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .slice(0, 32);

const buildCatalogCode = (value: string) =>
  `ACP${Math.abs(
    value.split("").reduce((total, char) => total + char.charCodeAt(0), 0) * 997
  )
    .toString()
    .slice(0, 9)
    .padStart(9, "0")}`;

const getSelectedGroup = (value: ListingGroup | null) =>
  listingGroups.find((group) => group.value === value) ?? listingGroups[0];

const titleCase = (value: string) =>
  value
    .trim()
    .split(/\s+/)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`)
    .join(" ");

const buildSuggestedAttributes = (group: ListingGroup, keyword: string) => {
  const base = titleCase(keyword);
  const attributes = attributesByGroup[group].reduce<Record<string, string>>((result, attributeName) => {
    result[attributeName] = "";
    return result;
  }, {});

  if (group === "produtos") {
    attributes.Categoria = "Produto assistivo";
    attributes.Marca = "Acesse+";
    attributes.Modelo = base;
  }

  if (group === "tecnologia") {
    attributes["Tipo de tecnologia"] = "Tecnologia assistiva";
    attributes.Marca = "Acesse+";
    attributes.Modelo = base;
    attributes.Conectividade = "Bluetooth / USB-C";
  }

  if (group === "aparelhos") {
    attributes["Tipo de aparelho"] = "Aparelho assistivo";
    attributes.Marca = "Acesse+";
    attributes.Modelo = base;
    attributes.Alimentacao = "Bateria recarregavel";
  }

  if (group === "outros") {
    attributes.Tipo = "Solucao de acessibilidade";
    attributes["Publico indicado"] = "Pessoas com necessidade de apoio assistivo";
    attributes["Principal beneficio"] = base;
  }

  return attributes;
};

const buildSuggestedTags = (group: ListingGroup, keyword: string) => {
  const keywordTags = keyword
    .split(/\s+/)
    .map(normalizeTag)
    .filter((tag) => tag.length > 2);

  return Array.from(new Set([...keywordTags, ...tagSuggestionsByGroup[group]])).slice(0, 8);
};

const buildSuggestedTitle = (group: ListingGroup, keyword: string) => {
  const selectedGroup = getSelectedGroup(group);
  const base = titleCase(keyword);

  return `${base} - ${selectedGroup.label} Acesse+`.slice(0, 80);
};

const buildSuggestedDescription = (
  group: ListingGroup,
  keyword: string,
  attributes: Record<string, string>,
  condition: ListingCondition
) => {
  const selectedGroup = getSelectedGroup(group);
  const filledAttributes = Object.entries(attributes)
    .filter(([, value]) => value.trim())
    .map(([key, value]) => `${key}: ${value}`)
    .join(". ");

  return [
    `${titleCase(keyword)} anunciado na categoria ${selectedGroup.label}.`,
    `Condicao: ${conditionLabels[condition]}.`,
    filledAttributes ? `${filledAttributes}.` : "",
    "Produto indicado para compradores que buscam mais autonomia, conforto e acessibilidade no dia a dia.",
  ]
    .filter(Boolean)
    .join("\n");
};

const StepHeader = ({
  currentStep,
  onBack,
  title,
}: {
  currentStep: 1 | 2 | 3;
  onBack: () => void;
  title: string;
}) => (
  <header className="sticky top-[78px] z-30 border-b border-[#d7dbe0] bg-white/95 shadow-[0_5px_18px_rgba(0,0,0,0.08)] backdrop-blur">
    <div className="mx-auto flex h-[52px] max-w-[760px] items-center justify-between px-4">
      <button
        className="flex items-center gap-1 bg-transparent p-0 text-[15px] leading-[18px] text-[#257aef]"
        onClick={onBack}
        type="button"
      >
        <FiChevronLeft size={19} />
        Anterior
      </button>
      <div className="flex items-center gap-3 text-[15px] leading-[18px] text-[#222]">
        <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#e6e6e6] text-[13px]">
          {currentStep}
        </span>
        <span>{title}</span>
      </div>
      <span className="hidden items-center gap-1 text-[12px] leading-[15px] text-[#8a8f98] sm:flex">
        <FiCheckCircle size={14} />
        Rascunho salvo
      </span>
    </div>
    <div className="h-[4px] bg-[#e5e7eb]">
      <div className="h-full bg-[#167307]" style={{ width: `${(currentStep / 3) * 100}%` }} />
    </div>
  </header>
);

const FormCard = ({
  actions,
  children,
  description,
  title,
}: {
  actions?: ReactNode;
  children: ReactNode;
  description?: string;
  title: string;
}) => (
  <section className="overflow-hidden rounded-[6px] border border-[#dfe3e8] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
    <div className="border-b border-[#e6e8eb] px-8 py-6">
      <h2 className="m-0 text-[18px] leading-[22px] text-[#222]">{title}</h2>
      {description ? <p className="m-0 mt-2 text-[15px] leading-[22px] text-[#777]">{description}</p> : null}
    </div>
    <div className="px-8 py-7">{children}</div>
    {actions ? (
      <div className="flex items-center justify-end gap-4 border-t border-[#e6e8eb] px-8 py-5">{actions}</div>
    ) : null}
  </section>
);

const CadastrarProduto = () => {
  const navigate = useNavigate();
  const { user, displayName, loading, photoURL, profile } = useAuth();
  const [step, setStep] = useState<WizardStep>("kind");
  const [listingGroup, setListingGroup] = useState<ListingGroup | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchError, setSearchError] = useState("");
  const [wipMessage, setWipMessage] = useState("");
  const [attributes, setAttributes] = useState<Record<string, string>>({});
  const [condition, setCondition] = useState<ListingCondition>("usado");
  const [title, setTitle] = useState("");
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const [photoError, setPhotoError] = useState("");
  const [stock, setStock] = useState("1");
  const [sku, setSku] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("PE");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const selectedGroup = getSelectedGroup(listingGroup);
  const canContinueDetails =
    title.trim().length >= 8 &&
    photos.length >= 1 &&
    Number(stock) >= 1 &&
    city.trim().length >= 2 &&
    state.trim().length === 2 &&
    description.trim().length >= 12 &&
    attributesByGroup[selectedGroup.value].every((attributeName) => attributes[attributeName]?.trim());

  const canPublish = canContinueDetails && Number(price) > 0;

  const previewProduct = useMemo(
    () => ({
      attributes,
      category: selectedGroup.label,
      condition,
      description,
      image: photos[0]?.url,
      name: title || buildSuggestedTitle(selectedGroup.value, searchTerm || selectedGroup.label),
      price: Number(price || 0),
      stock: Number(stock || 1),
      tags,
    }),
    [attributes, condition, description, photos, price, searchTerm, selectedGroup, stock, tags, title]
  );

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, navigate, user]);

  useEffect(() => {
    if (!city && profile?.city) {
      setCity(profile.city);
    }

    if ((!state || state === "PE") && profile?.state) {
      setState(profile.state.slice(0, 2).toUpperCase());
    }
  }, [city, profile?.city, profile?.state, state]);

  const goToStep = (nextStep: WizardStep) => {
    setStep(nextStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectGroup = (value: ListingGroup) => {
    setListingGroup(value);
    setSearchTerm("");
    setSearchError("");
    setWipMessage("");
    goToStep("search");
  };

  const handleKeywordSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!listingGroup) {
      return;
    }

    const normalizedTerm = searchTerm.trim();

    if (normalizedTerm.length < 3) {
      setSearchError("Digite pelo menos 3 caracteres para encontrar o produto.");
      return;
    }

    const nextAttributes = buildSuggestedAttributes(listingGroup, normalizedTerm);
    setAttributes(nextAttributes);
    setTags(buildSuggestedTags(listingGroup, normalizedTerm));
    setTitle(buildSuggestedTitle(listingGroup, normalizedTerm));
    setDescription(buildSuggestedDescription(listingGroup, normalizedTerm, nextAttributes, condition));
    setSearchError("");
    goToStep("details");
  };

  const updateAttribute = (attributeName: string, value: string) => {
    setAttributes((current) => ({ ...current, [attributeName]: value }));
  };

  const suggestAttributes = () => {
    if (!listingGroup) {
      return;
    }

    const nextAttributes = buildSuggestedAttributes(listingGroup, searchTerm || title || selectedGroup.label);
    setAttributes((current) => ({
      ...nextAttributes,
      ...Object.fromEntries(Object.entries(current).filter(([, value]) => value.trim())),
    }));
  };

  const suggestTitle = () => {
    if (!listingGroup) {
      return;
    }

    setTitle(buildSuggestedTitle(listingGroup, searchTerm || selectedGroup.label));
  };

  const suggestDescription = () => {
    if (!listingGroup) {
      return;
    }

    setDescription(buildSuggestedDescription(listingGroup, searchTerm || title, attributes, condition));
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []).filter((file) => file.type.startsWith("image/"));
    const slotsAvailable = Math.max(0, 5 - photos.length);
    const acceptedFiles = selectedFiles.slice(0, slotsAvailable);

    if (selectedFiles.length > acceptedFiles.length) {
      setPhotoError("Envie no maximo 5 fotos por anuncio.");
    } else {
      setPhotoError("");
    }

    setPhotos((current) => [
      ...current,
      ...acceptedFiles.map((file) => ({
        file,
        id: createLocalId(),
        url: URL.createObjectURL(file),
      })),
    ]);

    event.target.value = "";
  };

  const removePhoto = (photoId: string) => {
    setPhotos((current) => {
      const photoToRemove = current.find((photo) => photo.id === photoId);

      if (photoToRemove) {
        URL.revokeObjectURL(photoToRemove.url);
      }

      return current.filter((photo) => photo.id !== photoId);
    });
  };

  const addTag = (rawTag = tagInput) => {
    const normalizedTag = normalizeTag(rawTag);

    if (!normalizedTag || tags.includes(normalizedTag)) {
      setTagInput("");
      return;
    }

    setTags((current) => [...current, normalizedTag].slice(0, 12));
    setTagInput("");
  };

  const removeTag = (tagToRemove: string) => {
    setTags((current) => current.filter((tag) => tag !== tagToRemove));
  };

  const handleDetailsSubmit = () => {
    setMessage("");

    if (!canContinueDetails) {
      setErrorMessage("Preencha os dados obrigatorios, envie pelo menos 1 foto e revise a descricao.");
      return;
    }

    setErrorMessage("");
    goToStep("price");
  };

  const uploadPhotos = async (productId: string) => {
    if (!user) {
      return [];
    }

    return Promise.all(
      photos.map(async (photo, index) => {
        const fileName = photo.file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
        const storageRef = ref(storage, `products/${user.uid}/${productId}/${index + 1}-${fileName}`);

        await uploadBytes(storageRef, photo.file, {
          contentType: photo.file.type,
        });

        return getDownloadURL(storageRef);
      })
    );
  };

  const handlePublish = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user || !listingGroup || !canPublish) {
      setErrorMessage("Informe o preco e revise os dados do anuncio.");
      return;
    }

    setSaving(true);
    setMessage("");
    setErrorMessage("");

    try {
      const productId = `${slugifyProductName(title)}-${Date.now()}`;
      const images = await uploadPhotos(productId);

      if (images.length === 0) {
        throw new Error("missing-images");
      }

      const savedProductId = await saveProduct(
        {
          attributes,
          catalogCode: buildCatalogCode(`${listingGroup}-${searchTerm}-${title}`),
          category: selectedGroup.label,
          city,
          condition,
          description: description.trim(),
          featured: false,
          image: images[0],
          images,
          listingGroup,
          name: title.trim(),
          price: Number(price),
          searchTerm: searchTerm.trim(),
          sellerCity: profile?.city ?? city,
          sellerId: user.uid,
          sellerName: displayName || user.email || "Vendedor Acesse+",
          sellerPhotoURL: photoURL,
          sellerState: profile?.state ?? state,
          sku: sku.trim() || undefined,
          state,
          stock: Number(stock),
          tags,
        },
        productId
      );

      await setDoc(
        doc(firestore, "sellerProfiles", user.uid),
        {
          city: profile?.city ?? city,
          displayName: displayName || user.email || "Vendedor Acesse+",
          photoURL,
          sellerId: user.uid,
          state: profile?.state ?? state,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setMessage("Anuncio publicado com sucesso.");
      navigate(`/produto/${savedProductId}`);
    } catch {
      setErrorMessage("Nao foi possivel publicar agora. Confira as regras do Firebase e tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#ededed] font-['Montserrat',sans-serif] text-[#222] [&_button]:font-[inherit] [&_h1]:m-0 [&_h2]:m-0 [&_p]:m-0">
      <AppHeader showNav={false} />

      {step === "kind" ? (
        <section>
          <div className="bg-[#dff5d4] px-4 pb-[112px] pt-[78px]">
            <h1 className="mx-auto max-w-[700px] text-center text-[30px] leading-[46px] text-black">
              Ola! Antes de mais nada,
              <br />
              o que voce vai anunciar?
            </h1>
          </div>

          <div className="mx-auto -mt-[64px] max-w-[760px] px-4">
            <div className="grid gap-5 sm:grid-cols-4">
              {listingGroups.map((group) => (
                <button
                  className="flex min-h-[162px] flex-col items-center justify-center gap-4 rounded-[6px] border border-[#dfe3e8] bg-white px-3 text-center text-[#222] shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-transform hover:-translate-y-1 hover:border-[#167307]"
                  key={group.value}
                  onClick={() => handleSelectGroup(group.value)}
                  type="button"
                >
                  <span className="text-[#167307]">{group.icon}</span>
                  <span className="text-[16px] leading-[20px]">{group.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-7 flex items-start gap-3 text-[12px] leading-[17px] text-[#333]">
              <FiUploadCloud className="mt-1 shrink-0 text-[#167307]" size={19} />
              <p>
                Para enviar varios produtos, use um arquivo separado por enquanto.
                <br />
                O fluxo em massa entra depois do cadastro individual.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {step === "search" ? (
        <>
          <StepHeader currentStep={1} onBack={() => goToStep("kind")} title="Catalogo" />
          <section className="mx-auto max-w-[754px] px-4 pb-24 pt-[72px]">
            <div className="mb-12 flex items-center justify-between gap-8">
              <div>
                <p className="text-[12px] leading-[15px] text-black">Etapa 1 de 3</p>
                <h1 className="mt-3 max-w-[500px] text-[24px] leading-[31px] text-black">
                  Para anunciar mais rapido, procure seu produto no nosso catalogo
                </h1>
              </div>
              <FiImage className="hidden shrink-0 text-[#cfd3d8] sm:block" size={112} />
            </div>

            <form
              className="overflow-hidden rounded-[6px] border border-[#dfe3e8] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
              onSubmit={handleKeywordSubmit}
            >
              <div className="grid gap-2 px-8 pt-9 sm:grid-cols-3">
                <button
                  className="relative flex h-[91px] flex-col items-center justify-center gap-3 rounded-[6px] border-2 border-[#167307] bg-white text-[14px] leading-[18px] text-[#167307]"
                  type="button"
                >
                  <FiSearch size={25} />
                  Por palavras-chave
                </button>
                <button
                  className="relative flex h-[91px] flex-col items-center justify-center gap-3 rounded-[6px] border border-[#bfc4cc] bg-white text-[14px] leading-[18px] text-[#222]"
                  onClick={() => setWipMessage("Busca por foto esta em W.I.P. Use palavras-chave por enquanto.")}
                  type="button"
                >
                  <span className="absolute right-0 top-0 rounded-bl-[6px] bg-[#167307] px-3 py-1 text-[11px] text-white">
                    W.I.P
                  </span>
                  <FiCamera size={25} />
                  Por foto
                </button>
                <button
                  className="relative flex h-[91px] flex-col items-center justify-center gap-3 rounded-[6px] border border-[#bfc4cc] bg-white text-[14px] leading-[18px] text-[#222]"
                  onClick={() => setWipMessage("Busca por codigo esta em W.I.P. Use palavras-chave por enquanto.")}
                  type="button"
                >
                  <span className="absolute right-0 top-0 rounded-bl-[6px] bg-[#167307] px-3 py-1 text-[11px] text-white">
                    W.I.P
                  </span>
                  <FiCode size={25} />
                  Por codigo
                </button>
              </div>

              <div className="px-8 py-9">
                <h2 className="text-[17px] leading-[22px] text-[#222]">
                  Escreva o nome, a marca, o modelo e outras caracteristicas do produto
                </h2>
                <p className="mt-3 text-[15px] leading-[22px] text-[#333]">
                  Quanto mais detalhes voce adicionar, melhores serao os resultados da busca.
                </p>
                <input
                  className="mt-7 h-[52px] w-full rounded-[7px] border-2 border-[#167307] bg-white px-4 text-[15px] outline-none placeholder:text-[#777]"
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder={selectedGroup.sample}
                  value={searchTerm}
                />
                {searchError ? <p className="mt-3 text-[13px] text-[#b42318]">{searchError}</p> : null}
                {wipMessage ? <p className="mt-3 text-[13px] text-[#167307]">{wipMessage}</p> : null}
              </div>

              <div className="flex justify-end border-t border-[#e6e8eb] px-8 py-8">
                <button
                  className="h-[48px] rounded-[6px] bg-[#167307] px-8 text-[15px] leading-[20px] text-white disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={searchTerm.trim().length < 3}
                  type="submit"
                >
                  Buscar
                </button>
              </div>
            </form>
          </section>
        </>
      ) : null}

      {step === "details" ? (
        <>
          <StepHeader currentStep={2} onBack={() => goToStep("search")} title="Dados do produto" />
          <section className="mx-auto max-w-[752px] px-4 pb-24 pt-[40px]">
            <div className="mb-10 flex items-center justify-between gap-8">
              <div>
                <p className="text-[12px] leading-[15px] text-black">Etapa 2 de 3</p>
                <h1 className="mt-3 text-[24px] leading-[31px] text-black">Preencha os dados do produto</h1>
              </div>
              <FiPackage className="hidden shrink-0 text-[#cfd3d8] sm:block" size={108} />
            </div>

            <div className="grid gap-5">
              <FormCard
                description="Este e o produto que voce iniciou no nosso catalogo."
                title="Produto de catalogo"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-[62px] w-[62px] items-center justify-center bg-[#ecf8e8] text-[#167307]">
                    {selectedGroup.icon}
                  </div>
                  <div>
                    <p className="text-[13px] leading-[16px] text-[#777]">
                      Codigo do catalogo: {buildCatalogCode(`${selectedGroup.value}-${searchTerm}`)}
                    </p>
                    <p className="mt-2 text-[17px] leading-[22px] text-[#222]">
                      {buildSuggestedTitle(selectedGroup.value, searchTerm || selectedGroup.label)}
                    </p>
                  </div>
                </div>
              </FormCard>

              <FormCard
                description="Preencha dados que ajudem o comprador a comparar e encontrar seu anuncio."
                title="Caracteristicas principais"
              >
                <div className="mb-8 rounded-[6px] border-l-4 border-[#167307] bg-[#f5f7f8] px-4 py-4 text-[13px] leading-[20px] text-[#333]">
                  Voce pode usar a caixa, etiqueta ou manual do produto para verificar as informacoes.
                </div>
                <div className="mb-7 flex flex-wrap gap-3">
                  <button
                    className="flex h-10 items-center gap-2 rounded-[5px] bg-[#167307] px-4 text-[14px] text-white"
                    onClick={suggestAttributes}
                    type="button"
                  >
                    <FiCheckCircle />
                    Sugerir caracteristicas
                  </button>
                  <button
                    className="h-10 bg-transparent px-2 text-[14px] text-[#257aef]"
                    onClick={() => setAttributes({})}
                    type="button"
                  >
                    Desfazer sugestoes
                  </button>
                </div>
                <div className="grid gap-7 sm:grid-cols-2">
                  {attributesByGroup[selectedGroup.value].map((attributeName) => (
                    <label key={attributeName}>
                      <span className={labelClassName}>{attributeName} (obrigatorio)</span>
                      <input
                        className={inputClassName}
                        onChange={(event) => updateAttribute(attributeName, event.target.value)}
                        value={attributes[attributeName] ?? ""}
                      />
                    </label>
                  ))}
                </div>
                <div className="mt-7">
                  <span className={labelClassName}>Tags do anuncio</span>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <button
                        className="flex h-8 items-center gap-2 rounded-full border border-[#cfd3d8] bg-white px-3 text-[13px] text-[#222]"
                        key={tag}
                        onClick={() => removeTag(tag)}
                        type="button"
                      >
                        {tag}
                        <FiX size={14} />
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_120px]">
                    <input
                      className={inputClassName}
                      onChange={(event) => setTagInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addTag();
                        }
                      }}
                      placeholder="Adicionar tag"
                      value={tagInput}
                    />
                    <button
                      className="h-[50px] rounded-[6px] bg-[#ecf8e8] px-4 text-[14px] text-[#167307]"
                      onClick={() => addTag()}
                      type="button"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              </FormCard>

              <FormCard description="Informe as condicoes do seu produto." title="Condicao">
                <div className="mb-7 rounded-[6px] border-l-4 border-[#167307] bg-[#f5f7f8] px-4 py-4 text-[13px] leading-[20px] text-[#333]">
                  Seja transparente: isso reduz reclamacoes e aumenta a confianca no anuncio.
                </div>
                <div className="grid gap-4">
                  {conditionOptions.map((option) => (
                    <label className="flex cursor-pointer items-start gap-3" key={option.value}>
                      <input
                        checked={condition === option.value}
                        className="mt-1 h-4 w-4 accent-[#167307]"
                        name="condition"
                        onChange={() => setCondition(option.value)}
                        type="radio"
                      />
                      <span>
                        <span className="block text-[16px] leading-[21px] text-[#222]">{option.label}</span>
                        <span className="block text-[13px] leading-[19px] text-[#777]">{option.description}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </FormCard>

              <FormCard
                description="Informe qual e o produto, marca, modelo e caracteristicas principais."
                title="Titulo"
              >
                <div className="mb-6 rounded-[6px] border-l-4 border-[#167307] bg-[#f5f7f8] px-4 py-4 text-[13px] leading-[20px] text-[#333]">
                  Nao inclua dados de contato ou condicoes de venda no titulo.
                </div>
                <div className="relative">
                  <input
                    className={`${inputClassName} pr-[156px]`}
                    maxLength={80}
                    onChange={(event) => setTitle(event.target.value)}
                    value={title}
                  />
                  <button
                    className="absolute right-2 top-2 flex h-[34px] items-center gap-2 rounded-[5px] bg-transparent px-3 text-[13px] text-[#257aef]"
                    onClick={suggestTitle}
                    type="button"
                  >
                    <FiCheckCircle />
                    Sugerir titulo
                  </button>
                </div>
                <p className="mt-2 text-right text-[12px] text-[#777]">{title.length} / 80</p>
              </FormCard>

              <FormCard description="Envie boas fotos para que o produto tenha destaque." title="Fotos">
                <div className="mb-6 rounded-[6px] border-l-4 border-[#167307] bg-[#f5f7f8] px-4 py-4 text-[13px] leading-[20px] text-[#333]">
                  Envie de 1 a 5 fotos. Use fundo limpo, produto centralizado e boa iluminacao.
                </div>
                <label className="flex min-h-[108px] cursor-pointer flex-col items-center justify-center rounded-[6px] border-2 border-dashed border-[#167307] bg-white px-4 py-5 text-center text-[14px] leading-[20px] text-[#333]">
                  <FiUploadCloud className="mb-2 text-[#167307]" size={26} />
                  <span>
                    <strong className="text-[#167307]">Selecionar</strong> ou arrastar os arquivos aqui
                  </span>
                  <span className="mt-1 text-[12px] text-[#777]">JPG, JPEG, PNG ou WEBP. Minimo 1 e maximo 5 fotos.</span>
                  <input className="hidden" accept="image/*" multiple onChange={handlePhotoChange} type="file" />
                </label>
                {photoError ? <p className="mt-3 text-[13px] text-[#b42318]">{photoError}</p> : null}
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
                  {photos.map((photo, index) => (
                    <div className="relative aspect-square rounded-[6px] border border-[#dfe3e8] bg-[#f7faf6]" key={photo.id}>
                      <img className="h-full w-full object-contain p-2" alt={`Foto ${index + 1}`} src={photo.url} />
                      <button
                        aria-label="Remover foto"
                        className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#b42318] shadow"
                        onClick={() => removePhoto(photo.id)}
                        type="button"
                      >
                        <FiX size={15} />
                      </button>
                      {index === 0 ? (
                        <span className="absolute bottom-1 left-1 rounded-[4px] bg-[#167307] px-2 py-1 text-[10px] text-white">
                          Principal
                        </span>
                      ) : null}
                    </div>
                  ))}
                </div>
              </FormCard>

              <FormCard
                description="Informe quantas unidades voce colocou a venda e um codigo interno se quiser."
                title="Estoque no deposito e codigo de identificacao (SKU)"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <label>
                    <span className={labelClassName}>Estoque no deposito</span>
                    <input
                      className={inputClassName}
                      min="1"
                      onChange={(event) => setStock(event.target.value)}
                      type="number"
                      value={stock}
                    />
                  </label>
                  <label>
                    <span className={labelClassName}>Codigo de identificacao (SKU) | Opcional</span>
                    <input className={inputClassName} onChange={(event) => setSku(event.target.value)} value={sku} />
                  </label>
                  <label>
                    <span className={labelClassName}>Cidade do produto</span>
                    <input className={inputClassName} onChange={(event) => setCity(event.target.value)} value={city} />
                  </label>
                  <label>
                    <span className={labelClassName}>UF</span>
                    <input
                      className={inputClassName}
                      maxLength={2}
                      onChange={(event) => setState(event.target.value.toUpperCase())}
                      value={state}
                    />
                  </label>
                </div>
              </FormCard>

              <FormCard description="Detalhe as principais caracteristicas do seu produto." title="Descricao do produto">
                <div className="mb-6 rounded-[6px] border-l-4 border-[#167307] bg-[#f5f7f8] px-4 py-4 text-[13px] leading-[20px] text-[#333]">
                  Evite dados de contato. Use este espaco para explicar medidas, estado, conteudo da caixa e cuidados.
                </div>
                <div className="relative">
                  <textarea
                    className="min-h-[190px] w-full resize-y rounded-[7px] border border-[#cfd3d8] bg-white px-4 py-4 pr-[165px] text-[15px] leading-[22px] text-[#222] outline-none focus:border-[#167307]"
                    maxLength={5000}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Digite mais informacoes para os compradores."
                    value={description}
                  />
                  <button
                    className="absolute right-3 top-3 flex h-[34px] items-center gap-2 rounded-[5px] bg-transparent px-3 text-[13px] text-[#257aef]"
                    onClick={suggestDescription}
                    type="button"
                  >
                    <FiCheckCircle />
                    Sugerir descricao
                  </button>
                </div>
                <p className="mt-2 text-right text-[12px] text-[#777]">{description.length} / 5000</p>
              </FormCard>

              {message ? <p className="text-[13px] text-[#167307]">{message}</p> : null}
              {errorMessage ? <p className="text-[13px] text-[#b42318]">{errorMessage}</p> : null}

              <div className="flex justify-end gap-4">
                <button
                  className="h-11 rounded-[6px] bg-transparent px-5 text-[15px] text-[#777]"
                  onClick={() => goToStep("search")}
                  type="button"
                >
                  Cancelar
                </button>
                <button
                  className="h-11 rounded-[6px] bg-[#167307] px-7 text-[15px] text-white disabled:cursor-not-allowed disabled:bg-[#d9d9d9] disabled:text-[#999]"
                  disabled={!canContinueDetails}
                  onClick={handleDetailsSubmit}
                  type="button"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </section>
        </>
      ) : null}

      {step === "price" ? (
        <>
          <StepHeader currentStep={3} onBack={() => goToStep("details")} title="Condicoes de venda" />
          <form className="mx-auto max-w-[752px] px-4 pb-24 pt-[52px]" onSubmit={handlePublish}>
            <div className="mb-12 flex items-center justify-between gap-8">
              <div>
                <p className="text-[12px] leading-[15px] text-black">Etapa 3 de 3</p>
                <h1 className="mt-3 max-w-[520px] text-[24px] leading-[31px] text-black">
                  Para concluir, vamos definir as condicoes de venda
                </h1>
              </div>
              <FiDollarSign className="hidden shrink-0 text-[#cfd3d8] sm:block" size={108} />
            </div>

            <FormCard
              actions={
                <>
                  <button
                    className="h-11 rounded-[6px] bg-transparent px-5 text-[15px] text-[#777]"
                    onClick={() => goToStep("details")}
                    type="button"
                  >
                    Cancelar
                  </button>
                  <button
                    className="h-11 rounded-[6px] bg-[#167307] px-7 text-[15px] text-white disabled:cursor-not-allowed disabled:bg-[#d9d9d9] disabled:text-[#999]"
                    disabled={!canPublish || saving}
                    type="submit"
                  >
                    {saving ? "Publicando..." : "Anunciar"}
                  </button>
                </>
              }
              description="Indique o preco do produto que deseja vender."
              title="Preco"
            >
              <label className="block max-w-[262px]">
                <span className={labelClassName}>Preco de venda</span>
                <div className="grid h-[50px] grid-cols-[45px_1fr] rounded-[7px] border border-[#cfd3d8] bg-white">
                  <span className="flex items-center justify-center text-[15px] text-[#777]">R$</span>
                  <input
                    className="min-w-0 border-0 bg-transparent pr-4 text-[15px] text-[#222] outline-none"
                    min="1"
                    onChange={(event) => setPrice(event.target.value)}
                    step="0.01"
                    type="number"
                    value={price}
                  />
                </div>
              </label>

              <div className="my-8 h-px bg-[#e6e8eb]" />

              <div className="flex items-start gap-3 text-[13px] leading-[20px] text-[#333]">
                <FiTag className="mt-1 shrink-0 text-[#167307]" size={20} />
                <p>
                  Voce pode ajustar o preco depois. O anuncio aparece na busca com as tags e caracteristicas
                  preenchidas na etapa anterior.
                </p>
              </div>

              <aside className="mt-8 rounded-[6px] border border-[#dfe3e8] bg-[#f8fafc] p-5">
                <h2 className="text-[16px] leading-[20px] text-[#222]">Resumo do anuncio</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-[96px_1fr]">
                  <div className="aspect-square rounded-[6px] bg-white">
                    {previewProduct.image ? (
                      <img className="h-full w-full object-contain p-2" alt="" src={previewProduct.image} />
                    ) : null}
                  </div>
                  <div>
                    <p className="text-[15px] leading-[21px] text-[#222]">{previewProduct.name}</p>
                    <p className="mt-2 text-[13px] leading-[19px] text-[#777]">
                      {previewProduct.category} - {conditionLabels[previewProduct.condition]}
                    </p>
                    <p className="mt-2 text-[13px] leading-[19px] text-[#777]">
                      Estoque: {previewProduct.stock} unidade(s)
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {previewProduct.tags.slice(0, 5).map((tag) => (
                        <span className="rounded-full bg-[#ecf8e8] px-3 py-1 text-[11px] text-[#167307]" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>

              {errorMessage ? <p className="mt-4 text-[13px] text-[#b42318]">{errorMessage}</p> : null}
            </FormCard>
          </form>
        </>
      ) : null}
    </main>
  );
};

export default CadastrarProduto;
