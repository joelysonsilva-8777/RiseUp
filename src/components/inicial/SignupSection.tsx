import { Link } from "react-router-dom";

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

const SignupSection = () => (
  <>
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
  </>
);

export default SignupSection;