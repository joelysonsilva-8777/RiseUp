import { useRef } from "react";
import { Link } from "react-router-dom";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { formatCurrency, type Product } from "../../data/products";
import { useProducts } from "../../hooks/useProducts";

const productSkeletonSlots = Array.from({ length: 6 }, (_, index) => index);
const mobileProductSkeletonSlots = Array.from({ length: 3 }, (_, index) => index);

const ProductCard = ({
  id,
  name,
  image,
  oldPrice,
  category,
  description,
  price,
  city,
  state,
}: Product) => (
  <article className="min-w-0">
    <Link className="block text-[#071735] no-underline" to={`/produto/${id}`}>
      <div className="relative aspect-square w-full overflow-hidden rounded-[5px] bg-white text-[#071735] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <img
          alt={name}
          className="h-full w-full object-contain p-4"
          loading="lazy"
          src={image}
        />
        <span className="absolute left-3 top-3 inline-flex max-w-[calc(100%-24px)] rounded-full bg-[#ecf8e8] px-3 py-1 text-[10px] uppercase leading-[13px] tracking-[0.12em] text-[#167307]">
          {category}
        </span>
      </div>
      <h3 className="mt-3 min-h-[44px] text-[15px] leading-[20px] text-[#071735]">{name}</h3>
      <p className="mt-2 min-h-[36px] text-[12px] leading-[18px] text-[#476155]">{description}</p>
    </Link>
    <div className="mt-4 min-h-[39px]">
      {oldPrice ? (
        <p className="text-[13px] leading-[15px] text-[#8493ad]">{formatCurrency(oldPrice)}</p>
      ) : null}
      <p className="text-[19px] leading-[24px] text-[#071735]">{formatCurrency(price)}</p>
    </div>
    <p className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-[11px] leading-[14px] text-[#0b1020]">
      <span>Hoje, 16:46</span>
      <span>{city ?? "Paulista"} - {state ?? "PE"}</span>
    </p>
  </article>
);

export const ProductCardSkeleton = ({ className = "" }: { className?: string }) => (
  <article aria-hidden="true" className={`min-w-0 ${className}`}>
    <div className="glass-skeleton relative aspect-square w-full rounded-[5px] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="glass-skeleton__shine" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0.28),rgba(255,255,255,0.08))]" />
      <span className="absolute left-3 top-3 h-5 w-20 rounded-full bg-white/55 backdrop-blur-md" />
      <div className="absolute inset-x-4 bottom-4 h-6 rounded-[18px] bg-white/30 backdrop-blur-md" />
    </div>

    <div className="mt-3 space-y-2">
      <div className="h-[18px] w-11/12 rounded-full bg-white/70" />
      <div className="h-[18px] w-8/12 rounded-full bg-white/50" />
      <div className="h-[18px] w-6/12 rounded-full bg-white/45" />
    </div>

    <div className="mt-4 space-y-2">
      <div className="h-[14px] w-16 rounded-full bg-white/35" />
      <div className="h-[24px] w-24 rounded-full bg-white/70" />
    </div>

    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1">
      <div className="h-[14px] w-20 rounded-full bg-white/35" />
      <div className="h-[14px] w-28 rounded-full bg-white/35" />
    </div>
  </article>
);

const MobileProductCarousel = ({ products }: { products: Product[] }) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scrollByAmount = (direction: -1 | 1) => {
    const container = scrollRef.current;

    if (!container) {
      return;
    }

    container.scrollBy({
      left: direction * Math.max(container.clientWidth * 0.82, 240),
      behavior: "smooth",
    });
  };

  return (
    <div className="[@media(min-width:1051px)]:hidden">
      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          aria-label="Ver produtos anteriores"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d7e8d4] bg-white text-[#167307] shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
          onClick={() => scrollByAmount(-1)}
          type="button"
        >
          <FiChevronLeft size={20} />
        </button>
        <p className="text-center text-[12px] leading-[16px] text-[#476155]">
          Deslize ou use as setas para navegar
        </p>
        <button
          aria-label="Ver proximos produtos"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d7e8d4] bg-white text-[#167307] shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
          onClick={() => scrollByAmount(1)}
          type="button"
        >
          <FiChevronRight size={20} />
        </button>
      </div>

      <div
        ref={scrollRef}
        className="mt-4 flex gap-3 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => (
          <div className="w-[min(78vw,300px)] shrink-0 snap-start" key={product.id}>
            <ProductCard {...product} />
          </div>
        ))}
      </div>
    </div>
  );
};

const LoadingMobileProductCarousel = () => (
  <div className="[@media(min-width:1051px)]:hidden">
    <div className="mt-4 flex items-center justify-between gap-3">
      <button
        aria-hidden="true"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d7e8d4] bg-white/80 text-[#167307] shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
        tabIndex={-1}
        type="button"
      >
        <FiChevronLeft size={20} />
      </button>
      <p className="text-center text-[12px] leading-[16px] text-[#476155]">
        Carregando produtos com visual em vidro
      </p>
      <button
        aria-hidden="true"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d7e8d4] bg-white/80 text-[#167307] shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
        tabIndex={-1}
        type="button"
      >
        <FiChevronRight size={20} />
      </button>
    </div>

    <div
      className="mt-4 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      aria-hidden="true"
    >
      {mobileProductSkeletonSlots.map((slot) => (
        <div className="w-[min(78vw,300px)] shrink-0 snap-start" key={slot}>
          <ProductCardSkeleton />
        </div>
      ))}
    </div>
  </div>
);

type ProductsSectionProps = {
  className?: string;
};

const ProductsSection = ({ className = "mt-[70px]" }: ProductsSectionProps) => {
  const { products, loading } = useProducts();
  const visibleProducts = products.slice(0, 6);

  return (
    <section
      aria-busy={loading}
      className={`mx-auto w-[calc(100%-24px)] max-w-[1312px] px-0 sm:w-[calc(100%-70px)] ${className}`}
    >
      <h2 className="text-[23px] leading-[28px] text-[#071735]">
        Tecnologia assistiva em destaque
      </h2>
      {loading ? <LoadingMobileProductCarousel /> : <MobileProductCarousel products={visibleProducts} />}
      <div className="mt-4 hidden grid-cols-6 gap-x-[31px] [@media(min-width:1051px)]:grid">
        {loading
          ? productSkeletonSlots.map((slot) => <ProductCardSkeleton key={slot} />)
          : visibleProducts.map((product) => <ProductCard key={product.id} {...product} />)}
      </div>
    </section>
  );
};

export default ProductsSection;
