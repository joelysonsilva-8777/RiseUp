import { useRef } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

type Product = {
  name: string;
  category: string;
  description: string;
  oldPrice?: string;
  price: string;
};

const products: Product[] = [
  {
    name: "Prótese biônica de mão modular",
    category: "Mão biônica",
    description: "Sensores táteis, pegada precisa e resposta motora fina.",
    oldPrice: "Sob consulta",
    price: "R$ 48.000",
  },
  {
    name: "Óculos assistivo com leitura de ambiente",
    category: "Visão",
    description: "Reconhece placas, obstáculos e contexto imediato.",
    price: "R$ 9.800",
  },
  {
    name: "Teclado braille mecânico premium",
    category: "Acesso tátil",
    description: "Feedback silencioso, USB-C e teclas de alta precisão.",
    price: "R$ 2.400",
  },
  {
    name: "Mouse ocular com calibração rápida",
    category: "Controle por olhar",
    description: "Cursor responsivo para navegação sem toque.",
    price: "R$ 7.900",
  },
  {
    name: "Cadeira motorizada com navegação inteligente",
    category: "Mobilidade",
    description: "Controle por app e assistência de percurso interno.",
    oldPrice: "A partir de R$ 12.500",
    price: "R$ 11.900",
  },
  {
    name: "Fone de condução óssea clínica",
    category: "Audição",
    description: "Conversa assistida sem bloquear o ouvido externo.",
    price: "R$ 1.350",
  },
];

const ProductCard = ({
  name,
  oldPrice,
  category,
  description,
  price,
}: {
  name: string;
  category: string;
  description: string;
  oldPrice?: string;
  price: string;
}) => (
  <article className="min-w-0">
    <div className="flex h-[168px] w-full flex-col items-start justify-between rounded-[5px] bg-white px-4 py-4 text-[#071735]">
      <span className="inline-flex rounded-full bg-[#ecf8e8] px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-[#167307]">
        {category}
      </span>
      <div>
        <p className="text-[12px] leading-[18px] text-[#476155]">{description}</p>
      </div>
    </div>
    <h3 className="mt-3 min-h-[44px] text-[15px] leading-[20px] text-[#071735]">{name}</h3>
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
    <div className="lg:hidden">
      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          aria-label="Ver produtos anteriores"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d7e8d4] bg-white text-[#167307] shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
          onClick={() => scrollByAmount(-1)}
          type="button"
        >
          <FiChevronLeft size={20} />
        </button>
        <p className="text-[12px] leading-[16px] text-[#476155]">
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
        {products.map((product, index) => (
          <div className="w-[min(84vw,320px)] shrink-0 snap-start" key={`${product.name}-${index}`}>
            <ProductCard {...product} />
          </div>
        ))}
      </div>
    </div>
  );
};

type ProductsSectionProps = {
  className?: string;
};

const ProductsSection = ({ className = "mt-[70px]" }: ProductsSectionProps) => (
  <section className={`mx-auto w-[calc(100%-70px)] max-w-[1312px] px-0 ${className}`}>
    <h2 className="text-[23px] leading-[28px] text-[#071735]">
      Tecnologia assistiva em destaque
    </h2>
    <MobileProductCarousel />
    <div className="mt-4 hidden grid-cols-6 gap-x-[31px] lg:grid">
      {products.map((product, index) => (
        <ProductCard key={`${product.name}-${index}`} {...product} />
      ))}
    </div>
  </section>
);

export default ProductsSection;