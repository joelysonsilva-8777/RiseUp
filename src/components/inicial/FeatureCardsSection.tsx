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
  <section className="relative z-20 mx-auto -mt-[75px] grid w-[calc(100%-48px)] max-w-[830px] grid-cols-4 gap-[48px]">
    {featureCards.map((card) => (
      <article
        className="flex h-[194px] flex-col items-center rounded-[10px] bg-white px-6 pt-[18px] shadow-[0_1px_0_rgba(0,0,0,0.03)]"
        key={card.label}
      >
        <img className="h-[60px] w-[60px] object-contain" alt="" src={card.icon} />
        <h3 className="mt-3 text-[15px] leading-[20px] text-[#071735]">{card.label}</h3>
        <p className="mt-2 min-h-[26px] text-center text-[9px] leading-[12px] text-[#476155]">
          {card.description}
        </p>
        {card.href ? (
          card.href.startsWith("#") ? (
            <a
              className="mt-auto mb-[12px] flex h-[21px] w-[131px] items-center justify-center rounded-[4px] bg-[#b2edb8] text-[11px] leading-[14px] text-[#08c00e] no-underline"
              href={card.href}
            >
              {card.label}
            </a>
          ) : (
            <Link
              className="mt-auto mb-[12px] flex h-[21px] w-[131px] items-center justify-center rounded-[4px] bg-[#b2edb8] text-[11px] leading-[14px] text-[#08c00e] no-underline"
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