import { FunctionComponent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppHeader } from "../components/AppHeader";

type CartStep = "cart" | "address" | "delivery";

type TelaCarrinhoProps = {
  step?: CartStep;
};

const TrashIcon = ({ color = "currentColor" }: { color?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M7 21c-.55 0-1.02-.2-1.41-.59A1.93 1.93 0 0 1 5 19V6H4V4h5V3h6v1h5v2h-1v13c0 .55-.2 1.02-.59 1.41A1.93 1.93 0 0 1 17 21H7ZM17 6H7v13h10V6ZM9 17h2V8H9v9Zm4 0h2V8h-2v9Z"
      fill={color}
    />
  </svg>
);

const BackArrow = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M19 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H19v-2Z"
      fill="#257a0d"
    />
  </svg>
);

const CartProductRow = ({ outlined = false }: { outlined?: boolean }) => (
  <div className="grid grid-cols-[370px_110px_160px_110px_24px] items-center">
    <div className="flex items-center gap-[17px]">
      <img
        className="h-[80px] w-[66px] object-contain"
        alt="Cadeira de rodas motorizada"
        src="/produto-cadeira-thumb-1.png"
      />
      <div>
        <h2 className="max-w-[292px] text-[20px] leading-[24px] text-black">
          Cadeira De Rodas Motorizada Dobrável,compacta E Leve Ortobras Modelo E20
        </h2>
        <p className="mt-[8px] flex items-center text-[11px] leading-[14px] text-black">
          Vendido e entregue por
          <img className="ml-1 h-[12px] w-[44px]" alt="Acesse+" src="/Group-57.svg" />
        </p>
      </div>
    </div>
    <p className="text-[11px] leading-[14px] text-black">R$ 249,00</p>
    <div
      className={
        outlined
          ? "grid w-[120px] grid-cols-3 items-center text-center"
          : "grid w-[120px] grid-cols-3 items-center text-center"
      }
    >
      <button
        className={
          outlined
            ? "mx-auto flex h-[28px] w-[28px] items-center justify-center rounded-full border border-black bg-transparent p-0 text-[18px]"
            : "mx-auto flex h-[28px] w-[28px] items-center justify-center rounded-full border-0 bg-white p-0 text-[18px] text-[#777]"
        }
        type="button"
      >
        -
      </button>
      <span
        className={
          outlined
            ? "mx-auto flex h-[24px] w-[48px] items-center justify-center rounded-full border border-black text-[13px]"
            : "mx-auto flex h-[24px] w-[48px] items-center justify-center rounded-full bg-white text-[13px]"
        }
      >
        2
      </span>
      <button
        className={
          outlined
            ? "mx-auto flex h-[28px] w-[28px] items-center justify-center rounded-full border border-black bg-transparent p-0 text-[18px]"
            : "mx-auto flex h-[28px] w-[28px] items-center justify-center rounded-full border-0 bg-white p-0 text-[18px] text-[#777]"
        }
        type="button"
      >
        +
      </button>
    </div>
    <p className="text-[12px] leading-[15px] text-[#257a0d]">R$ 249,00</p>
    <button className="border-0 bg-transparent p-0 text-black" type="button">
      <TrashIcon />
    </button>
  </div>
);

const CartContent = ({ dimmed = false }: { dimmed?: boolean }) => (
  <section className={dimmed ? "opacity-100" : ""}>
    <Link
      className="ml-[30px] mt-[11px] flex w-fit items-center gap-[5px] text-[14px] leading-[17px] text-[#257a0d] no-underline"
      to="/"
    >
      <BackArrow />
      CONTINUAR COMPRANDO
    </Link>

    <h1 className="ml-[31px] mt-[49px] text-[32px] leading-[39px] text-[#257a0d]">
      MEU CARRINHO
    </h1>
    <p className="ml-[30px] mt-[18px] text-[12px] leading-[15px] text-[#257a0d]">
      1 item no carrinho
    </p>

    <div className="mt-[29px] grid grid-cols-[860px_413px] gap-[59px] px-[30px]">
      <section className="h-[637px] rounded-[12px] bg-[#f5f5f5] px-[30px] pt-[34px]">
        <div className="grid grid-cols-[400px_130px_150px_110px] text-[14px] leading-[17px] text-black">
          <span>PRODUTO</span>
          <span>PREÇO</span>
          <span>QUANTIDADE</span>
          <span>TOTAL</span>
        </div>
        <div className="mt-[23px] h-px w-full bg-black" />

        <div className="mt-[37px]">
          <CartProductRow outlined={dimmed} />
        </div>

        <div className="mt-[45px] h-px w-full bg-black" />

        <button
          className="mt-[30px] flex h-[51px] w-[245px] items-center justify-center gap-[14px] border border-red-500 bg-transparent text-[13px] leading-[16px] text-red-500"
          type="button"
        >
          <TrashIcon color="red" />
          ESVAZIAR O MEU CARRINHO
        </button>
      </section>

      <aside className="h-[637px] rounded-[12px] bg-[#f5f5f5] px-[40px] pt-[11px]">
        <h2 className="text-center text-[14px] leading-[17px] text-black">
          RESUMO DO SEU PEDIDO
        </h2>
        <div className="mt-[19px] flex flex-col gap-[27px] text-[14px] leading-[17px] text-black">
          <p className="flex justify-between">
            <span>Subtotal</span>
            <span className="text-[12px]">R$ 498,00</span>
          </p>
          <p className="flex justify-between">
            <span>Desconto</span>
            <span className="text-[12px] text-red-500">-R$ 0,00</span>
          </p>
          <p className="flex justify-between">
            <span>Cupons</span>
            <span className="text-[12px] text-red-500">-R$ 0,00</span>
          </p>
          <p className="flex justify-between">
            <span>Taxa de entrega</span>
            <span className="text-[12px]">R$ 0,00</span>
          </p>
        </div>
        <div className="mt-[37px] h-px w-full bg-black" />
        <div className="mt-[23px] flex items-center justify-between text-[#257a0d]">
          <span className="text-[22px] leading-[27px]">Total da compra</span>
          <span className="text-[22px] leading-[27px]">R$ 498,00</span>
        </div>
        <Link
          className="mt-[25px] flex h-[39px] w-full items-center justify-center rounded-[3px] bg-[#1b7d0c] text-[21px] leading-[25px] text-white no-underline"
          to="/carrinho/endereco"
        >
          Finalizar compra
        </Link>

        <div className="mt-[41px] flex items-center gap-[9px] text-[14px] leading-[17px] text-[#257a0d]">
          <img className="h-6 w-6" alt="" src="/Vector.svg" />
          <span>Adicionar promoções</span>
        </div>

        <div className="mt-[16px] grid h-[40px] grid-cols-[1fr_88px] overflow-hidden rounded-[8px] bg-white">
          <input
            className="min-w-0 border-0 px-[17px] text-[12px] text-[#257a0d] outline-none placeholder:text-[#5d9a65]"
            placeholder="Insira o codigo de cupom"
          />
          <button className="border-0 bg-[#1b7d0c] text-[16px] text-white" type="button">
            APLICAR
          </button>
        </div>

        <p className="mt-[27px] flex justify-between text-[12px] leading-[15px] text-black">
          <span>Cupom</span>
          <button className="border-0 bg-transparent p-0 text-[12px] text-[#257a0d]" type="button">
            SELECIONAR
          </button>
        </p>
        <div className="mt-[28px] h-px w-full bg-black" />
        <p className="mt-[27px] flex justify-between text-[12px] leading-[15px] text-black">
          <span>Convenio</span>
          <button className="border-0 bg-transparent p-0 text-[12px] text-[#257a0d]" type="button">
            ALTERAR
          </button>
        </p>
      </aside>
    </div>
  </section>
);

const AddressModal = () => {
  const navigate = useNavigate();

  return (
    <aside className="absolute right-[41px] top-[37px] h-[767px] w-[410px] rounded-[8px] bg-white px-[45px] pt-[22px]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[16px] leading-[20px] text-black">Resumo do pedido</p>
          <h2 className="mt-[8px] text-[22px] leading-[27px] text-black">Cadastrar endereço</h2>
        </div>
        <Link className="text-black no-underline" to="/carrinho" aria-label="Fechar">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" />
          </svg>
        </Link>
      </div>

      <p className="mt-[8px] text-[15px] leading-[19px] text-[#333]">
        Digite um CEP para buscar um endereço
      </p>
      <label className="mt-[28px] block text-[14px] leading-[17px] text-black">
        Insira o CEP
        <input
          className="mt-[5px] h-[44px] w-full rounded-[9px] border-0 bg-[#f5f5f5] px-[18px] text-[16px] outline-none"
          defaultValue="12121-212"
        />
      </label>

      <div className="mt-[16px] flex items-center gap-[12px] text-[15px] leading-[18px] text-[#333]">
        <img className="h-6 w-6" alt="" src="/Location-Icon.svg" />
        <p>
          Rua Barão de Boa Viagem
          <br />
          Água Fria, Recife-PE
        </p>
      </div>

      <label className="mt-[13px] block text-[15px] leading-[18px] text-black">
        Endereço
        <input
          className="mt-[9px] h-[44px] w-full rounded-[9px] border-0 bg-[#f5f5f5] px-[14px] text-[15px] outline-none"
          defaultValue="Rua Barão de Boa Viagem"
        />
      </label>
      <label className="mt-[12px] block text-[15px] leading-[18px] text-black">
        Bairro
        <input
          className="mt-[9px] h-[43px] w-full rounded-[9px] border-0 bg-[#f5f5f5] px-[14px] text-[15px] outline-none"
          defaultValue="Cajuliro"
        />
      </label>
      <label className="mt-[10px] block text-[15px] leading-[18px] text-black">
        Complemento (opicional)
        <input className="mt-[7px] h-[42px] w-full rounded-[9px] border-0 bg-[#f5f5f5] px-[14px] outline-none" />
      </label>
      <p className="mt-[2px] text-[12px] leading-[15px] text-black">
        Bloco, apartamento, conjunto...
      </p>
      <label className="mt-[18px] block text-[15px] leading-[18px] text-black">
        Nome completo
        <input className="mt-[13px] h-[43px] w-full rounded-[9px] border-0 bg-[#f5f5f5] px-[14px] outline-none" />
      </label>
      <label className="mt-[27px] block text-[15px] leading-[18px] text-black">
        Telefone de contato
        <input className="mt-[9px] h-[42px] w-full rounded-[9px] border-0 bg-[#f5f5f5] px-[14px] outline-none" />
      </label>

      <button
        className="absolute bottom-[22px] left-[45px] right-[45px] h-[42px] rounded-[22px] border-0 bg-[#1b7d0c] text-[16px] leading-[20px] text-white"
        type="button"
        onClick={() => navigate("/carrinho/entrega")}
      >
        Cadastrar
      </button>
    </aside>
  );
};

const DeliveryOption = ({
  title,
  subtitle,
  price,
  icon,
}: {
  title: string;
  subtitle: string;
  price: string;
  icon?: React.ReactNode;
}) => (
  <button
    className="flex h-[75px] w-full items-center justify-between rounded-[12px] border-0 bg-[#f5f5f5] px-[12px] text-left"
    type="button"
  >
    <span className="flex items-center gap-[8px]">
      <span className="w-[18px]">{icon}</span>
      <span>
        <strong className="block text-[16px] leading-[18px] text-black">{title}</strong>
        <span className="block text-[15px] leading-[18px] text-black">{subtitle}</span>
      </span>
    </span>
    <span className="flex items-center gap-[12px]">
      <strong className="text-[15px] leading-[18px] text-black">{price}</strong>
      <svg width="12" height="22" viewBox="0 0 12 22" fill="none" aria-hidden="true">
        <path d="m1 1 9 10-9 10" stroke="black" strokeLinecap="round" strokeWidth="3" />
      </svg>
    </span>
  </button>
);

const DeliveryModal = () => (
  <aside className="absolute right-[34px] top-[95px] h-[613px] w-[410px] rounded-[14px] bg-white px-[49px] pt-[25px]">
    <Link className="absolute right-[30px] top-[25px] text-black no-underline" to="/carrinho" aria-label="Fechar">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" />
      </svg>
    </Link>
    <h2 className="mt-[51px] text-[20px] leading-[24px] text-black">Confira o endereço</h2>

    <div className="mt-[42px] flex h-[114px] items-center justify-between rounded-[12px] bg-[#f5f5f5] px-[12px]">
      <p className="text-[15px] leading-[18px] text-black">
        <strong>Jose da Silva</strong>
        <br />
        Rua Barão de Boa Viagem, 123
        <br />
        Água Fria,12121-212
        <br />
        Recife-PE
      </p>
      <Link className="text-[15px] leading-[18px] text-red-600 no-underline" to="/carrinho/endereco">
        Alterar
      </Link>
    </div>

    <div className="mt-[42px] flex flex-col gap-[14px]">
      <DeliveryOption
        icon={
          <svg width="22" height="18" viewBox="0 0 24 20" fill="none" aria-hidden="true">
            <path d="M3 10h7M1 7h8M5 13h5" stroke="black" strokeLinecap="round" strokeWidth="2" />
            <circle cx="15" cy="10" r="7" stroke="black" strokeWidth="2" />
            <path d="M15 6v5l3 2" stroke="black" strokeLinecap="round" strokeWidth="2" />
          </svg>
        }
        title="Entrega rápida"
        subtitle="Receba em até 1h"
        price="R$ 7,90"
      />
      <DeliveryOption
        icon={
          <svg width="22" height="20" viewBox="0 0 24 22" fill="none" aria-hidden="true">
            <rect x="3" y="6" width="18" height="13" rx="1" stroke="black" strokeWidth="2" />
            <path d="M7 3v5M17 3v5M3 11h18" stroke="black" strokeLinecap="round" strokeWidth="2" />
            <circle cx="16.5" cy="15.5" r="1.5" fill="black" />
          </svg>
        }
        title="Entrega agendada"
        subtitle="A partir de hoje, 13h - 21h"
        price="R$ 7,90"
      />
      <DeliveryOption title="Normal" subtitle="Receba em até 1 dia Útil" price="R$ 6,90" />
    </div>
  </aside>
);

const TelaCarrinho: FunctionComponent<TelaCarrinhoProps> = ({ step = "cart" }) => {
  const isModal = step !== "cart";

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-white font-['Montserrat',sans-serif] text-black [&_h1]:m-0 [&_h2]:m-0 [&_p]:m-0">
      <AppHeader showNav={false} />
      <div className={`relative min-h-[848px] ${isModal ? "bg-[#ccc]" : "bg-white"}`}>
        <CartContent dimmed={isModal} />
        {step === "address" ? <AddressModal /> : null}
        {step === "delivery" ? <DeliveryModal /> : null}
      </div>
    </main>
  );
};

export default TelaCarrinho;
