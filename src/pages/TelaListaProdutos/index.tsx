import { useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { AppHeader } from "../../components/AppHeader";
import FooterSection from "../../components/inicial/FooterSection";
import { productsDestaque, productsOfertas } from "../../data/products";
import type { Product } from "../../data/products";

// Mock unificado — quando vier API, substitui aqui
const todosOsProdutos: (Product & { categoria: string })[] = [
  ...productsDestaque.map((p) => ({ ...p, categoria: p.category })),
  ...productsOfertas.map((p) => ({ ...p, categoria: p.category })),
];

const ProductCard = ({ id, name, image, oldPrice, category, description, price }: Product) => (
  <Link
    to={`/produto?id=${id}`}
    className="min-w-0 cursor-pointer group no-underline"
  >
    <div className="relative aspect-square w-full overflow-hidden rounded-[5px] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition-shadow duration-200 group-hover:shadow-[0_4px_12px_rgba(22,115,7,0.15)]">
      <img alt={name} className="h-full w-full object-contain p-4" loading="lazy" src={image} />
      <span className="absolute left-3 top-3 inline-flex max-w-[calc(100%-24px)] rounded-full bg-[#ecf8e8] px-3 py-1 text-[10px] uppercase leading-[13px] tracking-[0.12em] text-[#167307]">
        {category}
      </span>
    </div>
    <h3 className="mt-3 text-[15px] leading-[20px] text-[#071735] group-hover:text-[#167307] transition-colors">{name}</h3>
    <p className="mt-2 text-[12px] leading-[18px] text-[#476155]">{description}</p>
    <div className="mt-4">
      {oldPrice && <p className="text-[13px] leading-[15px] text-[#8493ad]">{oldPrice}</p>}
      <p className="text-[19px] leading-[24px] text-[#071735]">{price}</p>
    </div>
    <p className="mt-4 flex flex-wrap gap-x-6 text-[11px] leading-[14px] text-[#0b1020]">
      <span>Hoje, 16:46</span>
      <span>Paulista - PE</span>
    </p>
  </Link>
);

const TelaListaProdutos = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoriaAtiva = searchParams.get("categoria") ?? "";

  // Lista de categorias únicas para o filtro lateral
  const categorias = useMemo(() => {
    const set = new Set(todosOsProdutos.map((p) => p.categoria));
    return Array.from(set);
  }, []);

  // Filtra produtos pela categoria ativa
  const produtosFiltrados = useMemo(() => {
    if (!categoriaAtiva) return todosOsProdutos;
    return todosOsProdutos.filter(
      (p) => p.categoria.toLowerCase() === categoriaAtiva.toLowerCase()
    );
  }, [categoriaAtiva]);

  const handleCategoria = (cat: string) => {
    setSearchParams(cat ? { categoria: cat } : {});
  };

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#f3f3f3] font-['Montserrat',sans-serif] text-[#071735] [&_h1]:m-0 [&_h2]:m-0 [&_h3]:m-0 [&_p]:m-0">
      <AppHeader />

      <div className="mx-auto w-[calc(100%-24px)] max-w-[1312px] sm:w-[calc(100%-70px)]">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 py-5 text-[13px] text-[#476155]">
          <Link to="/" className="text-[#167307] no-underline hover:underline">Início</Link>
          <span>/</span>
          <span>{categoriaAtiva || "Todos os produtos"}</span>
        </nav>

        <div className="flex gap-8 pb-[60px]">

          {/* ── Filtro lateral ── */}
          <aside className="hidden w-[220px] shrink-0 lg:block">
            <div className="sticky top-[90px] rounded-[8px] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <h2 className="text-[15px] font-semibold text-[#071735]">Categorias</h2>
              <ul className="mt-4 space-y-1">
                <li>
                  <button
                    onClick={() => handleCategoria("")}
                    className={`w-full rounded-[5px] px-3 py-2 text-left text-[13px] transition-colors ${
                      !categoriaAtiva
                        ? "bg-[#ecf8e8] font-semibold text-[#167307]"
                        : "text-[#476155] hover:bg-[#f5f5f5]"
                    }`}
                    type="button"
                  >
                    Todos
                  </button>
                </li>
                {categorias.map((cat) => (
                  <li key={cat}>
                    <button
                      onClick={() => handleCategoria(cat)}
                      className={`w-full rounded-[5px] px-3 py-2 text-left text-[13px] transition-colors ${
                        categoriaAtiva === cat
                          ? "bg-[#ecf8e8] font-semibold text-[#167307]"
                          : "text-[#476155] hover:bg-[#f5f5f5]"
                      }`}
                      type="button"
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* ── Conteúdo principal ── */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <h1 className="text-[20px] leading-[26px] text-[#071735]">
                {categoriaAtiva || "Todos os produtos"}
              </h1>
              <span className="text-[13px] text-[#476155]">
                {produtosFiltrados.length} produto{produtosFiltrados.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Filtro mobile (chips) */}
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2 lg:hidden [scrollbar-width:none]">
              <button
                onClick={() => handleCategoria("")}
                className={`shrink-0 rounded-full border px-4 py-1.5 text-[12px] transition-colors ${
                  !categoriaAtiva
                    ? "border-[#167307] bg-[#167307] text-white"
                    : "border-[#d7e8d4] bg-white text-[#476155]"
                }`}
                type="button"
              >
                Todos
              </button>
              {categorias.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoria(cat)}
                  className={`shrink-0 rounded-full border px-4 py-1.5 text-[12px] transition-colors ${
                    categoriaAtiva === cat
                      ? "border-[#167307] bg-[#167307] text-white"
                      : "border-[#d7e8d4] bg-white text-[#476155]"
                  }`}
                  type="button"
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Grid de produtos */}
            {produtosFiltrados.length > 0 ? (
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {produtosFiltrados.map((product, index) => (
                  <ProductCard key={`${product.name}-${index}`} {...product} />
                ))}
              </div>
            ) : (
              <div className="mt-20 flex flex-col items-center gap-3 text-center">
                <p className="text-[18px] text-[#071735]">Nenhum produto encontrado</p>
                <p className="text-[14px] text-[#476155]">Tente selecionar outra categoria</p>
                <button
                  onClick={() => handleCategoria("")}
                  className="mt-2 rounded-[5px] bg-[#167307] px-6 py-2 text-[13px] text-white"
                  type="button"
                >
                  Ver todos
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <FooterSection />
    </main>
  );
};

export default TelaListaProdutos;