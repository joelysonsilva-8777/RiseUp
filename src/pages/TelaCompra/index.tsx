import { type FormEvent, type FunctionComponent, type ReactNode, useMemo, useState } from "react";
import { addDoc, collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { FiCreditCard, FiHeadphones, FiSmartphone, FiX } from "react-icons/fi";
import { AppHeader } from "../../components/AppHeader";
import FooterSection from "../../components/inicial/FooterSection";
import ProductsSection from "../../components/inicial/ProductsSection";
import { useAuth } from "../../context/AuthContext";
import { useCart, type CartItem } from "../../context/CartContext";
import { formatCurrency } from "../../data/products";
import { firestore } from "../../firebase/firebase";

type PaymentMethod = "pix" | "apple" | "google" | "credit";
type WalletMethod = Extract<PaymentMethod, "apple" | "google">;
type DialogMode = "card" | "coupon" | null;

type AddedCard = {
  holder: string;
  expiry: string;
  last4: string;
};

type CheckoutOptionProps = {
  active: boolean;
  expanded?: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
  children?: ReactNode;
};

const shippingValue = 7.9;
const couponDiscountRate = 0.1;
const guestOrdersStorageKey = "acesse-orders";
const validCoupons = new Set(["ACESSE10", "ACENTURE10", "ACESSO10"]);

const paymentLabels: Record<PaymentMethod, string> = {
  pix: "Pix",
  apple: "Apple Pay",
  google: "Google Pay",
  credit: "Cartao de Credito",
};

const normalizeCardNumber = (value: string) =>
  value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ");

const normalizeExpiry = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

const getGuestOrders = () => {
  try {
    const storedOrders = window.localStorage.getItem(guestOrdersStorageKey);
    return storedOrders ? (JSON.parse(storedOrders) as unknown[]) : [];
  } catch {
    return [];
  }
};

const saveGuestOrder = (order: Record<string, unknown>) => {
  const orderId = window.crypto?.randomUUID?.() ?? `guest-${Date.now()}`;
  const currentOrders = getGuestOrders();

  window.localStorage.setItem(
    guestOrdersStorageKey,
    JSON.stringify([
      ...currentOrders,
      {
        id: orderId,
        ...order,
        createdAt: new Date().toISOString(),
      },
    ])
  );

  return orderId;
};

const isValidExpiry = (value: string) => {
  const [month, year] = value.split("/");
  const parsedMonth = Number(month);

  return Boolean(year && year.length === 2 && parsedMonth >= 1 && parsedMonth <= 12);
};

const CouponIcon = () => (
  <svg className="h-[38px] w-[38px]" viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <path
      d="M5 12.5h7.2a4.2 4.2 0 0 0 0 8.4H5v7.7h30v-7.7a4.2 4.2 0 0 1 0-8.4V4.8H5v7.7Z"
      stroke="#1a7d11"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="3.4"
    />
    <path
      d="m21.2 13.2 1.9 3.8 4.2.6-3.1 3 0.8 4.2-3.8-2-3.7 2 0.7-4.2-3-3 4.2-.6 1.8-3.8Z"
      stroke="#1a7d11"
      strokeLinejoin="round"
      strokeWidth="2.3"
    />
  </svg>
);

const PixIcon = () => (
  <svg className="h-[38px] w-[38px]" viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <path d="M7 7h9v9H7V7Zm17 0h9v9h-9V7ZM7 24h9v9H7v-9Z" stroke="#1a7d11" strokeWidth="3" />
    <path
      d="M24 24h4v4h-4v-4Zm8 0h2v2h-2v-2Zm-4 7h3v3h-3v-3Zm-5 0h2v2h-2v-2Zm9-3h2v4h-2v-4Z"
      fill="#1a7d11"
    />
  </svg>
);

const WalletPayIcon = () => (
  <svg className="h-[39px] w-[39px]" viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <path d="M20 4 36 20 20 36 4 20 20 4Z" stroke="#1a7d11" strokeWidth="3.4" />
    <path d="M20 12 28 20 20 28 12 20 20 12Z" stroke="#1a7d11" strokeWidth="3" />
    <path d="M20 4v8M20 28v8M4 20h8M28 20h8" stroke="#1a7d11" strokeWidth="3" />
  </svg>
);

const RadioCircle = ({ active }: { active: boolean }) => (
  <span
    className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border-[4px] border-black bg-transparent"
    aria-hidden="true"
  >
    {active ? <span className="h-[10px] w-[10px] rounded-full bg-black" /> : null}
  </span>
);

const CheckoutOption = ({ active, expanded = false, icon, label, onClick, children }: CheckoutOptionProps) => (
  <button
    aria-checked={active}
    className={`w-full rounded-[14px] bg-[#f4f4f4] p-0 text-left text-black transition-colors hover:bg-[#ededed] ${
      expanded ? "min-h-[166px]" : "h-[58px]"
    }`}
    onClick={onClick}
    role="radio"
    type="button"
  >
    <span className="flex h-[58px] w-full items-center">
      <span className="ml-[25px] flex w-[42px] shrink-0 items-center justify-center text-[#1a7d11]">
        {icon}
      </span>
      <span className="ml-[26px] min-w-0 flex-1 truncate text-[16px] leading-[20px] text-black">
        {label}
      </span>
      <span className="mr-[24px]">
        <RadioCircle active={active} />
      </span>
    </span>
    {expanded ? children : null}
  </button>
);

const WalletInstallments = ({ subtotal }: { subtotal: number }) => (
  <span className="block px-[11px] pb-[24px]">
    <span className="block text-[16px] leading-[20px] text-black">Parcelas</span>
    <span className="mt-[1px] flex h-[59px] items-center rounded-[12px] bg-white px-[27px] text-[15px] leading-[19px] text-black">
      1x de {formatCurrency(subtotal)}
    </span>
  </span>
);

const OrderSummary = ({
  discount,
  itemCount,
  onBack,
  onConfirm,
  orderError,
  shipping,
  submitting,
  subtotal,
  total,
}: {
  discount: number;
  itemCount: number;
  onBack: () => void;
  onConfirm: () => void;
  orderError: string;
  shipping: number;
  submitting: boolean;
  subtotal: number;
  total: number;
}) => (
  <aside className="h-fit rounded-[14px] bg-[#f4f4f4] px-[17px] pb-[24px] pt-[18px] text-black lg:sticky lg:top-[104px]">
    <h2 className="text-[16px] leading-[20px] text-black">Resumo do pedido</h2>

    <div className="mt-[18px] grid gap-[17px] text-[16px] leading-[20px]">
      <p className="flex items-center justify-between">
        <span>Subtotal({itemCount})</span>
        <span>{formatCurrency(subtotal)}</span>
      </p>
      <p className="flex items-center justify-between">
        <span>Entrega - Acesse +</span>
        <span>{formatCurrency(shipping)}</span>
      </p>
      {discount > 0 ? (
        <p className="flex items-center justify-between text-[#167307]">
          <span>Desconto</span>
          <span>-{formatCurrency(discount)}</span>
        </p>
      ) : null}
    </div>

    <div className="mt-[25px] grid gap-[2px]">
      <p className="flex items-start justify-between text-[16px] leading-[20px]">
        <span>Total a pagar</span>
        <span className="text-right text-[21px] leading-[25px] text-black">{formatCurrency(total)}</span>
      </p>
      <p className="text-right text-[15px] leading-[18px] text-black">3x de {formatCurrency(total / 3)}</p>
    </div>

    <button
      className="mt-[38px] flex h-[47px] w-full items-center justify-center rounded-[13px] bg-[#167307] text-[16px] leading-[20px] text-white transition-colors hover:bg-[#125d05] disabled:cursor-not-allowed disabled:opacity-70"
      disabled={submitting}
      onClick={onConfirm}
      type="button"
    >
      {submitting ? "Confirmando..." : "Confirmar Pedido"}
    </button>

    <button
      className="mt-[27px] flex w-full items-center justify-center bg-transparent text-[16px] leading-[20px] text-black"
      onClick={onBack}
      type="button"
    >
      Voltar para a etapa anterior
    </button>

    {orderError ? <p className="mt-4 text-center text-[13px] leading-[18px] text-[#b42318]">{orderError}</p> : null}
  </aside>
);

const CheckoutSupportFooter = () => (
  <section className="mx-auto mt-[27px] max-w-[1052px] rounded-[8px] bg-[#f4f4f4] px-[28px] pb-[25px] pt-[19px]">
    <div className="grid gap-[21px] md:grid-cols-2">
      <article className="flex min-h-[96px] items-center gap-[21px] rounded-[8px] bg-white px-[16px] text-black">
        <FiHeadphones className="shrink-0 text-[#1a7d11]" size={36} strokeWidth={2.3} />
        <div className="min-w-0">
          <h3 className="m-0 text-[16px] leading-[20px] text-black">Central de atendimento</h3>
          <p className="m-0 mt-[3px] text-[12px] leading-[15px] text-[#333]">
            Confira as d&uacute;vidas mais frequentes ou fale com a gente.
          </p>
        </div>
      </article>
      <article className="flex min-h-[96px] items-center gap-[21px] rounded-[8px] bg-white px-[16px] text-black">
        <FiSmartphone className="shrink-0 text-[#1a7d11]" size={35} strokeWidth={2.3} />
        <div className="min-w-0">
          <h3 className="m-0 text-[16px] leading-[20px] text-black">Baixe o nosso aplicativo</h3>
          <p className="m-0 mt-[3px] text-[12px] leading-[15px] text-[#333]">
            E tenha descontos e beneficios exclusivos!
          </p>
        </div>
      </article>
    </div>
    <img
      className="mt-[16px] h-[30px] w-[137px] object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.35)]"
      alt="Acesse+"
      src="/Group-57.svg"
    />
  </section>
);

const CardDialog = ({
  cardCvv,
  cardError,
  cardExpiry,
  cardHolder,
  cardNumber,
  onClose,
  onCvvChange,
  onExpiryChange,
  onHolderChange,
  onNumberChange,
  onSubmit,
}: {
  cardCvv: string;
  cardError: string;
  cardExpiry: string;
  cardHolder: string;
  cardNumber: string;
  onClose: () => void;
  onCvvChange: (value: string) => void;
  onExpiryChange: (value: string) => void;
  onHolderChange: (value: string) => void;
  onNumberChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) => (
  <form className="flex min-h-[646px] flex-col px-[25px] pb-[45px] pt-[67px]" onSubmit={onSubmit}>
    <button
      aria-label="Fechar"
      className="absolute right-[15px] top-[15px] flex h-9 w-9 items-center justify-center bg-transparent p-0 text-black"
      onClick={onClose}
      type="button"
    >
      <FiX size={25} strokeWidth={2.2} />
    </button>

    <h2 className="m-0 text-[21px] leading-[26px] text-black">Adicionar novo cart&atilde;o</h2>

    <label className="mt-[15px] block text-[16px] leading-[20px] text-black">
      Numero do cart&atilde;o*
      <input
        className="mt-[6px] h-[49px] w-full rounded-[13px] bg-white px-4 text-[15px] leading-[19px] text-black outline-none"
        inputMode="numeric"
        onChange={(event) => onNumberChange(normalizeCardNumber(event.target.value))}
        value={cardNumber}
      />
    </label>

    <label className="mt-[27px] block text-[16px] leading-[20px] text-black">
      Nome do titular *
      <input
        className="mt-[6px] h-[49px] w-full rounded-[13px] bg-white px-4 text-[15px] leading-[19px] text-black outline-none"
        onChange={(event) => onHolderChange(event.target.value)}
        value={cardHolder}
      />
    </label>
    <p className="m-0 mt-[5px] text-[9px] leading-[12px] text-black">Digite o nome como aparece no cart&atilde;o</p>

    <label className="mt-[10px] block text-[16px] leading-[20px] text-black">
      Data do vencimento (MM/AA)
      <input
        className="mt-[6px] h-[49px] w-full rounded-[13px] bg-white px-4 text-[15px] leading-[19px] text-black outline-none"
        inputMode="numeric"
        onChange={(event) => onExpiryChange(normalizeExpiry(event.target.value))}
        value={cardExpiry}
      />
    </label>

    <label className="mt-[27px] block w-[148px] text-[16px] leading-[20px] text-black">
      CVV*
      <input
        className="mt-[6px] h-[49px] w-full rounded-[13px] bg-white px-4 text-[15px] leading-[19px] text-black outline-none"
        inputMode="numeric"
        onChange={(event) => onCvvChange(event.target.value.replace(/\D/g, "").slice(0, 4))}
        value={cardCvv}
      />
    </label>

    {cardError ? <p className="m-0 mt-4 text-[12px] leading-[16px] text-[#b42318]">{cardError}</p> : null}

    <button
      className="mx-[14px] mt-auto flex h-[48px] items-center justify-center rounded-[24px] bg-[#167307] text-[16px] leading-[20px] text-white transition-colors hover:bg-[#125d05]"
      type="submit"
    >
      Adicionar
    </button>
  </form>
);

const CouponDialog = ({
  couponError,
  couponInput,
  onClose,
  onCouponChange,
  onSubmit,
}: {
  couponError: string;
  couponInput: string;
  onClose: () => void;
  onCouponChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) => (
  <form className="flex min-h-[612px] flex-col px-[24px] pb-[50px] pt-[85px]" onSubmit={onSubmit}>
    <button
      aria-label="Fechar"
      className="absolute right-[15px] top-[15px] flex h-9 w-9 items-center justify-center bg-transparent p-0 text-black"
      onClick={onClose}
      type="button"
    >
      <FiX size={25} strokeWidth={2.2} />
    </button>

    <h2 className="m-0 text-[21px] leading-[26px] text-black">Cupom de desconto</h2>
    <p className="m-0 mt-[1px] max-w-[320px] text-[16px] leading-[19px] text-black">
      Insira o c&oacute;digo do cupom abaixo para ganhar desconto nesta compra.
    </p>

    <label className="mt-[38px] block text-[16px] leading-[20px] text-black">
      C&oacute;digo do cupom
      <input
        className="mt-[5px] h-[49px] w-full rounded-[13px] bg-white px-4 text-[15px] uppercase leading-[19px] text-black outline-none"
        onChange={(event) => onCouponChange(event.target.value)}
        value={couponInput}
      />
    </label>

    {couponError ? <p className="m-0 mt-4 text-[12px] leading-[16px] text-[#b42318]">{couponError}</p> : null}

    <button
      className="mx-[16px] mt-auto flex h-[49px] items-center justify-center rounded-[24px] bg-[#167307] text-[16px] leading-[20px] text-white transition-colors hover:bg-[#125d05]"
      type="submit"
    >
      Adicionar
    </button>
  </form>
);

const CheckoutDialog = ({
  cardCvv,
  cardError,
  cardExpiry,
  cardHolder,
  cardNumber,
  couponError,
  couponInput,
  mode,
  onCardCvvChange,
  onCardExpiryChange,
  onCardHolderChange,
  onCardNumberChange,
  onCardSubmit,
  onClose,
  onCouponChange,
  onCouponSubmit,
}: {
  cardCvv: string;
  cardError: string;
  cardExpiry: string;
  cardHolder: string;
  cardNumber: string;
  couponError: string;
  couponInput: string;
  mode: Exclude<DialogMode, null>;
  onCardCvvChange: (value: string) => void;
  onCardExpiryChange: (value: string) => void;
  onCardHolderChange: (value: string) => void;
  onCardNumberChange: (value: string) => void;
  onCardSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
  onCouponChange: (value: string) => void;
  onCouponSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) => (
  <div className="fixed inset-0 z-[60] bg-black/20">
    <div
      className={`absolute inset-x-4 mx-auto max-h-[calc(100vh-104px)] max-w-[392px] overflow-y-auto rounded-[12px] bg-[#f7f7f7] text-black shadow-[0_28px_80px_rgba(0,0,0,0.18)] sm:left-auto sm:mx-0 sm:w-[392px] lg:right-[47px] ${
        mode === "card" ? "top-[108px] lg:top-[189px]" : "top-[108px] lg:top-[185px]"
      }`}
    >
      {mode === "card" ? (
        <CardDialog
          cardCvv={cardCvv}
          cardError={cardError}
          cardExpiry={cardExpiry}
          cardHolder={cardHolder}
          cardNumber={cardNumber}
          onClose={onClose}
          onCvvChange={onCardCvvChange}
          onExpiryChange={onCardExpiryChange}
          onHolderChange={onCardHolderChange}
          onNumberChange={onCardNumberChange}
          onSubmit={onCardSubmit}
        />
      ) : (
        <CouponDialog
          couponError={couponError}
          couponInput={couponInput}
          onClose={onClose}
          onCouponChange={onCouponChange}
          onSubmit={onCouponSubmit}
        />
      )}
    </div>
  </div>
);

const EmptyCheckout = () => (
  <section className="mx-auto max-w-[780px] px-4 py-14 text-center">
    <h1 className="m-0 text-[30px] leading-[38px] text-[#257a0d]">Seu carrinho esta vazio</h1>
    <p className="m-0 mt-3 text-[14px] leading-[22px] text-[#52606d]">
      Adicione produtos ao carrinho antes de escolher a forma de pagamento.
    </p>
    <Link
      className="mt-8 inline-flex h-11 items-center justify-center bg-[#167307] px-5 text-[14px] text-white no-underline"
      to="/buscar"
    >
      Ver produtos
    </Link>
  </section>
);

const CompletedCheckout = ({ orderId }: { orderId: string }) => (
  <section className="mx-auto max-w-[780px] px-4 py-14 text-center">
    <h1 className="m-0 text-[30px] leading-[38px] text-[#257a0d]">Pedido confirmado</h1>
    <p className="m-0 mt-3 text-[14px] leading-[22px] text-[#52606d]">
      Seu pedido foi registrado com sucesso{orderId ? `: ${orderId}` : "."}
    </p>
    <Link
      className="mt-8 inline-flex h-11 items-center justify-center bg-[#167307] px-5 text-[14px] text-white no-underline"
      to="/"
    >
      Voltar para a loja
    </Link>
  </section>
);

const serializeCartItems = (items: CartItem[]) =>
  items.map((item) => ({
    image: item.image,
    name: item.name,
    price: item.price,
    productId: item.productId,
    quantity: item.quantity,
    sellerName: item.sellerName ?? "Acesse+",
    total: item.price * item.quantity,
  }));

const TelaCompra: FunctionComponent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { clearCart, itemCount, items, loading, subtotal } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [expandedWallet, setExpandedWallet] = useState<WalletMethod | null>(null);
  const [activeDialog, setActiveDialog] = useState<DialogMode>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardError, setCardError] = useState("");
  const [addedCard, setAddedCard] = useState<AddedCard | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [orderError, setOrderError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [completedOrderId, setCompletedOrderId] = useState("");

  const shipping = itemCount > 0 ? shippingValue : 0;
  const discount = appliedCoupon ? Math.min(subtotal, Number((subtotal * couponDiscountRate).toFixed(2))) : 0;
  const total = Math.max(0, subtotal + shipping - discount);

  const options = useMemo(
    () => [
      {
        active: activeDialog === "coupon" || Boolean(appliedCoupon),
        icon: <CouponIcon />,
        label: "Cupom de desconto",
        onClick: () => {
          setCouponError("");
          setActiveDialog("coupon");
        },
      },
      {
        active: paymentMethod === "pix",
        icon: <PixIcon />,
        label: "Pix",
        onClick: () => {
          setPaymentMethod("pix");
          setExpandedWallet(null);
          setActiveDialog(null);
        },
      },
      {
        active: paymentMethod === "apple",
        expanded: expandedWallet === "apple",
        icon: <WalletPayIcon />,
        label: "Apple Pay",
        onClick: () => {
          setPaymentMethod("apple");
          setExpandedWallet("apple");
          setActiveDialog(null);
        },
      },
      {
        active: paymentMethod === "google",
        expanded: expandedWallet === "google",
        icon: <WalletPayIcon />,
        label: "Google Pay",
        onClick: () => {
          setPaymentMethod("google");
          setExpandedWallet("google");
          setActiveDialog(null);
        },
      },
      {
        active: paymentMethod === "credit",
        icon: <FiCreditCard size={43} strokeWidth={2.2} />,
        label: "Cart\u00e3o de Cr\u00e9dito",
        onClick: () => {
          setCardError("");
          setPaymentMethod("credit");
          setActiveDialog("card");
        },
      },
    ],
    [activeDialog, appliedCoupon, expandedWallet, paymentMethod]
  );

  const handleCardSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cardDigits = cardNumber.replace(/\D/g, "");
    const holder = cardHolder.trim();

    if (cardDigits.length < 13 || !holder || !isValidExpiry(cardExpiry) || cardCvv.length < 3) {
      setCardError("Preencha os dados do cartao.");
      return;
    }

    setAddedCard({
      expiry: cardExpiry,
      holder,
      last4: cardDigits.slice(-4),
    });
    setCardError("");
    setActiveDialog(null);
  };

  const handleCouponSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedCoupon = couponInput.trim().toUpperCase().replace(/\s+/g, "");

    if (!normalizedCoupon) {
      setCouponError("Digite um codigo de cupom.");
      return;
    }

    if (!validCoupons.has(normalizedCoupon)) {
      setCouponError("Cupom invalido.");
      return;
    }

    setAppliedCoupon(normalizedCoupon);
    setCouponError("");
    setCouponInput("");
    setActiveDialog(null);
  };

  const handleConfirmOrder = async () => {
    if (items.length === 0 || submitting) {
      return;
    }

    if (paymentMethod === "credit" && !addedCard) {
      setCardError("");
      setActiveDialog("card");
      return;
    }

    setOrderError("");
    setSubmitting(true);

    const order = {
      coupon: appliedCoupon || null,
      discount,
      items: serializeCartItems(items),
      itemCount,
      payment: {
        card: paymentMethod === "credit" && addedCard ? addedCard : null,
        method: paymentMethod,
        methodLabel: paymentLabels[paymentMethod],
      },
      shipping,
      status: "confirmed",
      subtotal,
      total,
      userId: user?.uid ?? null,
    };

    try {
      const orderId = user
        ? (
            await addDoc(collection(firestore, "users", user.uid, "orders"), {
              ...order,
              createdAt: serverTimestamp(),
            })
          ).id
        : saveGuestOrder(order);

      if (user) {
        await Promise.all(
          items.map((item) =>
            setDoc(
              doc(firestore, "productPurchases", `${user.uid}_${item.productId}`),
              {
                image: item.image,
                name: item.name,
                orderId,
                productId: item.productId,
                purchasedAt: serverTimestamp(),
                quantity: item.quantity,
                userId: user.uid,
              },
              { merge: true }
            )
          )
        );
      }

      await clearCart().catch(() => undefined);
      setCompletedOrderId(orderId);
    } catch {
      setOrderError("Nao foi possivel confirmar o pedido. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  if (completedOrderId) {
    return (
      <main className="min-h-screen bg-white font-['Montserrat',sans-serif] text-black">
        <AppHeader showNav={false} />
        <CompletedCheckout orderId={completedOrderId} />
        <ProductsSection className="mb-[56px] mt-[24px]" />
        <FooterSection />
      </main>
    );
  }

  if (!loading && items.length === 0) {
    return (
      <main className="min-h-screen bg-white font-['Montserrat',sans-serif] text-black">
        <AppHeader showNav={false} />
        <EmptyCheckout />
        <ProductsSection className="mb-[56px] mt-[24px]" />
        <FooterSection />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white font-['Montserrat',sans-serif] text-black [&_button]:font-[inherit] [&_h1]:m-0 [&_p]:m-0">
      <AppHeader showNav={false} />

      <section className="mx-auto max-w-[1308px] px-4 pb-14 pt-[23px] sm:px-0">
        <h1 className="text-[22px] leading-[27px] text-[#222]">Como deseja pagar?</h1>
        <p className="mt-[15px] text-[15px] leading-[18px] text-black">Escolha uma das formadisponivel:</p>

        <div className="mt-[31px] grid gap-8 lg:grid-cols-[minmax(0,897px)_339px] lg:gap-[57px]">
          <section className="grid gap-[15px] lg:min-h-[458px]" role="radiogroup" aria-label="Forma de pagamento">
            {options.map((option) => (
              <CheckoutOption
                active={option.active}
                expanded={option.expanded}
                icon={option.icon}
                key={option.label}
                label={option.label}
                onClick={option.onClick}
              >
                {option.expanded ? <WalletInstallments subtotal={subtotal} /> : null}
              </CheckoutOption>
            ))}
          </section>

          <OrderSummary
            discount={discount}
            itemCount={itemCount}
            onBack={() => navigate("/carrinho/entrega")}
            onConfirm={() => void handleConfirmOrder()}
            orderError={orderError}
            shipping={shipping}
            submitting={submitting}
            subtotal={subtotal}
            total={total}
          />
        </div>

        <CheckoutSupportFooter />
      </section>

      <ProductsSection className="mb-[56px] mt-[10px]" />
      <FooterSection />

      {activeDialog ? (
        <CheckoutDialog
          cardCvv={cardCvv}
          cardError={cardError}
          cardExpiry={cardExpiry}
          cardHolder={cardHolder}
          cardNumber={cardNumber}
          couponError={couponError}
          couponInput={couponInput}
          mode={activeDialog}
          onCardCvvChange={setCardCvv}
          onCardExpiryChange={setCardExpiry}
          onCardHolderChange={setCardHolder}
          onCardNumberChange={setCardNumber}
          onCardSubmit={handleCardSubmit}
          onClose={() => setActiveDialog(null)}
          onCouponChange={setCouponInput}
          onCouponSubmit={handleCouponSubmit}
        />
      ) : null}
    </main>
  );
};

export default TelaCompra;
