import { FunctionComponent } from "react";
import { Link } from "react-router-dom";
import { AppHeader } from "../components/AppHeader";

const thumbs = [
  "/produto-cadeira-thumb-1.png",
  "/produto-cadeira-thumb-2.png",
  "/produto-cadeira-thumb-3.png",
  "/produto-cadeira-thumb-4.png",
  "/produto-cadeira-thumb-5.png",
];

const TelaProduto: FunctionComponent = () => {
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-white font-['Montserrat',sans-serif] text-black [&_h1]:m-0 [&_h2]:m-0 [&_p]:m-0">
      <AppHeader />

      <section className="mx-auto grid w-full max-w-[1230px] grid-cols-[565px_520px] gap-[63px] pt-[54px]">
        <div className="min-w-0">
          <div className="flex h-[500px] items-center justify-center">
            <img
              className="h-[445px] w-[455px] object-contain"
              alt="Cadeira de rodas motorizada"
              src="/produto-cadeira-main.png"
            />
          </div>
          <div className="mt-[17px] flex items-center justify-center gap-[36px]">
            {thumbs.map((thumb) => (
              <button
                className="flex h-[70px] w-[74px] items-center justify-center border-0 bg-transparent p-0"
                type="button"
                key={thumb}
              >
                <img className="max-h-full max-w-full object-contain" alt="" src={thumb} />
              </button>
            ))}
          </div>
        </div>

        <div className="min-w-0 pt-[1px]">
          <h1 className="max-w-[560px] text-[22px] leading-[26px] text-black">
            Cadeira De Rodas Motorizada Dobrável,compacta E Leve Ortobras Modelo E20
          </h1>
          <div className="mt-[8px] h-[20px] w-[120px] rounded-[4px] bg-[#f5f5f5]" />

          <div className="mt-[24px] flex items-center gap-[12px]">
            <span className="text-[12px] leading-[15px] text-[#333]">COD 10031977</span>
            <button
              className="flex h-[30px] items-center gap-[8px] rounded-[4px] border-0 bg-[#f5f5f5] px-[9px] text-[12px] leading-[15px] text-[#257a0d]"
              type="button"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z"
                  stroke="#5d9a65"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              Seja o primeiro a avaliar
            </button>
          </div>

          <button
            className="mt-[23px] border-0 bg-transparent p-0 text-[16px] leading-[20px] text-[#257a0d]"
            type="button"
          >
            Mais informações
          </button>

          <section className="mt-[68px] flex h-[70px] items-center justify-between rounded-[8px] bg-[#f5f5f5] px-[58px]">
            <span className="text-[12px] leading-[15px] text-[#257a0d]">
              Selecione a quantidade
            </span>
            <div className="grid h-[44px] w-[124px] grid-cols-3 items-center rounded-[5px] border border-[#257a0d] bg-white text-center text-[18px] text-[#257a0d]">
              <button className="border-0 bg-transparent text-[20px] text-[#ccc]" type="button">
                -
              </button>
              <span>1</span>
              <button className="border-0 bg-transparent text-[22px] text-[#257a0d]" type="button">
                +
              </button>
            </div>
          </section>

          <section className="mt-[16px] rounded-[8px] bg-[#f5f5f5] px-[55px] py-[16px]">
            <p className="text-[24px] leading-[29px] text-black">R$ 15.053,77</p>
            <p className="mt-[11px] text-[13px] leading-[16px] text-[#5d9a65]">
              Ou 5x deR$ 3.010,76
            </p>
            <Link
              className="mt-[15px] flex h-[40px] w-full items-center justify-center rounded-[4px] bg-[#1b7d0c] text-[13px] leading-[16px] text-white no-underline"
              to="/carrinho"
            >
              ADICIONAR AO CARRINHO
            </Link>
          </section>

          <section className="mt-[20px] rounded-[8px] bg-[#f5f5f5] px-[19px] py-[16px]">
            <h2 className="text-[16px] leading-[20px] text-[#257a0d]">
              Calcule o frete e o prazo de entrega
            </h2>
            <input
              className="mt-[16px] h-[57px] w-full rounded-[5px] border-0 bg-white px-[24px] text-[16px] outline-none placeholder:text-black"
              placeholder="Digite o CEP*"
              type="text"
            />
            <button
              className="mt-[23px] border-0 bg-transparent p-0 text-[12px] leading-[15px] text-[#257a0d]"
              type="button"
            >
              Não sei meu CEP
            </button>
          </section>
        </div>
      </section>
    </main>
  );
};

export default TelaProduto;
