import { useRef } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

type Product = {
  name: string;
  category: string;
  description: string;
  image: string;
  oldPrice?: string;
  price: string;
};

const defaultProducts: Product[] = [
  {
    name: "Prótese biônica de mão modular",
    category: "Mão biônica",
    description: "Sensores táteis, pegada precisa e resposta motora fina.",
    image: "/produto-cadeira-thumb-1.png",
    oldPrice: "Sob consulta",
    price: "R$ 48.000",
  },
  {
    name: "Óculos assistivo com leitura de ambiente",
    category: "Visão",
    description: "Reconhece placas, obstáculos e contexto imediato.",
    image: "/produto-cadeira-thumb-2.png",
    price: "R$ 9.800",
  },
  {
    name: "Teclado braille mecânico premium",
    category: "Acesso tátil",
    description: "Feedback silencioso, USB-C e teclas de alta precisão.",
    image: "/produto-cadeira-thumb-3.png",
    price: "R$ 2.400",
  },
  {
    name: "Mouse ocular com calibração rápida",
    category: "Controle por olhar",
    description: "Cursor responsivo para navegação sem toque.",
    image: "/produto-cadeira-thumb-4.png",
    price: "R$ 7.900",
  },
  {
    name: "Cadeira motorizada com navegação inteligente",
    category: "Mobilidade",
    description: "Controle por app e assistência de percurso interno.",
    image: "/produto-cadeira-main.png",
    oldPrice: "A partir de R$ 12.500",
    price: "R$ 11.900",
  },
  {
    name: "Fone de condução óssea clínica",
    category: "Audição",
    description: "Conversa assistida sem bloquear o ouvido externo.",
    image: "/produto-cadeira-thumb-5.png",
    price: "R$ 1.350",
  },
];

const ProductCard = ({
  name,
  image,
  oldPrice,
  category,
  description,
  price,
}: Product) => (
  <article className="min-w-0">
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

const MobileProductCarousel = () => {
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
          aria-label="Ver próximos produtos"
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
        {defaultProducts.map((product, index) => (
          <div className="w-[min(78vw,300px)] shrink-0 snap-start" key={`${product.name}-${index}`}>
            <ProductCard {...product} />
          </div>
        ))}
      </div>
    </div>
  );
};

type ProductsSectionProps = {
  className?: string;
  title?: string;
  products?: Product[];
};

const ProductsSection = ({ 
  className = "mt-[70px]",
  title = "Tecnologia assistiva em destaque",
  products = defaultProducts  // renomeia o array atual para defaultProducts
}: ProductsSectionProps) => (
  <section className={`mx-auto w-[calc(100%-24px)] max-w-[1312px] px-0 sm:w-[calc(100%-70px)] ${className}`}>
    <h2 className="text-[23px] leading-[28px] text-[#071735]">
      {title}
    </h2>
    <MobileProductCarousel />
    <div className="mt-4 hidden grid-cols-6 gap-x-[31px] [@media(min-width:1051px)]:grid">
      {products.map((product, index) => (
        <ProductCard key={`${product.name}-${index}`} {...product} />
      ))}
    </div>
  </section>
);

export default ProductsSection;
