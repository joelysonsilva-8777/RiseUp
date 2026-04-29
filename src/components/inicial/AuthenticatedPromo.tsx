const AuthenticatedPromo = () => (
  <article className="relative min-h-[280px] overflow-hidden rounded-[10px] bg-black text-white shadow-[0_2px_8px_rgba(0,0,0,0.07)]">
    <img
      className="absolute inset-0 h-full w-full object-cover object-[78%_center]"
      alt=""
      src="/Fundo.png"
    />
    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.9)_0%,rgba(0,0,0,0.8)_38%,rgba(0,0,0,0.42)_64%,rgba(0,0,0,0.12)_100%)]" />
    <div className="relative z-10 grid min-h-[280px] gap-6 px-5 py-5 sm:px-6 sm:py-6 [@media(min-width:1051px)]:grid-cols-[minmax(0,1fr)_minmax(380px,460px)] [@media(min-width:1051px)]:items-start [@media(min-width:1051px)]:px-8 [@media(min-width:1051px)]:py-7">
      <div className="max-w-[480px]">
        <h2 className="text-[26px] leading-[32px] text-white sm:text-[30px] sm:leading-[36px]">
          Saiba mais sobre acessibilidade
        </h2>
        <p className="mt-4 max-w-[420px] text-[14px] leading-[22px] text-white/80 sm:text-[15px] sm:leading-[24px]">
          Veja um conteúdo curto sobre recursos e soluções que tornam a experiência mais clara e acessível.
        </p>

        <div className="mt-6 inline-flex rounded-full bg-[#167307] px-4 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.28)]">
          <img className="h-[24px] w-auto object-contain" alt="Acesse+" src="/Group-561.svg" />
        </div>
      </div>

      <div className="w-full max-w-[460px] justify-self-end self-start [@media(min-width:1051px)]:ml-auto">
        <div className="overflow-hidden rounded-[18px] border border-white/15 bg-black/35 shadow-[0_18px_50px_rgba(0,0,0,0.38)] backdrop-blur-[2px]">
          <video
            className="block aspect-video h-auto w-full bg-black"
            controls
            playsInline
            preload="metadata"
            src="/Elizabeth.mp4"
          >
            Seu navegador não suporta a reprodução de vídeo.
          </video>
        </div>
      </div>
    </div>
  </article>
);

export default AuthenticatedPromo;