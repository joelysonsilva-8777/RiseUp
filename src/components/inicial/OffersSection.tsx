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
      <div className="flex h-[168px] w-full flex-col items-start justify-between rounded-[5px] bg-white px-4 py-4 text-[#071735]">
        <span className="inline-flex rounded-full bg-[#ecf8e8] px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-[#167307]">
          {description}
        </span>
        <div>
          <p className="text-[12px] leading-[18px] text-[#476155]">{description}</p>
        </div>
      </div>
      <h3 className="mt-3 min-h-[44px] text-[15px] leading-[20px] text-[#071735]">
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
    className="mx-auto mt-[23px] grid w-[calc(100%-70px)] max-w-[1312px] grid-cols-[minmax(320px,428px)_minmax(0,1fr)] gap-[62px]"
    id="ofertas"
  >
    <article className="h-[438px] overflow-hidden rounded-[10px] bg-white px-[31px] pt-[20px]">
      <h1 className="text-[33px] leading-[40px] text-[#071735]">Oferta do dia</h1>
      <div className="mx-auto mt-4 flex h-[211px] w-[243px] flex-col items-start justify-between rounded-[5px] bg-[#f7faf6] px-4 py-4">
        <span className="inline-flex rounded-full bg-[#ecf8e8] px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-[#167307]">
          Neural
        </span>
        <div>
          <p className="text-[14px] leading-[20px] text-[#476155]">
            Interface inspirada em neurotecnologia para comandos rápidos e assistência fina.
          </p>
        </div>
      </div>
      <h2 className="mt-[13px] text-[21px] leading-[26px] text-[#071735]">
        Sistema neural assistivo para comandos rápidos
      </h2>
      <p className="mt-[18px] text-[17px] leading-[20px] text-[#8493ad]">R$ 72.000</p>
      <p className="text-[32px] leading-[38px] text-[#071735]">R$ 69.900</p>
      <p className="mt-[20px] flex flex-wrap gap-x-[31px] gap-y-1 text-[21px] leading-[25px] text-[#0b1020]">
        <span>Hoje, 16:46</span>
        <span>Laboratório Acesse+ - PE</span>
      </p>
    </article>

    <div className="pt-[20px]">
      <div className="mb-[16px] flex items-center gap-[50px]">
        <h2 className="text-[21px] leading-[25px] text-[#071735]">Ofertas</h2>
        <a className="text-[11px] leading-[14px] text-[#4188f7]" href="#ofertas">
          mostrar todas as ofertas
        </a>
      </div>
      <div className="grid grid-cols-4 gap-x-[31px]">
        {topOffers.map((product, index) => (
          <ProductCard key={`top-${index}`} {...product} />
        ))}
      </div>
    </div>
  </section>
);

export default OffersSection;