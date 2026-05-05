import { Link } from "react-router-dom";
import { formatCurrency, type Product } from "../../data/products";
import { useProducts } from "../../hooks/useProducts";
import { ProductCardSkeleton } from "./ProductsSection";

const ProductCard = ({
  id,
  name,
  oldPrice,
  description,
  image,
  price,
  category,
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
      <h3 className="mt-3 min-h-[44px] text-[15px] leading-[20px] text-[#071735]">
        {name}
      </h3>
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

const OfferHeroSkeleton = () => (
  <article className="glass-skeleton self-start overflow-hidden rounded-[10px] px-5 py-6 sm:px-[31px] sm:pt-[20px]">
    <div className="glass-skeleton__shine" />
    <div className="mx-auto flex min-h-[530px] flex-col">
      <div className="h-[34px] w-[180px] rounded-full bg-white/70 sm:h-[40px] sm:w-[220px]" />
      <div className="mx-auto mt-4 aspect-square w-full max-w-[225px] rounded-[5px] bg-white/30" />
      <div className="mt-[13px] h-[26px] w-[72%] rounded-full bg-white/65" />
      <div className="mt-3 space-y-3">
        <div className="h-[20px] w-full rounded-full bg-white/35" />
        <div className="h-[20px] w-[86%] rounded-full bg-white/35" />
      </div>
      <div className="mt-[18px] h-[20px] w-[42%] rounded-full bg-white/35" />
      <div className="mt-2 h-[38px] w-[52%] rounded-full bg-white/70" />
      <div className="mt-[20px] flex flex-wrap gap-x-[31px] gap-y-1">
        <div className="h-[20px] w-[150px] rounded-full bg-white/35" />
        <div className="h-[20px] w-[130px] rounded-full bg-white/35" />
      </div>
    </div>
  </article>
);

const OffersSection = () => {
  const { products, loading } = useProducts();
  const topOffers = products.slice(0, 4);
  const dailyOffer = products.find((product) => product.featured) ?? products[0];

  if (!loading && !dailyOffer) {
    return null;
  }

  if (loading) {
    return (
      <section
        aria-busy="true"
        className="mx-auto mt-[23px] grid w-[calc(100%-24px)] max-w-[1312px] scroll-mt-[210px] grid-cols-1 items-start gap-7 sm:w-[calc(100%-70px)] [@media(min-width:1051px)]:grid-cols-[minmax(320px,428px)_minmax(0,1fr)] [@media(min-width:1051px)]:gap-[62px]"
        id="ofertas"
      >
        <OfferHeroSkeleton />

        <div className="pt-0 [@media(min-width:1051px)]:pt-[20px]">
          <div className="mb-[16px] flex flex-wrap items-center gap-x-[50px] gap-y-2">
            <div className="h-[25px] w-[110px] rounded-full bg-white/70" />
            <div className="h-[14px] w-[160px] rounded-full bg-white/35" />
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 xl:gap-x-[31px]">
            {Array.from({ length: 4 }, (_, index) => index).map((slot) => (
              <ProductCardSkeleton key={slot} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="mx-auto mt-[23px] grid w-[calc(100%-24px)] max-w-[1312px] scroll-mt-[210px] grid-cols-1 items-start gap-7 sm:w-[calc(100%-70px)] [@media(min-width:1051px)]:grid-cols-[minmax(320px,428px)_minmax(0,1fr)] [@media(min-width:1051px)]:gap-[62px]"
      id="ofertas"
    >
      <article className="self-start overflow-hidden rounded-[10px] bg-white px-5 py-6 sm:px-[31px] sm:pt-[20px]">
        <h1 className="text-[27px] leading-[34px] text-[#071735] sm:text-[33px] sm:leading-[40px]">Oferta do dia</h1>
        <Link className="block text-[#071735] no-underline" to={`/produto/${dailyOffer.id}`}>
          <div className="relative mx-auto mt-4 aspect-square w-full max-w-[205px] overflow-hidden rounded-[5px] bg-[#f7faf6] sm:max-w-[225px]">
            <img
              alt={dailyOffer.name}
              className="h-full w-full object-contain p-5"
              loading="lazy"
              src={dailyOffer.image}
            />
            <span className="absolute left-3 top-3 inline-flex rounded-full bg-[#ecf8e8] px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-[#167307]">
              {dailyOffer.category}
            </span>
          </div>
          <h2 className="mt-[13px] text-[20px] leading-[26px] text-[#071735] sm:text-[21px]">
            {dailyOffer.name}
          </h2>
        </Link>
        <p className="mt-3 text-[14px] leading-[20px] text-[#476155] sm:text-[15px]">{dailyOffer.description}</p>
        {dailyOffer.oldPrice ? (
          <p className="mt-[18px] text-[17px] leading-[20px] text-[#8493ad]">
            {formatCurrency(dailyOffer.oldPrice)}
          </p>
        ) : null}
        <p className="text-[30px] leading-[38px] text-[#071735] sm:text-[32px]">
          {formatCurrency(dailyOffer.price)}
        </p>
        <p className="mt-[20px] flex flex-wrap gap-x-[31px] gap-y-1 text-[15px] leading-[20px] text-[#0b1020] sm:text-[21px] sm:leading-[25px]">
          <span>Hoje, 16:46</span>
          <span>{dailyOffer.sellerName ?? "Acesse+"} - {dailyOffer.state ?? "PE"}</span>
        </p>
      </article>

      <div className="pt-0 [@media(min-width:1051px)]:pt-[20px]">
        <div className="mb-[16px] flex flex-wrap items-center gap-x-[50px] gap-y-2">
          <h2 className="text-[21px] leading-[25px] text-[#071735]">Ofertas</h2>
          <Link className="text-[11px] leading-[14px] text-[#4188f7] no-underline" to="/buscar">
            mostrar todas as ofertas
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 xl:gap-x-[31px]">
          {topOffers.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default OffersSection;
