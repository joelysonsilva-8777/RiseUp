import { useState, type FunctionComponent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCheck, FiMapPin, FiTrash2, FiTruck, FiX } from "react-icons/fi";
import { AppHeader } from "../../components/AppHeader";
import { useCart, type CartItem } from "../../context/CartContext";
import { formatCurrency } from "../../data/products";

type CartStep = "cart" | "address" | "delivery";

type TelaCarrinhoProps = {
  step?: CartStep;
};

const shippingValue = 7.9;

const CartProductRow = ({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: CartItem;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}) => (
  <div className="grid gap-4 border-b border-[#dfe3e8] py-5 md:grid-cols-[minmax(0,1fr)_110px_150px_120px_32px] md:items-center">
    <Link className="flex min-w-0 items-center gap-4 text-[#071735] no-underline" to={`/produto/${item.productId}`}>
      <img className="h-[86px] w-[76px] shrink-0 object-contain" alt={item.name} src={item.image} />
      <div className="min-w-0">
        <h2 className="max-w-[360px] text-[16px] leading-[22px] text-black">{item.name}</h2>
        <p className="mt-2 flex items-center text-[11px] leading-[14px] text-black">
          Vendido por {item.sellerName ?? "Acesse+"}
        </p>
      </div>
    </Link>

    <p className="text-[13px] leading-[16px] text-black">{formatCurrency(item.price)}</p>

    <div className="grid h-[36px] w-[132px] grid-cols-3 items-center border border-[#dfe3e8] bg-white text-center text-[14px] text-[#257a0d]">
      <button
        aria-label="Diminuir quantidade"
        className="h-full border-0 bg-transparent text-[18px] text-[#52606d]"
        onClick={() => onUpdateQuantity(item.quantity - 1)}
        type="button"
      >
        -
      </button>
      <span>{item.quantity}</span>
      <button
        aria-label="Aumentar quantidade"
        className="h-full border-0 bg-transparent text-[18px] text-[#257a0d]"
        onClick={() => onUpdateQuantity(item.quantity + 1)}
        type="button"
      >
        +
      </button>
    </div>

    <p className="text-[14px] leading-[18px] text-[#257a0d]">{formatCurrency(item.price * item.quantity)}</p>

    <button
      aria-label="Remover produto"
      className="flex h-9 w-9 items-center justify-center border-0 bg-transparent p-0 text-[#b42318]"
      onClick={onRemove}
      type="button"
    >
      <FiTrash2 size={18} />
    </button>
  </div>
);

const EmptyCart = () => (
  <section className="mx-auto max-w-[920px] px-4 py-14 text-center">
    <h1 className="text-[30px] leading-[38px] text-[#257a0d]">Seu carrinho esta vazio</h1>
    <p className="mx-auto mt-3 max-w-[520px] text-[14px] leading-[22px] text-[#52606d]">
      Adicione produtos da vitrine ou use a busca para testar o fluxo completo do carrinho.
    </p>
    <Link
      className="mt-8 inline-flex h-11 items-center justify-center bg-[#167307] px-5 text-[14px] text-white no-underline"
      to="/buscar"
    >
      Ver produtos
    </Link>
  </section>
);

const AddressModal = () => {
  const navigate = useNavigate();
  const [cep, setCep] = useState("12121-212");
  const [address, setAddress] = useState("Rua Barao de Boa Viagem");
  const [district, setDistrict] = useState("Agua Fria");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  return (
    <aside className="fixed inset-x-4 top-[104px] z-[70] mx-auto max-h-[calc(100vh-130px)] w-auto max-w-[430px] overflow-y-auto bg-white px-6 py-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)] md:right-[41px] md:left-auto md:mx-0">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[14px] leading-[18px] text-[#52606d]">Resumo do pedido</p>
          <h2 className="mt-1 text-[22px] leading-[27px] text-black">Cadastrar endereco</h2>
        </div>
        <Link className="text-black no-underline" to="/carrinho" aria-label="Fechar">
          <FiX size={22} />
        </Link>
      </div>

      <div className="mt-6 grid gap-4">
        <label className="block text-[14px] leading-[17px] text-black">
          CEP
          <input
            className="mt-2 h-[44px] w-full border-0 bg-[#f5f5f5] px-[14px] text-[15px] outline-none"
            onChange={(event) => setCep(event.target.value)}
            value={cep}
          />
        </label>
        <label className="block text-[14px] leading-[17px] text-black">
          Endereco
          <input
            className="mt-2 h-[44px] w-full border-0 bg-[#f5f5f5] px-[14px] text-[15px] outline-none"
            onChange={(event) => setAddress(event.target.value)}
            value={address}
          />
        </label>
        <label className="block text-[14px] leading-[17px] text-black">
          Bairro
          <input
            className="mt-2 h-[44px] w-full border-0 bg-[#f5f5f5] px-[14px] text-[15px] outline-none"
            onChange={(event) => setDistrict(event.target.value)}
            value={district}
          />
        </label>
        <label className="block text-[14px] leading-[17px] text-black">
          Nome completo
          <input
            className="mt-2 h-[44px] w-full border-0 bg-[#f5f5f5] px-[14px] text-[15px] outline-none"
            onChange={(event) => setName(event.target.value)}
            value={name}
          />
        </label>
        <label className="block text-[14px] leading-[17px] text-black">
          Telefone
          <input
            className="mt-2 h-[44px] w-full border-0 bg-[#f5f5f5] px-[14px] text-[15px] outline-none"
            onChange={(event) => setPhone(event.target.value)}
            value={phone}
          />
        </label>
      </div>

      <button
        className="mt-6 h-[42px] w-full border-0 bg-[#1b7d0c] text-[16px] leading-[20px] text-white"
        disabled={!address || !district || !name || !phone}
        onClick={() => navigate("/carrinho/entrega")}
        type="button"
      >
        Cadastrar
      </button>
    </aside>
  );
};

const DeliveryModal = ({ total, onFinish }: { total: number; onFinish: () => void }) => (
  <aside className="fixed inset-x-4 top-[104px] z-[70] mx-auto max-h-[calc(100vh-130px)] w-auto max-w-[430px] overflow-y-auto bg-white px-6 py-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)] md:right-[41px] md:left-auto md:mx-0">
    <Link className="absolute right-6 top-6 text-black no-underline" to="/carrinho" aria-label="Fechar">
      <FiX size={22} />
    </Link>
    <h2 className="mt-10 text-[22px] leading-[27px] text-black">Confira a entrega</h2>

    <div className="mt-8 flex items-start gap-3 bg-[#f5f5f5] px-4 py-4 text-[14px] leading-[20px] text-black">
      <FiMapPin className="mt-1 shrink-0 text-[#257a0d]" />
      <p>
        Rua Barao de Boa Viagem, 123
        <br />
        Agua Fria, Recife-PE
        <br />
        CEP 12121-212
      </p>
    </div>

    <button
      className="mt-5 flex w-full items-center justify-between bg-[#f5f5f5] px-4 py-4 text-left"
      type="button"
    >
      <span className="flex items-center gap-3">
        <FiTruck className="text-[#257a0d]" />
        <span>
          <strong className="block text-[15px] text-black">Entrega rapida</strong>
          <span className="block text-[13px] text-[#52606d]">Receba em ate 1h</span>
        </span>
      </span>
      <strong className="text-[14px] text-black">{formatCurrency(shippingValue)}</strong>
    </button>

    <div className="mt-6 border-t border-[#dfe3e8] pt-5">
      <p className="flex justify-between text-[16px] text-[#257a0d]">
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </p>
      <button
        className="mt-5 flex h-11 w-full items-center justify-center gap-2 border-0 bg-[#1b7d0c] text-[15px] text-white"
        onClick={onFinish}
        type="button"
      >
        <FiCheck />
        Finalizar pedido
      </button>
    </div>
  </aside>
);

const TelaCarrinho: FunctionComponent<TelaCarrinhoProps> = ({ step = "cart" }) => {
  const navigate = useNavigate();
  const { items, itemCount, subtotal, loading, updateQuantity, removeItem, clearCart } = useCart();
  const [finished, setFinished] = useState(false);
  const isModal = step !== "cart";
  const delivery = items.length > 0 ? shippingValue : 0;
  const total = subtotal + delivery;

  const finishOrder = async () => {
    await clearCart();
    setFinished(true);
    navigate("/carrinho");
  };

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-white font-['Montserrat',sans-serif] text-black [&_h1]:m-0 [&_h2]:m-0 [&_p]:m-0">
      <AppHeader showNav={false} />
      <div className={`relative min-h-[760px] ${isModal ? "bg-[#d9d9d9]" : "bg-white"}`}>
        {finished ? (
          <section className="mx-auto max-w-[920px] px-4 py-14 text-center">
            <h1 className="text-[30px] leading-[38px] text-[#257a0d]">Pedido finalizado</h1>
            <p className="mt-3 text-[14px] leading-[22px] text-[#52606d]">
              Obrigado pela compra. O carrinho foi limpo para o proximo teste.
            </p>
            <Link className="mt-8 inline-flex h-11 items-center justify-center bg-[#167307] px-5 text-[14px] text-white no-underline" to="/">
              Voltar para a loja
            </Link>
          </section>
        ) : items.length === 0 && !loading ? (
          <EmptyCart />
        ) : (
          <section className="mx-auto w-full max-w-[1320px] px-4 py-8 sm:px-8">
            <Link
              className="flex w-fit items-center gap-[8px] text-[14px] leading-[17px] text-[#257a0d] no-underline"
              to="/"
            >
              <FiArrowLeft size={22} />
              CONTINUAR COMPRANDO
            </Link>

            <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-[32px] leading-[39px] text-[#257a0d]">MEU CARRINHO</h1>
                <p className="mt-3 text-[12px] leading-[15px] text-[#257a0d]">
                  {loading ? "Carregando..." : `${itemCount} item(ns) no carrinho`}
                </p>
              </div>
              <button
                className="flex h-10 items-center gap-2 border border-[#b42318] bg-transparent px-4 text-[13px] text-[#b42318]"
                onClick={() => {
                  void clearCart();
                }}
                type="button"
              >
                <FiTrash2 />
                Esvaziar
              </button>
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_390px]">
              <section className="bg-[#f5f5f5] px-4 py-4 sm:px-7 sm:py-6">
                <div className="hidden grid-cols-[minmax(0,1fr)_110px_150px_120px_32px] border-b border-black pb-4 text-[13px] leading-[17px] text-black md:grid">
                  <span>PRODUTO</span>
                  <span>PRECO</span>
                  <span>QUANTIDADE</span>
                  <span>TOTAL</span>
                  <span />
                </div>

                {items.map((item) => (
                  <CartProductRow
                    item={item}
                    key={item.productId}
                    onRemove={() => {
                      void removeItem(item.productId);
                    }}
                    onUpdateQuantity={(quantity) => {
                      void updateQuantity(item.productId, quantity);
                    }}
                  />
                ))}
              </section>

              <aside className="bg-[#f5f5f5] px-6 py-6">
                <h2 className="text-center text-[14px] leading-[17px] text-black">
                  RESUMO DO SEU PEDIDO
                </h2>
                <div className="mt-6 flex flex-col gap-5 text-[14px] leading-[17px] text-black">
                  <p className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-[12px]">{formatCurrency(subtotal)}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Desconto</span>
                    <span className="text-[12px] text-red-500">-R$ 0,00</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Taxa de entrega</span>
                    <span className="text-[12px]">{formatCurrency(delivery)}</span>
                  </p>
                </div>
                <div className="mt-7 h-px w-full bg-black" />
                <div className="mt-6 flex items-center justify-between text-[#257a0d]">
                  <span className="text-[20px] leading-[25px]">Total da compra</span>
                  <span className="text-[20px] leading-[25px]">{formatCurrency(total)}</span>
                </div>
                <Link
                  className="mt-6 flex h-[42px] w-full items-center justify-center bg-[#1b7d0c] text-[18px] leading-[22px] text-white no-underline"
                  to="/carrinho/endereco"
                >
                  Finalizar compra
                </Link>

                <div className="mt-7 grid h-[40px] grid-cols-[1fr_88px] overflow-hidden bg-white">
                  <input
                    className="min-w-0 border-0 px-[17px] text-[12px] text-[#257a0d] outline-none placeholder:text-[#5d9a65]"
                    placeholder="Insira o codigo de cupom"
                  />
                  <button className="border-0 bg-[#1b7d0c] text-[14px] text-white" type="button">
                    APLICAR
                  </button>
                </div>
              </aside>
            </div>
          </section>
        )}

        {step === "address" ? <AddressModal /> : null}
        {step === "delivery" ? <DeliveryModal onFinish={() => void finishOrder()} total={total} /> : null}
      </div>
    </main>
  );
};

export default TelaCarrinho;
