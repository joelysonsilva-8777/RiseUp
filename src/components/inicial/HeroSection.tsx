import { useEffect, useMemo, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const heroSlides = [
  {
    alt: "Tecnologia acessivel em destaque",
    src: "/image-132@2x.png",
  },
  {
    alt: "Produto acessivel em destaque 1",
    src: "/ArchiveSlide(1).png",
  },
  {
    alt: "Produto acessivel em destaque 2",
    src: "/ArchiveSlide(2).png",
  },
  {
    alt: "Produto acessivel em destaque 3",
    src: "/ArchiveSlide(3).png",
  },
  {
    alt: "Produto acessivel em destaque 4",
    src: "/ArchiveSlide(4).png",
  },
  {
    alt: "Produto acessivel em destaque 5",
    src: "/ArchiveSlide(5).png",
  },
];

const slideDelay = 5600;
const holdDelay = 9200;

const HeroSection = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [shouldHold, setShouldHold] = useState(false);
  const slidesCount = heroSlides.length;

  const activeSlideLabel = useMemo(() => `${activeSlide + 1} de ${slidesCount}`, [activeSlide, slidesCount]);

  useEffect(() => {
    if (isHovering) {
      return undefined;
    }

    const timeout = window.setTimeout(
      () => {
        setActiveSlide((current) => (current + 1) % slidesCount);
        setShouldHold(false);
      },
      shouldHold ? holdDelay : slideDelay
    );

    return () => window.clearTimeout(timeout);
  }, [activeSlide, isHovering, shouldHold, slidesCount]);

  const goToSlide = (nextSlide: number) => {
    setActiveSlide((nextSlide + slidesCount) % slidesCount);
    setShouldHold(true);
  };

  return (
    <section
      aria-label="Destaques da Acesse+"
      className="relative min-h-[320px] w-full overflow-visible bg-black sm:h-[390px]"
      onMouseEnter={() => {
        setIsHovering(true);
        setShouldHold(true);
      }}
      onMouseLeave={() => {
        setIsHovering(false);
        setShouldHold(true);
      }}
    >
      <div className="absolute inset-0 overflow-hidden">
        {heroSlides.map((slide, index) => (
          <img
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out ${
              index === activeSlide ? "opacity-100" : "opacity-0"
            }`}
            alt={slide.alt}
            aria-hidden={index !== activeSlide}
            draggable={false}
            key={slide.src}
            src={slide.src}
          />
        ))}
      </div>

      <div className="absolute inset-0 bg-black/25" />
      <div className="absolute inset-x-0 bottom-0 z-[1] h-[140px] bg-gradient-to-b from-transparent via-[#f3f3f3]/45 to-[#f3f3f3]" />

      <button
        aria-label="Slide anterior"
        className="absolute left-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/35 bg-black/25 text-white shadow-[0_8px_22px_rgba(0,0,0,0.22)] backdrop-blur-sm transition-colors hover:bg-black/40 sm:flex"
        onClick={() => goToSlide(activeSlide - 1)}
        type="button"
      >
        <FiChevronLeft size={24} />
      </button>

      <button
        aria-label="Proximo slide"
        className="absolute right-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/35 bg-black/25 text-white shadow-[0_8px_22px_rgba(0,0,0,0.22)] backdrop-blur-sm transition-colors hover:bg-black/40 sm:flex"
        onClick={() => goToSlide(activeSlide + 1)}
        type="button"
      >
        <FiChevronRight size={24} />
      </button>

      {activeSlide === 0 ? (
        <div className="relative z-10 mx-auto flex min-h-[230px] w-full max-w-[720px] flex-col items-center px-4 pt-[24px] text-center text-white sm:px-0">
          <p className="text-[22px] leading-[28px] sm:text-[30px] sm:leading-[36px]">Bem-vindo a</p>
          <img className="mt-2 h-[54px] w-[220px] object-contain sm:h-[70px] sm:w-[254px]" alt="Acesse+" src="/Group-561.svg" />
          <p className="mt-4 max-w-[485px] text-[14px] leading-[20px] sm:mt-5 sm:text-[16px] sm:leading-[23px]">
            Descubra tecnologias acessiveis, compare solucoes inclusivas, receba
            recomendacoes personalizadas e encontre autonomia com mais seguranca.
          </p>
        </div>
      ) : null}

      <div className="absolute inset-x-0 bottom-[92px] z-20 flex items-center justify-center gap-2" aria-label={`Slide ${activeSlideLabel}`}>
        {heroSlides.map((slide, index) => (
          <button
            aria-label={`Ir para o slide ${index + 1} de ${slidesCount}`}
            className={`h-2.5 rounded-full transition-all ${
              index === activeSlide ? "w-7 bg-white" : "w-2.5 bg-white/55 hover:bg-white/85"
            }`}
            key={slide.src}
            onClick={() => goToSlide(index)}
            type="button"
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
