import { Link } from "react-router-dom";
import { FiChevronRight, FiZap } from "react-icons/fi";
import { formatCurrency, type Product } from "../../data/products";
import { useProducts } from "../../hooks/useProducts";
import { ProductCardSkeleton } from "./ProductsSection";

const offerSkeletonSlots = Array.from({ length: 4 }, (_, index) => index);

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

const OfferPrice = ({ oldPrice, price }: Pick<Product, "oldPrice" | "price">) => {
  const { cents, integer } = getPriceParts(price);
  const discountPercent = getDiscountPercent(price, oldPrice);

  return (
    <div className="mt-2">
      {oldPrice ? (
        <p className="text-[11px] leading-[13px] text-[#737373] line-through">{formatCurrency(oldPrice)}</p>
      ) : null}
      <p className="flex flex-wrap items-start gap-x-1 text-[#222]">
        <span className="pt-[3px] text-[15px] leading-[18px]">R$</span>
        <span className="text-[24px] font-normal leading-[28px]">{integer}</span>
        <span className="pt-[2px] text-[12px] leading-[14px]">{cents}</span>
        {discountPercent ? (
          <span className="ml-1 mt-[6px] rounded-[3px] bg-[#e5f5ed] px-1 text-[12px] leading-[16px] text-[#00a650]">
            {discountPercent}% OFF
          </span>
        ) : null}
      </p>
    </div>
  );
};

const OfferBenefits = ({ compact = false, price }: Pick<Product, "price"> & { compact?: boolean }) => {
  const installmentCount = getInstallmentCount(price);

  return (
    <div className={`${compact ? "mt-1" : "mt-2"} space-y-1`}>
      <p className="text-[12px] font-medium leading-[16px] text-[#00a650]">
        {installmentCount}x {formatCurrency(price / installmentCount)} sem juros
      </p>
      <p className="inline-block max-w-full rounded-[3px] bg-[#ffedd5] px-1 text-[12px] font-semibold leading-[16px] text-[#b45309]">
        20% OFF Saldo no Acesse+ Infinity
      </p>
      <p className="flex items-center gap-1 text-[12px] font-semibold italic leading-[16px] text-[#00a650]">
        <FiZap fill="currentColor" size={12} />
        FULL {compact ? "SUPER" : ""}
      </p>
    </div>
  );
};

const OfferProductCard = ({ id, image, name, oldPrice, price }: Product) => (
  <article className="min-w-0">
    <Link className="group block text-[#222] no-underline" to={`/produto/${id}`}>
      <div className="aspect-square overflow-hidden bg-[#f5f5f5]">
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
      <OfferPrice oldPrice={oldPrice} price={price} />
      <OfferBenefits price={price} />
      <p className="mt-1 text-[12px] font-semibold leading-[16px] text-[#00a650]">Frete gratis</p>
    </Link>
  </article>
);

const DailyOfferCard = ({ product }: { product: Product }) => (
  <article className="overflow-hidden rounded-[5px] border border-[#dedede] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
    <h2 className="px-[18px] pt-[16px] text-[18px] font-semibold leading-[23px] text-[#111]">Oferta do dia</h2>
    <Link
      className="grid min-h-[190px] grid-cols-[140px_minmax(0,1fr)] gap-5 px-4 py-4 text-[#222] no-underline [@media(min-width:1051px)]:block [@media(min-width:1051px)]:px-[18px] [@media(min-width:1051px)]:pb-[28px]"
      to={`/produto/${product.id}`}
    >
      <div className="flex h-[132px] w-[132px] items-center justify-center overflow-hidden bg-[#f5f5f5] [@media(min-width:1051px)]:mx-auto [@media(min-width:1051px)]:mt-[27px] [@media(min-width:1051px)]:h-[210px] [@media(min-width:1051px)]:w-full">
        <img alt={product.name} className="h-full w-full object-contain p-2 [@media(min-width:1051px)]:p-4" loading="lazy" src={product.image} />
      </div>
      <div className="min-w-0 pt-1 [@media(min-width:1051px)]:pt-[16px]">
        <h3 className="line-clamp-2 text-[13px] font-normal leading-[18px] text-[#333] [@media(min-width:1051px)]:min-h-[42px] [@media(min-width:1051px)]:text-[14px] [@media(min-width:1051px)]:leading-[20px]">
          {product.name}
        </h3>
        <OfferPrice oldPrice={product.oldPrice} price={product.price} />
        <OfferBenefits compact price={product.price} />
      </div>
    </Link>
    <Link
      className="flex h-[48px] items-center justify-between border-t border-[#e6e6e6] px-4 text-[14px] font-semibold leading-[18px] text-[#3483fa] no-underline [@media(min-width:1051px)]:hidden"
      to="/buscar"
    >
      <span>Ver todas as ofertas</span>
      <FiChevronRight size={22} />
    </Link>
  </article>
);

const Dots = () => (
  <div aria-hidden="true" className="flex items-center gap-[4px]">
    <span className="h-[6px] w-[6px] rounded-full bg-[#3483fa]" />
    <span className="h-[6px] w-[6px] rounded-full bg-[#dedede]" />
    <span className="h-[6px] w-[6px] rounded-full bg-[#dedede]" />
    <span className="h-[6px] w-[6px] rounded-full bg-[#dedede]" />
    <span className="h-[6px] w-[6px] rounded-full bg-[#dedede]" />
  </div>
);

const OffersPanel = ({ products }: { products: Product[] }) => (
  <div className="relative hidden overflow-visible rounded-[5px] border border-[#dedede] bg-white pb-[28px] shadow-[0_1px_2px_rgba(0,0,0,0.08)] [@media(min-width:1051px)]:block">
    <div className="flex items-center justify-between gap-4 px-[18px] pt-[16px]">
      <div className="flex min-w-0 items-baseline gap-3">
        <h2 className="text-[18px] font-semibold leading-[23px] text-[#111]">Ofertas</h2>
        <Link className="shrink-0 text-[12px] leading-[16px] text-[#3483fa] no-underline" to="/buscar">
          Mostrar todas as ofertas
        </Link>
      </div>
      <Dots />
    </div>
    <div className="mt-[29px] grid grid-cols-4 gap-x-[18px] px-[18px]">
      {products.map((product) => (
        <OfferProductCard key={product.id} {...product} />
      ))}
    </div>
    <Link
      aria-label="Ver mais ofertas"
      className="absolute right-[-28px] top-1/2 hidden h-[58px] w-[58px] -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#3483fa] shadow-[0_1px_5px_rgba(0,0,0,0.22)] no-underline [@media(min-width:1051px)]:flex"
      to="/buscar"
    >
      <FiChevronRight size={28} />
    </Link>
  </div>
);

const OfferHeroSkeleton = () => (
  <article className="overflow-hidden rounded-[5px] border border-[#dedede] bg-white px-[18px] py-[16px] shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
    <div className="h-[23px] w-[130px] animate-pulse rounded-full bg-[#ededed]" />
    <div className="mt-7 h-[210px] animate-pulse bg-[#f0f0f0]" />
    <div className="mt-4 h-[18px] w-full animate-pulse rounded-full bg-[#ededed]" />
    <div className="mt-2 h-[18px] w-8/12 animate-pulse rounded-full bg-[#ededed]" />
    <div className="mt-4 h-[28px] w-28 animate-pulse rounded-full bg-[#ededed]" />
  </article>
);

const OffersPanelSkeleton = () => (
  <div className="hidden rounded-[5px] border border-[#dedede] bg-white px-[18px] pb-[28px] pt-[16px] shadow-[0_1px_2px_rgba(0,0,0,0.08)] [@media(min-width:1051px)]:block">
    <div className="flex items-center justify-between">
      <div className="h-[23px] w-[175px] animate-pulse rounded-full bg-[#ededed]" />
      <Dots />
    </div>
    <div className="mt-[29px] grid grid-cols-4 gap-x-[18px]">
      {offerSkeletonSlots.map((slot) => (
        <ProductCardSkeleton key={slot} />
      ))}
    </div>
  </div>
);

const OffersSection = () => {
  const { products, loading } = useProducts();
  const dailyOffer = products.find((product) => product.featured) ?? products[0];
  const topOffers = products.filter((product) => product.id !== dailyOffer?.id).slice(0, 4);

  if (!loading && !dailyOffer) {
    return null;
  }

  if (loading || !dailyOffer) {
    return (
      <section
        aria-busy="true"
        className="mx-auto mt-[23px] grid w-[calc(100%-24px)] max-w-[1312px] scroll-mt-[210px] grid-cols-1 items-start gap-3 sm:w-[calc(100%-70px)] [@media(min-width:1051px)]:grid-cols-[305px_minmax(0,1fr)] [@media(min-width:1051px)]:gap-[14px]"
        id="ofertas"
      >
        <OfferHeroSkeleton />
        <OffersPanelSkeleton />
      </section>
    );
  }

  return (
    <section
      className="mx-auto mt-[23px] grid w-[calc(100%-24px)] max-w-[1312px] scroll-mt-[210px] grid-cols-1 items-start gap-3 sm:w-[calc(100%-70px)] [@media(min-width:1051px)]:grid-cols-[305px_minmax(0,1fr)] [@media(min-width:1051px)]:gap-[14px]"
      id="ofertas"
    >
      <DailyOfferCard product={dailyOffer} />
      <OffersPanel products={topOffers.length > 0 ? topOffers : products.slice(0, 4)} />
    </section>
  );
};

export default OffersSection;
