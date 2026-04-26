import { type FunctionComponent } from "react";
import { Link } from "react-router-dom";
import { AppHeader } from "../components/AppHeader";

const products = [
  { name: "Samsung Galaxy A5 - Branco", oldPrice: "R$ 750", price: "R$ 700" },
  { name: "Galaxy tap a11", price: "R$ 850" },
  { name: "iPhone 17 Pro Max 512GB - LACRADO", price: "R$ 11.850" },
  { name: "Redmi note 14 pro+ 256 gb", price: "R$ 1.200" },
  { name: "Redmi note 14 pro+ 256 gb", price: "R$ 1.200" },
  { name: "Redmi note 14 pro+ 256 gb", price: "R$ 1.200" },
];

const topOffers = products.slice(0, 4);

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
    description:
      "Entre para salvar favoritos, comprar mais rápido e ver ofertas.",
    href: "/login",
  },
];

const signupBenefits = [
  {
    icon: "/Us-Dollar-Circled@2x.png",
    title: "Descontos",
    description: "Promoções e itens com melhor custo-benefício.",
  },
  {
    icon: "/Chat-Room@2x.png",
    title: "Pagamento",
    description: "Meios aceitos no site e suporte quando precisar.",
  },
  {
    icon: "/Heart@2x.png",
    title: "Favoritos",
    description: "Salve anúncios e acompanhe o que gostou.",
  },
  {
    icon: "/Increase@2x.png",
    title: "Autonomia",
    description: "Crie sua conta para comprar com confiança.",
  },
];

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

const footerSections = [
  {
    title: "Comprar",
    links: [
      "Celulares e smartphones",
      "Informática",
      "Casa e decoração",
      "Esportes e fitness",
      "Moda e beleza",
    ],
  },
  {
    title: "Vender",
    links: [
      "Anunciar agora",
      "Criar conta",
      "Dicas para vender melhor",
      "Segurança nas transações",
      "Planos para lojistas",
    ],
  },
  {
    title: "Ajuda",
    links: [
      "Central de ajuda",
      "Meus pedidos",
      "Pagamentos e cupons",
      "Privacidade e segurança",
      "Fale com o suporte",
    ],
  },
];

const ProductCard = ({
  name,
  oldPrice,
  price,
}: {
  name: string;
  oldPrice?: string;
  price: string;
}) => (
  <article className="min-w-0">
    <Link className="block text-[#071735] no-underline" to="/produto">
      <div className="h-[168px] w-full rounded-[5px] bg-white" />
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

const ProductSection = ({
  className = "mt-[70px]",
}: {
  className?: string;
}) => (
  <section className={`mx-auto w-[calc(100%-70px)] max-w-[1312px] px-0 ${className}`}>
    <h2 className="text-[23px] leading-[28px] text-[#071735]">
      Baixaram de preço em Eletrônicos e celulares
    </h2>
    <div className="mt-4 grid grid-cols-6 gap-x-[31px]">
      {products.map((product, index) => (
        <ProductCard key={`${product.name}-${index}`} {...product} />
      ))}
    </div>
  </section>
);

const Inicial: FunctionComponent = () => {
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#f3f3f3] font-['Montserrat',sans-serif] text-[#071735] [&_h1]:m-0 [&_h2]:m-0 [&_h3]:m-0 [&_p]:m-0">
      <AppHeader />

      <section className="relative h-[320px] w-full overflow-visible bg-black">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          alt=""
          src="/image-132@2x.png"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 mx-auto flex h-[230px] w-full max-w-[720px] flex-col items-center pt-[24px] text-center text-white">
          <p className="text-[30px] leading-[36px]">Bem-vindo a</p>
          <img
            className="mt-2 h-[70px] w-[254px] object-contain"
            alt="Acesse+"
            src="/Group-561.svg"
          />
          <p className="mt-5 max-w-[485px] text-[16px] leading-[23px]">
            Descubra tecnologias acessíveis, compare soluções inclusivas, receba
            recomendações personalizadas e encontre autonomia com mais segurança.
          </p>
        </div>
      </section>

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

      <section
        className="mx-auto mt-[23px] grid w-[calc(100%-70px)] max-w-[1312px] grid-cols-[minmax(320px,428px)_minmax(0,1fr)] gap-[62px]"
        id="ofertas"
      >
        <article className="h-[438px] overflow-hidden rounded-[10px] bg-white px-[31px] pt-[20px]">
          <h1 className="text-[33px] leading-[40px] text-[#071735]">Oferta do dia</h1>
          <div className="mx-auto mt-4 h-[211px] w-[243px] rounded-[5px] bg-[#d9d9d9]" />
          <h2 className="mt-[13px] text-[21px] leading-[26px] text-[#071735]">
            Samsung Galaxy A5 - Branco
          </h2>
          <p className="mt-[18px] text-[17px] leading-[20px] text-[#8493ad]">R$ 750</p>
          <p className="text-[32px] leading-[38px] text-[#071735]">R$ 700</p>
          <p className="mt-[20px] flex flex-wrap gap-x-[31px] gap-y-1 text-[21px] leading-[25px] text-[#0b1020]">
            <span>Hoje, 16:46</span>
            <span>Paulista - PE</span>
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

      <ProductSection className="mt-[38px]" />

      <section
        className="mx-auto mt-[56px] w-[calc(100%-70px)] max-w-[1312px] overflow-hidden rounded-[24px] border border-white/70 bg-white px-6 py-8 shadow-[0_2px_8px_rgba(0,0,0,0.07)] md:px-10 md:py-10"
        id="cupons"
      >
        <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
          <div>
            <h2 className="max-w-[640px] text-[30px] leading-[38px] text-[#071735] md:text-[34px] md:leading-[41px]">
              Crie sua conta Acesse+ e aproveite todas as vantagens
            </h2>
            <p className="mt-4 max-w-[620px] text-[15px] leading-[24px] text-[#476155]">
              Entre para salvar favoritos, acompanhar ofertas, comprar com mais confiança e usar uma
              experiência mais clara do início ao fim.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {signupBenefits.map((benefit) => (
              <article
                className="flex min-h-[162px] flex-col items-start gap-3 rounded-[20px] bg-[#f6f8f5] px-4 py-4"
                key={benefit.title}
              >
                <span className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-full bg-white">
                  <img className="h-7 w-7 object-contain" alt="" src={benefit.icon} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-[15px] leading-[19px] text-[#071735]">{benefit.title}</h3>
                  <p className="mt-1 text-[12px] leading-[17px] text-[#476155]">{benefit.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-start">
          <Link
            className="inline-flex h-[53px] items-center rounded-[27px] bg-[#ee3544] px-[25px] text-[18px] leading-[24px] text-white no-underline transition-colors hover:bg-[#d9303f]"
            to="/cadastro"
          >
            Criar conta gratuitamente
          </Link>
        </div>
      </section>

      <ProductSection />
      <ProductSection />
      <ProductSection />

      <section className="mt-[78px] w-full bg-[#e8e8e8] pb-[53px] pt-[16px]" id="categorias">
        <div className="mx-auto w-[calc(100%-70px)] max-w-[1325px]">
          <h2 className="text-[25px] leading-[30px] text-[#071735]">Categorias</h2>
          <div className="mt-3 grid grid-cols-[minmax(220px,274px)_repeat(7,minmax(0,1fr))] gap-x-[31px] gap-y-[17px]">
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

      <footer className="mt-[78px] w-full border-t border-white/8 bg-[#0f1e18] text-white">
        <div className="mx-auto grid w-[calc(100%-70px)] max-w-[1325px] gap-10 px-0 py-[56px] lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <section className="max-w-[420px]">
            <img className="h-[42px] w-[155px] object-contain" alt="Acesse+" src="/Group-561.svg" />
            <p className="mt-5 text-[15px] leading-[24px] text-white/78">
              Uma experiência mais clara para comprar, vender e descobrir ofertas com mais
              autonomia, suporte e confiança.
            </p>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <div className="border-l border-white/15 pl-4">
                <p className="text-[12px] uppercase tracking-[0.18em] text-white/55">Atendimento</p>
                <p className="mt-2 text-[16px] leading-[22px] text-white">Segunda a sábado, 8h às 20h</p>
              </div>
              <div className="border-l border-white/15 pl-4">
                <p className="text-[12px] uppercase tracking-[0.18em] text-white/55">Proteção</p>
                <p className="mt-2 text-[16px] leading-[22px] text-white">Pagamentos e compras seguras</p>
              </div>
            </div>
          </section>

          <nav aria-label="Links do rodapé" className="grid gap-7 sm:grid-cols-3 lg:col-span-3">
            {footerSections.map((section) => (
              <div key={section.title}>
                <h2 className="text-[15px] font-semibold leading-[20px] text-white">{section.title}</h2>
                <ul className="mt-4 space-y-3">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a
                        className="text-[14px] leading-[21px] text-white/72 no-underline transition-colors hover:text-[#b2edb8]"
                        href="#"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto flex w-[calc(100%-70px)] max-w-[1325px] flex-col gap-6 px-0 py-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[14px] leading-[20px] text-white/62">Baixe o app e acompanhe suas ofertas onde estiver.</p>
              <div className="mt-3 flex flex-wrap gap-3">
                <a
                  className="inline-flex h-11 items-center rounded-full border border-[#b2edb8]/20 bg-[#b2edb8]/10 px-4 text-[13px] font-medium text-white no-underline transition-colors hover:bg-[#b2edb8]/16"
                  href="#"
                >
                  Google Play
                </a>
                <a
                  className="inline-flex h-11 items-center rounded-full border border-[#b2edb8]/20 bg-[#b2edb8]/10 px-4 text-[13px] font-medium text-white no-underline transition-colors hover:bg-[#b2edb8]/16"
                  href="#"
                >
                  App Store
                </a>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 text-[13px] text-white/58">
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">Cartão</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">Pix</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">Boleto</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">Criptografado</span>
            </div>
          </div>
        </div>

        <div className="border-t border-white/8 bg-[#0b1712]">
          <div className="mx-auto flex w-[calc(100%-70px)] max-w-[1325px] flex-col gap-3 px-0 py-4 text-[12px] leading-[18px] text-white/48 md:flex-row md:items-center md:justify-between">
            <p>© 2026 Acesse+. Todos os direitos reservados.</p>
            <p>Comprar com clareza, vender com confiança e acessar com autonomia.</p>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Inicial;
