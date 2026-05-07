import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import { formatCurrency, type Product } from "../../data/products";
import { useProducts } from "../../hooks/useProducts";

const productSkeletonSlots = Array.from({ length: 6 }, (_, index) => index);
const mobileProductSkeletonSlots = Array.from({ length: 3 }, (_, index) => index);

const getPriceParts = (price: number) => {
  const [integerPart, centsPart] = price.toFixed(2).split(".");

  return {
    cents: centsPart,
    integer: Number(integerPart).toLocaleString("pt-BR"),
  };
};

const getDiscountPercent = (price: number, oldPrice?: number) => {
  if (!oldPrice || oldPrice <= price) {
    return 0;
  }

  return Math.round(((oldPrice - price) / oldPrice) * 100);
};

const getInstallmentCount = (price: number) => {
  if (price >= 10000) {
    return 10;
  }

  if (price >= 2500) {
    return 6;
  }

  return 4;
};

const ProductPrice = ({ oldPrice, price }: Pick<Product, "oldPrice" | "price">) => {
  const { cents, integer } = getPriceParts(price);
  const discountPercent = getDiscountPercent(price, oldPrice);

  return (
    <div className="mt-2">
      {oldPrice ? (
        <p className="text-[11px] leading-[13px] text-[#737373] line-through">{formatCurrency(oldPrice)}</p>
      ) : null}
      <p className="flex items-start gap-1 text-[#222]">
        <span className="pt-[3px] text-[15px] leading-[18px]">R$</span>
        <span className="text-[23px] font-normal leading-[27px]">{integer}</span>
        <span className="pt-[2px] text-[12px] leading-[14px]">{cents}</span>
        {discountPercent ? (
          <span className="ml-1 mt-[5px] rounded-[3px] bg-[#e5f5ed] px-1 text-[12px] leading-[16px] text-[#00a650]">
            {discountPercent}% OFF
          </span>
        ) : null}
      </p>
    </div>
  );
};

const ProductBenefits = ({ price }: Pick<Product, "price">) => {
  const installmentCount = getInstallmentCount(price);

  return (
    <div className="mt-1 space-y-1">
      <p className="text-[12px] font-medium leading-[16px] text-[#00a650]">
        {installmentCount}x {formatCurrency(price / installmentCount)} sem juros
      </p>
      <p className="inline-block max-w-full rounded-[3px] bg-[#ffedd5] px-1 text-[12px] font-semibold leading-[16px] text-[#b45309]">
        20% OFF Saldo no Acesse+ Infinity
      </p>
      <p className="text-[12px] font-semibold leading-[16px] text-[#00a650]">Frete gratis</p>
    </div>
  );
};

const DesktopProductCard = ({ id, name, image, oldPrice, price }: Product) => (
  <article className="min-w-0">
    <Link className="group block text-[#222] no-underline" to={`/produto/${id}`}>
      <div className="aspect-square w-full overflow-hidden bg-[#f5f5f5]">
        <img
          alt={name}
          className="h-full w-full object-contain p-3 transition-transform duration-200 group-hover:scale-[1.035]"
          loading="lazy"
          src={image}
        />
      </div>
      <h3 className="mt-3 line-clamp-2 min-h-[38px] text-[13px] font-normal leading-[19px] text-[#333]">
        {name}
      </h3>
      <ProductPrice oldPrice={oldPrice} price={price} />
      <ProductBenefits price={price} />
    </Link>
  </article>
);

const MobileProductRow = ({ id, name, image, oldPrice, price }: Product) => (
  <article className="border-b border-[#e6e6e6] last:border-b-0">
    <Link className="grid min-h-[158px] grid-cols-[140px_minmax(0,1fr)] gap-5 px-4 py-4 text-[#222] no-underline" to={`/produto/${id}`}>
      <div className="flex h-[132px] w-[132px] items-center justify-center overflow-hidden bg-white">
        <img alt={name} className="h-full w-full object-contain" loading="lazy" src={image} />
      </div>
      <div className="min-w-0 pt-1">
        <h3 className="line-clamp-2 text-[13px] font-normal leading-[18px] text-[#333]">{name}</h3>
        <ProductPrice oldPrice={oldPrice} price={price} />
        <ProductBenefits price={price} />
      </div>
    </Link>
  </article>
);

export const ProductCardSkeleton = ({ className = "" }: { className?: string }) => (
  <article aria-hidden="true" className={`min-w-0 ${className}`}>
    <div className="aspect-square w-full animate-pulse bg-[#f0f0f0]" />
    <div className="mt-3 space-y-2">
      <div className="h-[14px] w-full animate-pulse rounded-full bg-[#ededed]" />
      <div className="h-[14px] w-8/12 animate-pulse rounded-full bg-[#ededed]" />
    </div>
    <div className="mt-3 h-[25px] w-24 animate-pulse rounded-full bg-[#ededed]" />
    <div className="mt-2 h-[14px] w-32 animate-pulse rounded-full bg-[#ededed]" />
    <div className="mt-2 h-[14px] w-28 animate-pulse rounded-full bg-[#ededed]" />
  </article>
);

const DesktopSectionHeader = () => (
  <div className="flex items-center justify-between gap-4 px-[19px] pt-[17px]">
    <div className="flex min-w-0 items-baseline gap-3">
      <h2 className="truncate text-[18px] font-semibold leading-[23px] text-[#111]">Inspirado nos seus favoritos</h2>
      <Link className="shrink-0 text-[12px] leading-[16px] text-[#3483fa] no-underline" to="/buscar">
        Ir para seus favoritos
      </Link>
    </div>
    <div aria-hidden="true" className="flex items-center gap-[4px]">
      <span className="h-[6px] w-[6px] rounded-full bg-[#3483fa]" />
      <span className="h-[6px] w-[6px] rounded-full bg-[#dedede]" />
      <span className="h-[6px] w-[6px] rounded-full bg-[#dedede]" />
      <span className="h-[6px] w-[6px] rounded-full bg-[#dedede]" />
    </div>
  </div>
);

const DesktopProductsPanel = ({ loading, products }: { loading: boolean; products: Product[] }) => (
  <div className="relative hidden overflow-visible rounded-[5px] border border-[#dedede] bg-white pb-[31px] shadow-[0_1px_2px_rgba(0,0,0,0.08)] [@media(min-width:1051px)]:block">
    <DesktopSectionHeader />
    <div className="mt-[29px] grid grid-cols-6 gap-x-[18px] px-[19px]">
      {loading
        ? productSkeletonSlots.map((slot) => <ProductCardSkeleton key={slot} />)
        : products.map((product) => <DesktopProductCard key={product.id} {...product} />)}
    </div>
    <Link
      aria-label="Ver mais produtos"
      className="absolute right-[-28px] top-1/2 hidden h-[58px] w-[58px] -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#3483fa] shadow-[0_1px_5px_rgba(0,0,0,0.22)] no-underline [@media(min-width:1051px)]:flex"
      to="/buscar"
    >
      <FiChevronRight size={28} />
    </Link>
  </div>
);

const MobileProductsPanel = ({ loading, products }: { loading: boolean; products: Product[] }) => (
  <div className="overflow-hidden rounded-[5px] border border-[#dedede] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] [@media(min-width:1051px)]:hidden">
    <div className="flex items-center justify-between gap-3 border-b border-[#e6e6e6] px-4 py-3">
      <h2 className="text-[15px] font-semibold leading-[20px] text-[#333]">Inspirado nos seus favoritos</h2>
      <div aria-hidden="true" className="flex items-center gap-[4px]">
        <span className="h-[5px] w-[5px] rounded-full bg-[#3483fa]" />
        <span className="h-[5px] w-[5px] rounded-full bg-[#dedede]" />
        <span className="h-[5px] w-[5px] rounded-full bg-[#dedede]" />
      </div>
    </div>

    {loading
      ? mobileProductSkeletonSlots.map((slot) => (
          <div className="grid min-h-[158px] grid-cols-[140px_minmax(0,1fr)] gap-5 border-b border-[#e6e6e6] px-4 py-4" key={slot}>
            <div className="h-[132px] w-[132px] animate-pulse bg-[#f0f0f0]" />
            <ProductCardSkeleton />
          </div>
        ))
      : products.slice(0, 3).map((product) => <MobileProductRow key={product.id} {...product} />)}

    <Link
      className="flex h-[48px] items-center justify-between border-t border-[#e6e6e6] px-4 text-[14px] font-semibold leading-[18px] text-[#3483fa] no-underline"
      to="/buscar"
    >
      <span>Ver historico de navegacao</span>
      <FiChevronRight size={22} />
    </Link>
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
      <DesktopProductsPanel loading={loading} products={visibleProducts} />
      <MobileProductsPanel loading={loading} products={visibleProducts} />
    </section>
  );
};

export default ProductsSection;
