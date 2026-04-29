const HeroSection = () => (
  <section className="relative h-[390px] w-full overflow-visible bg-black">
    <img className="absolute inset-0 h-full w-full object-cover" alt="" src="/image-132@2x.png" />
    <div className="absolute inset-0 bg-black/20" />
    <div className="absolute inset-x-0 bottom-0 z-[1] h-[140px] bg-gradient-to-b from-transparent via-[#f3f3f3]/45 to-[#f3f3f3]" />
    <div className="relative z-10 mx-auto flex h-[230px] w-full max-w-[720px] flex-col items-center pt-[24px] text-center text-white">
      <p className="text-[30px] leading-[36px]">Bem-vindo a</p>
      <img className="mt-2 h-[70px] w-[254px] object-contain" alt="Acesse+" src="/Group-561.svg" />
      <p className="mt-5 max-w-[485px] text-[16px] leading-[23px]">
        Descubra tecnologias acessíveis, compare soluções inclusivas, receba
        recomendações personalizadas e encontre autonomia com mais segurança.
      </p>
    </div>
  </section>
);

export default HeroSection;