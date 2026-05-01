import { Link } from "react-router-dom";

type Product = {
  name: string;
  description: string;
  image: string;
  oldPrice?: string;
  price: string;
  tag: string;
};

const products: Product[] = [
  {
    name: "Kit de ponteira adaptada para controle fino",
    description: "Melhora a pegada e a resposta de toques delicados.",
    image: "/produto-cadeira-thumb-1.png",
    oldPrice: "R$ 320",
    price: "R$ 290",
    tag: "Acessório",
  },
  {
    name: "Braço robótico leve para auxílio de alcance",
    description: "Extensão mecânica para pegar, apoiar e movimentar objetos.",
    image: "/produto-cadeira-thumb-2.png",
    price: "R$ 18.400",
    tag: "Mobilidade",
  },
  {
    name: "Interface háptica para navegação tátil",
    description: "Traduz conteúdo e direção em vibrações compreensíveis.",
    image: "/produto-cadeira-thumb-3.png",
    price: "R$ 6.700",
    tag: "Tátil",
  },
  {
    name: "Módulo de leitura por voz offline",
    description: "Converte texto em voz sem depender de conexão.",
    image: "/produto-cadeira-thumb-4.png",
    price: "R$ 1.280",
    tag: "Voz",
  },
  {
    name: "Capa com suporte magnético para mobilidade",
    description: "Fixação firme para transportar controles e acessórios.",
    image: "/produto-cadeira-thumb-5.png",
    price: "R$ 185",
    tag: "Suporte",
  },
  {
    name: "Sistema neural assistivo para comandos rápidos",
    description: "Camada experimental para gestos e comandos de alta precisão.",
    image: "/produto-cadeira-main.png",
    price: "R$ 72.000",
    tag: "Neural",
  },
];

const topOffers = products.slice(0, 4);
const dailyOffer = products[5];

const ProductCard = ({
  name,
  oldPrice,
  description,
  image,
  price,
  tag,
}: Product) => (
  <article className="min-w-0">
    <Link className="block text-[#071735] no-underline" to="/produto">
      <div className="relative aspect-square w-full overflow-hidden rounded-[5px] bg-white text-[#071735] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <img
          alt={name}
          className="h-full w-full object-contain p-4"
          loading="lazy"
          src={image}
        />
        <span className="absolute left-3 top-3 inline-flex max-w-[calc(100%-24px)] rounded-full bg-[#ecf8e8] px-3 py-1 text-[10px] uppercase leading-[13px] tracking-[0.12em] text-[#167307]">
          {tag}
        </span>
      </div>
      <h3 className="mt-3 min-h-[44px] text-[15px] leading-[20px] text-[#071735]">
        {name}
      </h3>
      <p className="mt-2 min-h-[36px] text-[12px] leading-[18px] text-[#476155]">{description}</p>
    </Link>
    <div className="mt-4 min-h-[39px]">
      {oldPrice ? (
        <p className="text-[13px] leading-[15px] text-[#8493ad]">{oldPrice}</p>
      ) : null}
      <p className="text-[19px] leading-[24px] text-[#071735]">{price}</p>
    </div>
    <p className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-[11px] leading-[14px] text-[#0b1020]">
      <span>Hoje, 16:46</span>
      <span>Paulista - PE</span>
    </p>
  </article>
);

const OffersSection = () => (
  <section
    className="mx-auto mt-[23px] grid w-[calc(100%-24px)] max-w-[1312px] scroll-mt-[210px] grid-cols-1 items-start gap-7 sm:w-[calc(100%-70px)] [@media(min-width:1051px)]:grid-cols-[minmax(320px,428px)_minmax(0,1fr)] [@media(min-width:1051px)]:gap-[62px]"
    id="ofertas"
  >
    <article className="self-start overflow-hidden rounded-[10px] bg-white px-5 py-6 sm:px-[31px] sm:pt-[20px]">
      <h1 className="text-[27px] leading-[34px] text-[#071735] sm:text-[33px] sm:leading-[40px]">Oferta do dia</h1>
      <Link className="block text-[#071735] no-underline" to="/produto">
        <div className="relative mx-auto mt-4 aspect-square w-full max-w-[205px] overflow-hidden rounded-[5px] bg-[#f7faf6] sm:max-w-[225px]">
          <img
            alt={dailyOffer.name}
            className="h-full w-full object-contain p-5"
            loading="lazy"
            src={dailyOffer.image}
          />
          <span className="absolute left-3 top-3 inline-flex rounded-full bg-[#ecf8e8] px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-[#167307]">
            {dailyOffer.tag}
          </span>
        </div>
        <h2 className="mt-[13px] text-[20px] leading-[26px] text-[#071735] sm:text-[21px]">
          {dailyOffer.name}
        </h2>
      </Link>
      <p className="mt-3 text-[14px] leading-[20px] text-[#476155] sm:text-[15px]">{dailyOffer.description}</p>
      <p className="mt-[18px] text-[17px] leading-[20px] text-[#8493ad]">R$ 72.000</p>
      <p className="text-[30px] leading-[38px] text-[#071735] sm:text-[32px]">R$ 69.900</p>
      <p className="mt-[20px] flex flex-wrap gap-x-[31px] gap-y-1 text-[15px] leading-[20px] text-[#0b1020] sm:text-[21px] sm:leading-[25px]">
        <span>Hoje, 16:46</span>
        <span>Laboratório Acesse+ - PE</span>
      </p>
    </article>

    <div className="pt-0 [@media(min-width:1051px)]:pt-[20px]">
      <div className="mb-[16px] flex flex-wrap items-center gap-x-[50px] gap-y-2">
        <h2 className="text-[21px] leading-[25px] text-[#071735]">Ofertas</h2>
        <a className="text-[11px] leading-[14px] text-[#4188f7]" href="#ofertas">
          mostrar todas as ofertas
        </a>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 xl:gap-x-[31px]">
        {topOffers.map((product, index) => (
          <ProductCard key={`top-${index}`} {...product} />
        ))}
      </div>
    </div>
  </section>
);

export default OffersSection;
