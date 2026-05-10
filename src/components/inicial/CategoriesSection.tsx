import { useRef, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Link } from "react-router-dom";


type Category = {
  label: string;
  image: string;
};

const categories: Category[] = [
  {
    label: "Mobilidade",
    image: "/categorias/mobilidade.png",
  },
  {
    label: "Audição",
    image: "/categorias/audicao.png",
  },
  {
    label: "Comunicação",
    image: "/categorias/comunicacao.png",
  },
  {
    label: "Visão",
    image: "/categorias/visao.png",
  },
  {
    label: "Postura e Ortopedia",
    image: "/categorias/postura.ortopedia.png",
  },
  {
    label: "Cuidados Diários",
    image: "/categorias/cuidados.diarios.png",
  },
  {
    label: "Tecnologia Assistiva",
    image: "/categorias/tecnologia.assistiva.png",
  },
  {
    label: "Reabilitação",
    image: "/categorias/reabilitacao.png",
  },
  {
    label: "Segurança e Monitoramento",
    image: "/categorias/seguranca.monitoramento.png",
  },
  {
    label: "Lazer e Inclusão",
    image: "/categorias/lazer.inclusao.png",
  },
];

// ─── Card ─────────────────────────────────────────────────────────────────────

const CategoryCard = ({ label, image }: Category) => (
  <Link
    to={`/lista-produtos?categoria=${encodeURIComponent(label)}`}
    className="group aspect-square overflow-hidden rounded-[10px] border border-[#e8e8e8] bg-white no-underline transition-all duration-200 hover:border-[#b2edb8] hover:shadow-[0_2px_10px_rgba(22,115,7,0.12)]"
    aria-label={label}
  >
    <img
      src={image}
      alt={label}
      className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-105"
    />
  </Link>
);

// ─── Seção principal ──────────────────────────────────────────────────────────

const CategoriesSection = () => {
  const [paginaAtiva, setPaginaAtiva] = useState(0);
  const categoriasPorPagina = 4;
  const totalPaginas = Math.ceil(categories.length / categoriasPorPagina);

  const anterior = () => setPaginaAtiva((p) => Math.max(0, p - 1));
  const proximo = () => setPaginaAtiva((p) => Math.min(totalPaginas - 1, p + 1));

  const categoriasDaPagina = categories.slice(
    paginaAtiva * categoriasPorPagina,
    paginaAtiva * categoriasPorPagina + categoriasPorPagina
  );

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const scrollByAmount = (direction: -1 | 1) => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollBy({ left: direction * 240, behavior: "smooth" });
  };

  return (
    <section className="mt-[78px] w-full scroll-mt-[210px] bg-[#f5f5f5] py-[40px]" id="categorias">
      <div className="mx-auto w-[calc(100%-24px)] max-w-[1325px] sm:w-[calc(100%-70px)]">

        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-[22px] font-semibold leading-[28px] text-[#071735]">Categorias</h2>
            <Link to="/lista-produtos" className="text-[13px] text-[#167307] no-underline hover:underline">
              Mostrar todas as categorias
            </Link>
          </div>

          {/* Setas + dots desktop */}
          <div className="hidden items-center gap-3 md:flex">
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPaginas }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPaginaAtiva(i)}
                  className={`h-2 rounded-full border-0 p-0 transition-all ${
                    paginaAtiva === i ? "w-5 bg-[#167307]" : "w-2 bg-[#ccc] hover:bg-[#b2edb8]"
                  }`}
                  type="button"
                  aria-label={`Página ${i + 1}`}
                />
              ))}
            </div>
            <button
              aria-label="Anterior"
              onClick={anterior}
              disabled={paginaAtiva === 0}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#167307] text-[#167307] transition-colors hover:bg-[#ecf8e8] disabled:border-[#ccc] disabled:text-[#ccc] disabled:cursor-not-allowed"
              type="button"
            >
              <FiChevronLeft size={16} />
            </button>
            <button
              aria-label="Próximo"
              onClick={proximo}
              disabled={paginaAtiva === totalPaginas - 1}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#167307] text-[#167307] transition-colors hover:bg-[#ecf8e8] disabled:border-[#ccc] disabled:text-[#ccc] disabled:cursor-not-allowed"
              type="button"
            >
              <FiChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Card branco container */}
        <div className="mt-5 rounded-[12px] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.07)]">

          {/* Grid desktop — 4 por vez com transição */}
          <div className="hidden md:grid md:grid-cols-4 md:gap-4">
            {categoriasDaPagina.map((category) => (
              <CategoryCard key={category.label} {...category} />
            ))}
          </div>

          {/* Carrossel mobile */}
          <div className="md:hidden">
            <div className="mb-3 flex items-center justify-between gap-3">
              <button
                aria-label="Ver categorias anteriores"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d7e8d4] bg-white text-[#167307]"
                onClick={() => scrollByAmount(-1)}
                type="button"
              >
                <FiChevronLeft size={18} />
              </button>
              <p className="text-[12px] text-[#476155]">Deslize para ver mais</p>
              <button
                aria-label="Ver próximas categorias"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d7e8d4] bg-white text-[#167307]"
                onClick={() => scrollByAmount(1)}
                type="button"
              >
                <FiChevronRight size={18} />
              </button>
            </div>
            <div
              ref={scrollRef}
              className="flex gap-3 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {categories.map((category) => (
                <div key={category.label} className="w-[200px] shrink-0">
                  <CategoryCard {...category} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;