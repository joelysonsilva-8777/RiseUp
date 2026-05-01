import { useRef } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const categories = [
  "Carros, Motos e outros",
  "Celulares e Telefones",
  "Calçados, Roupas e Bolsas",
  "Imóveis",
  "Ferramentas",
  "Agro",
  "Alimentos e Bebidas",
  "Arte, Papelaria e Armarinho",
  "Casa, Móveis e Decoração",
  "Informática",
  "Esportes e Fitness",
  "Beleza e Cuidado Pessoal",
  "Eletrônicos, Áudio e Vídeo",
  "Antiguidades e Coleções",
  "Saúde",
];

const CategoriesSection = () => (
  <section className="mt-[78px] w-full scroll-mt-[210px] bg-[#e8e8e8] pb-[53px] pt-[16px]" id="categorias">
    <div className="mx-auto w-[calc(100%-70px)] max-w-[1325px]">
      <h2 className="text-[25px] leading-[30px] text-[#071735]">Categorias</h2>
      <MobileCategoriesCarousel />
      <div className="mt-3 hidden grid-cols-[minmax(220px,274px)_repeat(7,minmax(0,1fr))] gap-x-[31px] gap-y-[17px] md:grid">
        {categories.map((category, index) => (
          <article className={`min-w-0 ${index === 0 ? "row-span-2" : ""}`} key={category}>
            <div
              className={
                index === 0
                  ? "h-[239px] rounded-[5px] bg-white"
                  : "h-[104px] rounded-[5px] bg-white"
              }
            />
            <h3
              className={
                index === 0
                  ? "mt-[10px] break-words text-[16px] leading-[19px] text-[#071735]"
                  : "mt-[9px] break-words text-[11px] leading-[13px] text-[#071735]"
              }
            >
              {category}
            </h3>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default CategoriesSection;

const MobileCategoryCard = ({ category, featured }: { category: string; featured: boolean }) => (
  <article className={`shrink-0 ${featured ? "w-[190px]" : "w-[154px]"}`}>
    <div className={featured ? "h-[200px] rounded-[5px] bg-white" : "h-[104px] rounded-[5px] bg-white"} />
    <h3
      className={
        featured
          ? "mt-[10px] break-words text-[13px] leading-[17px] text-[#071735]"
          : "mt-[9px] break-words text-[11px] leading-[13px] text-[#071735]"
      }
    >
      {category}
    </h3>
  </article>
);

const MobileCategoriesCarousel = () => {
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
    <div className="md:hidden">
      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          aria-label="Ver categorias anteriores"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d7e8d4] bg-white text-[#167307] shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
          onClick={() => scrollByAmount(-1)}
          type="button"
        >
          <FiChevronLeft size={20} />
        </button>
        <p className="text-[12px] leading-[16px] text-[#476155]">Deslize ou use as setas para navegar</p>
        <button
          aria-label="Ver próximas categorias"
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
        {categories.map((category, index) => (
          <MobileCategoryCard featured={index === 0} key={category} category={category} />
        ))}
      </div>
    </div>
  );
};
