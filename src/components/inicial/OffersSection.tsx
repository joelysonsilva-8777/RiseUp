import { Link } from "react-router-dom";

type Product = {
  name: string;
  description: string;
  oldPrice?: string;
  price: string;
};

const products: Product[] = [
  {
    name: "Kit de ponteira adaptada para controle fino",
    description: "Melhora a pegada e a resposta de toques delicados.",
    oldPrice: "R$ 320",
    price: "R$ 290",
  },
  {
    name: "Braço robótico leve para auxílio de alcance",
    description: "Extensão mecânica para pegar, apoiar e movimentar objetos.",
    price: "R$ 18.400",
  },
  {
    name: "Interface háptica para navegação tátil",
    description: "Traduz conteúdo e direção em vibrações compreensíveis.",
    price: "R$ 6.700",
  },
  {
    name: "Módulo de leitura por voz offline",
    description: "Converte texto em voz sem depender de conexão.",
    price: "R$ 1.280",
  },
  {
    name: "Capa com suporte magnético para mobilidade",
    description: "Fixação firme para transportar controles e acessórios.",
    price: "R$ 185",
  },
  {
    name: "Sistema neural assistivo para comandos rápidos",
    description: "Camada experimental para gestos e comandos de alta precisão.",
    price: "R$ 72.000",
  },
];

const topOffers = products.slice(0, 4);

const ProductCard = ({
  name,
  oldPrice,
  description,
  price,
}: {
  name: string;
  description: string;
  oldPrice?: string;
  price: string;
}) => (
  <article className="min-w-0">
    <Link className="block text-[#071735] no-underline" to="/produto">
      <div className="flex h-[168px] w-full flex-col items-start justify-end rounded-[5px] bg-white px-4 py-4 text-[#071735]">
        <p className="max-w-[250px] text-[12px] leading-[18px] text-[#476155]">{description}</p>
      </div>
      <h3 className="mt-3 min-h-[44px] text-[14px] leading-[18px] text-[#071735] sm:text-[15px] sm:leading-[20px]">
        {name}
      </h3>
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
    className="mx-auto mt-[23px] grid w-[calc(100%-24px)] max-w-[1312px] grid-cols-1 gap-8 sm:w-[calc(100%-70px)] lg:grid-cols-[minmax(320px,428px)_minmax(0,1fr)] lg:gap-[62px]"
    id="ofertas"
  >
    <article className="overflow-hidden rounded-[10px] bg-white px-4 pt-[18px] sm:px-[31px] sm:pt-[20px] lg:h-[438px]">
      <h1 className="text-[26px] leading-[31px] text-[#071735] sm:text-[33px] sm:leading-[40px]">Oferta do dia</h1>
      <div className="mx-auto mt-4 flex aspect-[243/211] w-full max-w-[243px] flex-col items-start justify-end rounded-[5px] bg-[#f7faf6] px-4 py-4">
        <p className="text-[14px] leading-[20px] text-[#476155]">
          Interface inspirada em neurotecnologia para comandos rápidos e assistência fina.
        </p>
      </div>
      <h2 className="mt-[13px] text-[18px] leading-[24px] text-[#071735] sm:text-[21px] sm:leading-[26px]">
        Sistema neural assistivo para comandos rápidos
      </h2>
      <p className="mt-[14px] text-[14px] leading-[18px] text-[#8493ad] sm:mt-[18px] sm:text-[17px] sm:leading-[20px]">R$ 72.000</p>
      <p className="text-[26px] leading-[32px] text-[#071735] sm:text-[32px] sm:leading-[38px]">R$ 69.900</p>
      <p className="mt-[14px] flex flex-wrap gap-x-[31px] gap-y-1 text-[16px] leading-[22px] text-[#0b1020] sm:mt-[20px] sm:text-[21px] sm:leading-[25px]">
        <span>Hoje, 16:46</span>
        <span>Laboratório Acesse+ - PE</span>
      </p>
    </article>

    <div className="pt-[20px]">
      <div className="mb-[16px] flex items-center gap-4 sm:gap-[50px]">
        <h2 className="text-[19px] leading-[23px] text-[#071735] sm:text-[21px] sm:leading-[25px]">Ofertas</h2>
        <a className="text-[11px] leading-[14px] text-[#4188f7]" href="#ofertas">
          mostrar todas as ofertas
        </a>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-x-[31px]">
        {topOffers.map((product, index) => (
          <ProductCard key={`top-${index}`} {...product} />
        ))}
      </div>
    </div>
  </section>
);

export default OffersSection;