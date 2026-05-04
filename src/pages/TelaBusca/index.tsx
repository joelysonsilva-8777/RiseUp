import { Link, useSearchParams } from "react-router-dom";
import { AppHeader } from "../../components/AppHeader";
import { useCart } from "../../context/CartContext";
import { formatCurrency } from "../../data/products";
import { useProducts } from "../../hooks/useProducts";

const TelaBusca = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const { filteredProducts, loading, usingFallback } = useProducts(query);
  const { addItem } = useCart();

  return (
    <main className="min-h-screen bg-[#f3f3f3] font-['Montserrat',sans-serif] text-[#071735] [&_h1]:m-0 [&_h2]:m-0 [&_h3]:m-0 [&_p]:m-0">
      <AppHeader />

      <section className="mx-auto w-full max-w-[1312px] px-4 py-8 sm:px-8">
        <div className="border-b border-[#dfe3e8] pb-5">
          <p className="text-[12px] uppercase tracking-[0.18em] text-[#52606d]">Produtos</p>
          <h1 className="mt-2 text-[30px] leading-[38px] text-[#071735]">
            {query ? `Resultado para "${query}"` : "Todos os produtos"}
          </h1>
          <p className="mt-2 text-[14px] leading-[22px] text-[#52606d]">
            {loading ? "Carregando produtos..." : `${filteredProducts.length} produto(s) encontrado(s).`}
            {usingFallback ? " Usando produtos de teste ate o Firebase receber cadastros." : ""}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <article className="border border-[#dfe3e8] bg-white p-4" key={product.id}>
              <Link className="block text-[#071735] no-underline" to={`/produto/${product.id}`}>
                <div className="relative aspect-square bg-[#f7faf6]">
                  <img
                    alt={product.name}
                    className="h-full w-full object-contain p-5"
                    loading="lazy"
                    src={product.image}
                  />
                  <span className="absolute left-3 top-3 bg-[#ecf8e8] px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-[#167307]">
                    {product.category}
                  </span>
                </div>
                <h2 className="mt-4 min-h-[48px] text-[16px] leading-[22px]">{product.name}</h2>
                <p className="mt-2 min-h-[42px] text-[12px] leading-[18px] text-[#52606d]">
                  {product.description}
                </p>
              </Link>

              <div className="mt-4">
                {product.oldPrice ? (
                  <p className="text-[13px] leading-[16px] text-[#8493ad]">{formatCurrency(product.oldPrice)}</p>
                ) : null}
                <p className="text-[21px] leading-[28px] text-[#071735]">{formatCurrency(product.price)}</p>
                <p className="mt-2 text-[11px] leading-[14px] text-[#355e3a]">
                  {product.city ?? "Paulista"} - {product.state ?? "PE"}
                </p>
              </div>

              <button
                className="mt-4 h-10 w-full border-0 bg-[#167307] px-4 text-[13px] text-white transition-colors hover:bg-[#125d05]"
                onClick={() => {
                  void addItem(product, 1);
                }}
                type="button"
              >
                Adicionar ao carrinho
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};

export default TelaBusca;
