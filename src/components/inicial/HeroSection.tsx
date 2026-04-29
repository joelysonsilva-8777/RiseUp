const HeroSection = () => (
  <section className="relative min-h-[320px] w-full overflow-visible bg-black sm:h-[390px]">
    <img className="absolute inset-0 h-full w-full object-cover" alt="" src="/image-132@2x.png" />
    <div className="absolute inset-0 bg-black/20" />
    <div className="absolute inset-x-0 bottom-0 z-[1] h-[140px] bg-gradient-to-b from-transparent via-[#f3f3f3]/45 to-[#f3f3f3]" />
    <div className="relative z-10 mx-auto flex min-h-[230px] w-full max-w-[720px] flex-col items-center px-4 pt-[24px] text-center text-white sm:px-0">
      <p className="text-[22px] leading-[28px] sm:text-[30px] sm:leading-[36px]">Bem-vindo a</p>
      <img className="mt-2 h-[54px] w-[220px] object-contain sm:h-[70px] sm:w-[254px]" alt="Acesse+" src="/Group-561.svg" />
      <p className="mt-4 max-w-[485px] text-[14px] leading-[20px] sm:mt-5 sm:text-[16px] sm:leading-[23px]">
        Descubra tecnologias acessíveis, compare soluções inclusivas, receba
        recomendações personalizadas e encontre autonomia com mais segurança.
      </p>
    </div>
  </section>
);

export default HeroSection;