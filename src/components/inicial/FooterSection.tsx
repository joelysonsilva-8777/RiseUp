const footerSections = [
  {
    title: "Comprar",
    links: [
      "Celulares e smartphones",
      "Informatica",
      "Casa e decoracao",
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
      "Seguranca nas transacoes",
      "Planos para lojistas",
    ],
  },
  {
    title: "Ajuda",
    links: [
      "Central de ajuda",
      "Meus pedidos",
      "Pagamentos e cupons",
      "Privacidade e seguranca",
      "Fale com o suporte",
    ],
  },
];

const FooterSection = () => (
  <footer className="w-full border-t border-[#125d05] bg-[#167307] text-white">
    <div className="mx-auto grid w-[calc(100%-24px)] max-w-[1325px] gap-10 px-0 py-[40px] sm:w-[calc(100%-70px)] sm:py-[56px] lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
      <section className="max-w-[420px]">
        <span className="inline-flex rounded-[6px] bg-[#125d05] px-3 py-2">
          <img className="h-[37px] w-[135px] object-contain" alt="Acesse+" src="/Group-56.svg" />
        </span>
        <p className="mt-5 text-[15px] leading-[24px] text-[#ecf8e8]">
          Uma experiencia mais clara para comprar, vender e descobrir ofertas com mais
          autonomia, suporte e confianca.
        </p>
        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          <div className="border-l border-white/30 pl-4">
            <p className="text-[12px] uppercase tracking-[0.18em] text-[#d7e8d4]">Atendimento</p>
            <p className="mt-2 text-[16px] leading-[22px] text-white">Segunda a sabado, 8h as 20h</p>
          </div>
          <div className="border-l border-white/30 pl-4">
            <p className="text-[12px] uppercase tracking-[0.18em] text-[#d7e8d4]">Protecao</p>
            <p className="mt-2 text-[16px] leading-[22px] text-white">Pagamentos e compras seguras</p>
          </div>
        </div>
      </section>

      <nav aria-label="Links do rodape" className="grid gap-7 sm:grid-cols-3 lg:col-span-3">
        {footerSections.map((section) => (
          <div key={section.title}>
            <h2 className="text-[15px] font-semibold leading-[20px] text-white">{section.title}</h2>
            <ul className="mt-4 space-y-3">
              {section.links.map((link) => (
                <li key={link}>
                  <a
                    className="text-[14px] leading-[21px] text-[#ecf8e8] no-underline transition-colors hover:text-white"
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

    <div className="border-t border-white/20 bg-[#146806]">
      <div className="mx-auto flex w-[calc(100%-24px)] max-w-[1325px] flex-col gap-6 px-0 py-6 sm:w-[calc(100%-70px)] lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[14px] leading-[20px] text-[#ecf8e8]">Baixe o app e acompanhe suas ofertas onde estiver.</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <a
              className="inline-flex h-11 items-center rounded-full border border-[#d7e8d4] bg-[#ecf8e8] px-4 text-[13px] font-medium text-[#167307] no-underline transition-colors hover:bg-white"
              href="#"
            >
              Google Play
            </a>
            <a
              className="inline-flex h-11 items-center rounded-full border border-[#d7e8d4] bg-[#ecf8e8] px-4 text-[13px] font-medium text-[#167307] no-underline transition-colors hover:bg-white"
              href="#"
            >
              App Store
            </a>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-[13px] text-[#ecf8e8]">
          <span className="rounded-full border border-white/25 bg-white/10 px-4 py-2">Cartao</span>
          <span className="rounded-full border border-white/25 bg-white/10 px-4 py-2">Pix</span>
          <span className="rounded-full border border-white/25 bg-white/10 px-4 py-2">Boleto</span>
          <span className="rounded-full border border-white/25 bg-white/10 px-4 py-2">Criptografado</span>
        </div>
      </div>
    </div>

    <div className="border-t border-white/20 bg-[#125d05]">
      <div className="mx-auto flex w-[calc(100%-24px)] max-w-[1325px] flex-col gap-3 px-0 py-4 text-[12px] leading-[18px] text-[#d7e8d4] sm:w-[calc(100%-70px)] md:flex-row md:items-center md:justify-between">
        <p>&copy; 2026 Acesse+. Todos os direitos reservados.</p>
        <p>Comprar com clareza, vender com confianca e acessar com autonomia.</p>
      </div>
    </div>
  </footer>
);

export default FooterSection;
