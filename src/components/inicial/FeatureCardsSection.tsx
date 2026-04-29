import { Link } from "react-router-dom";

type FeatureCard = {
  icon: string;
  label: string;
  description: string;
  href?: string;
};

const featureCards: FeatureCard[] = [
  {
    icon: "/Empty-Box@2x.png",
    label: "Mostrar Produtos",
    description: "Produtos rápidos, com desconto e entrega ágil.",
    href: "#ofertas",
  },
  {
    icon: "/Wallet@2x.png",
    label: "Mostrar Meios",
    description: "Meios de pagamento aceitos no site.",
    href: "#cupons",
  },
  {
    icon: "/Market-Square@2x.png",
    label: "Mostrar Produtos",
    description: "Itens baratos, moda e boas ofertas.",
    href: "#categorias",
  },
  {
    icon: "/Browse-page@2x.png",
    label: "Entrar na sua Conta",
    description: "Entre para salvar favoritos, comprar mais rápido e ver ofertas.",
    href: "/login",
  },
];

const FeatureCardsSection = () => (
  <section className="relative z-20 mx-auto -mt-[75px] grid w-[calc(100%-24px)] max-w-[830px] grid-cols-2 gap-3 sm:w-[calc(100%-48px)] sm:grid-cols-4 sm:gap-[48px]">
    {featureCards.map((card) => (
      <article
        className="flex min-h-[168px] flex-col items-center rounded-[10px] bg-white px-3 pt-[14px] shadow-[0_1px_0_rgba(0,0,0,0.03)] sm:h-[194px] sm:px-6 sm:pt-[18px]"
        key={card.label}
      >
        <img className="h-[50px] w-[50px] object-contain sm:h-[60px] sm:w-[60px]" alt="" src={card.icon} />
        <h3 className="mt-3 text-center text-[13px] leading-[17px] text-[#071735] sm:text-[15px] sm:leading-[20px]">
          {card.label}
        </h3>
        <p className="mt-2 min-h-[26px] text-center text-[9px] leading-[12px] text-[#476155]">
          {card.description}
        </p>
        {card.href ? (
          card.href.startsWith("#") ? (
            <a
              className="mt-auto mb-[10px] flex h-[21px] w-full items-center justify-center rounded-[4px] bg-[#b2edb8] text-[11px] leading-[14px] text-[#08c00e] no-underline sm:mb-[12px] sm:w-[131px]"
              href={card.href}
            >
              {card.label}
            </a>
          ) : (
            <Link
              className="mt-auto mb-[10px] flex h-[21px] w-full items-center justify-center rounded-[4px] bg-[#b2edb8] text-[11px] leading-[14px] text-[#08c00e] no-underline sm:mb-[12px] sm:w-[131px]"
              to={card.href}
            >
              {card.label}
            </Link>
          )
        ) : null}
      </article>
    ))}
  </section>
);

export default FeatureCardsSection;