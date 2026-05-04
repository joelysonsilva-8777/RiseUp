import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { FiSave, FiUploadCloud } from "react-icons/fi";
import { AppHeader } from "../../components/AppHeader";
import { useAuth } from "../../context/AuthContext";
import { defaultProducts, slugifyProductName } from "../../data/products";
import { saveProduct, seedDefaultProducts } from "../../hooks/useProducts";
import { storage } from "../../firebase/firebase";

const inputClassName =
  "w-full border-0 border-b border-[#d6d9dc] bg-transparent px-0 py-3 text-[14px] leading-[20px] text-[#071735] outline-none placeholder:text-[#8b94a3] focus:border-[#167307]";
const labelClassName = "mb-2 block text-[12px] font-medium uppercase tracking-[0.16em] text-[#52606d]";

const CadastrarProduto = () => {
  const navigate = useNavigate();
  const { user, displayName, loading } = useAuth();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [stock, setStock] = useState("1");
  const [city, setCity] = useState("");
  const [state, setState] = useState("PE");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(defaultProducts[0].image);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, navigate, user]);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    setImageFile(file);

    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      return;
    }

    setSaving(true);
    setMessage("");
    setErrorMessage("");

    try {
      let image = previewUrl.startsWith("blob:") ? defaultProducts[0].image : previewUrl;
      const productId = `${slugifyProductName(name)}-${Date.now()}`;

      if (imageFile) {
        const fileName = imageFile.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
        const storageRef = ref(storage, `products/${user.uid}/${productId}-${fileName}`);
        await uploadBytes(storageRef, imageFile, {
          contentType: imageFile.type,
        });
        image = await getDownloadURL(storageRef);
      }

      const savedProductId = await saveProduct(
        {
          name,
          category,
          description,
          image,
          price: Number(price),
          oldPrice: oldPrice ? Number(oldPrice) : undefined,
          sellerId: user.uid,
          sellerName: displayName || user.email || "Vendedor Acesse+",
          city,
          state,
          stock: Number(stock),
          featured: false,
        },
        productId
      );

      setMessage("Produto cadastrado com sucesso.");
      navigate(`/produto/${savedProductId}`);
    } catch {
      setErrorMessage("Nao foi possivel cadastrar o produto agora. Confira as regras do Firebase e tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleSeedProducts = async () => {
    if (!user) {
      return;
    }

    setSeeding(true);
    setMessage("");
    setErrorMessage("");

    try {
      await seedDefaultProducts(user.uid);
      setMessage("Produtos de teste enviados para o Firebase.");
    } catch {
      setErrorMessage("Nao foi possivel enviar os produtos de teste. Verifique as regras do Firestore.");
    } finally {
      setSeeding(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#f5f6f7] font-['Montserrat',sans-serif] text-[#071735]">
      <AppHeader />

      <section className="mx-auto w-full max-w-[1120px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="border-b border-[#dfe3e8] pb-6">
          <p className="text-[12px] uppercase tracking-[0.2em] text-[#687280]">Minha loja</p>
          <h1 className="mt-3 text-[30px] font-semibold leading-[36px] text-[#071735]">
            Cadastrar produto
          </h1>
          <p className="mt-2 max-w-[720px] text-[15px] leading-[24px] text-[#52606d]">
            Preencha os dados principais. A imagem e o produto ficam salvos no Firebase para aparecerem na vitrine e na busca.
          </p>
        </div>

        <form className="mt-8 grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]" onSubmit={handleSubmit}>
          <aside className="border border-[#dfe3e8] bg-white p-6">
            <div className="aspect-square w-full bg-[#f7faf6]">
              <img className="h-full w-full object-contain p-5" alt="Previa do produto" src={previewUrl} />
            </div>
            <label className="mt-5 flex h-11 cursor-pointer items-center justify-center gap-2 border border-[#dfe3e8] bg-white px-4 text-[14px] text-[#167307] transition-colors hover:border-[#167307]">
              <FiUploadCloud />
              Enviar foto
              <input className="hidden" accept="image/*" onChange={handleImageChange} type="file" />
            </label>
            <button
              className="mt-3 h-11 w-full border border-[#dfe3e8] bg-[#f8fafc] px-4 text-[13px] text-[#071735] transition-colors hover:border-[#167307] disabled:cursor-not-allowed disabled:opacity-70"
              disabled={seeding}
              onClick={() => {
                void handleSeedProducts();
              }}
              type="button"
            >
              {seeding ? "Enviando testes..." : "Popular produtos de teste"}
            </button>
          </aside>

          <section className="border border-[#dfe3e8] bg-white p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <label>
                <span className={labelClassName}>Nome</span>
                <input className={inputClassName} onChange={(event) => setName(event.target.value)} required value={name} />
              </label>
              <label>
                <span className={labelClassName}>Categoria</span>
                <input className={inputClassName} onChange={(event) => setCategory(event.target.value)} required value={category} />
              </label>
              <label>
                <span className={labelClassName}>Preco</span>
                <input className={inputClassName} min="1" onChange={(event) => setPrice(event.target.value)} required type="number" value={price} />
              </label>
              <label>
                <span className={labelClassName}>Preco antigo</span>
                <input className={inputClassName} min="0" onChange={(event) => setOldPrice(event.target.value)} type="number" value={oldPrice} />
              </label>
              <label>
                <span className={labelClassName}>Estoque</span>
                <input className={inputClassName} min="1" onChange={(event) => setStock(event.target.value)} required type="number" value={stock} />
              </label>
              <label>
                <span className={labelClassName}>Estado</span>
                <input className={inputClassName} maxLength={2} onChange={(event) => setState(event.target.value.toUpperCase())} value={state} />
              </label>
            </div>

            <label className="mt-6 block">
              <span className={labelClassName}>Cidade</span>
              <input className={inputClassName} onChange={(event) => setCity(event.target.value)} placeholder="Paulista" value={city} />
            </label>

            <label className="mt-6 block">
              <span className={labelClassName}>Descricao</span>
              <textarea
                className={`${inputClassName} min-h-[120px] resize-y`}
                onChange={(event) => setDescription(event.target.value)}
                required
                value={description}
              />
            </label>

            {message ? <p className="mt-4 text-[13px] text-[#167307]">{message}</p> : null}
            {errorMessage ? <p className="mt-4 text-[13px] text-[#b42318]">{errorMessage}</p> : null}

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                className="inline-flex h-12 items-center gap-2 border-0 bg-[#167307] px-5 text-[14px] font-medium text-white transition-colors hover:bg-[#125d05] disabled:cursor-not-allowed disabled:opacity-70"
                disabled={saving}
                type="submit"
              >
                <FiSave />
                {saving ? "Salvando..." : "Cadastrar produto"}
              </button>
              <button
                className="h-12 border border-[#dfe3e8] bg-white px-5 text-[14px] font-medium text-[#071735] transition-colors hover:border-[#167307] hover:text-[#167307]"
                onClick={() => navigate("/perfil")}
                type="button"
              >
                Voltar ao perfil
              </button>
            </div>
          </section>
        </form>
      </section>
    </main>
  );
};

export default CadastrarProduto;
