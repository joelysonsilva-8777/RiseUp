import { useMemo, useState, type FunctionComponent } from "react";
import { Link, useParams } from "react-router-dom";
import { AppHeader } from "../../components/AppHeader";
import { useCart } from "../../context/CartContext";
import { defaultProducts, formatCurrency } from "../../data/products";
import { useProducts } from "../../hooks/useProducts";

const TelaProduto: FunctionComponent = () => {
  const { productId } = useParams();
  const { products } = useProducts();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState("");
  const product = useMemo(
    () =>
      products.find((item) => item.id === productId) ??
      defaultProducts.find((item) => item.id === productId) ??
      products[0] ??
      defaultProducts[0],
    [productId, products]
  );
  const thumbs = useMemo(
    () => [product.image, ...products.filter((item) => item.id !== product.id).slice(0, 4).map((item) => item.image)],
    [product, products]
  );

  const handleAddToCart = async () => {
    await addItem(product, quantity);
    setAddedMessage("Produto adicionado ao carrinho.");
  };

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-white font-['Montserrat',sans-serif] text-black [&_h1]:m-0 [&_h2]:m-0 [&_p]:m-0">
      <AppHeader />

      <section className="mx-auto grid w-full max-w-[1230px] grid-cols-1 gap-8 px-4 pt-[38px] md:px-6 lg:grid-cols-[minmax(0,565px)_minmax(0,520px)] lg:gap-[63px] lg:pt-[54px]">
        <div className="min-w-0">
          <div className="flex h-[360px] items-center justify-center sm:h-[500px]">
            <img
              className="h-full max-h-[445px] w-full max-w-[455px] object-contain"
              alt={product.name}
              src={product.image}
            />
          </div>
          <div className="mt-[17px] flex items-center justify-center gap-4 sm:gap-[36px]">
            {thumbs.map((thumb, index) => (
              <button
                className="flex h-[70px] w-[74px] items-center justify-center border-0 bg-transparent p-0"
                type="button"
                key={`${thumb}-${index}`}
              >
                <img className="max-h-full max-w-full object-contain" alt="" src={thumb} />
              </button>
            ))}
          </div>
        </div>

        <div className="min-w-0 pt-[1px]">
          <h1 className="max-w-[560px] text-[22px] leading-[28px] text-black">
            {product.name}
          </h1>
          <div className="mt-[8px] h-[20px] w-[120px] rounded-[4px] bg-[#f5f5f5]" />

          <div className="mt-[24px] flex flex-wrap items-center gap-[12px]">
            <span className="text-[12px] leading-[15px] text-[#333]">COD {product.id.slice(0, 10).toUpperCase()}</span>
            <span className="flex h-[30px] items-center gap-[8px] rounded-[4px] bg-[#f5f5f5] px-[9px] text-[12px] leading-[15px] text-[#257a0d]">
              {product.category}
            </span>
          </div>

          <p className="mt-[23px] text-[16px] leading-[24px] text-[#355e3a]">
            {product.description}
          </p>

          <section className="mt-[48px] flex h-[70px] items-center justify-between rounded-[8px] bg-[#f5f5f5] px-5 sm:px-[58px]">
            <span className="text-[12px] leading-[15px] text-[#257a0d]">
              Selecione a quantidade
            </span>
            <div className="grid h-[44px] w-[124px] grid-cols-3 items-center rounded-[5px] border border-[#257a0d] bg-white text-center text-[18px] text-[#257a0d]">
              <button
                className="border-0 bg-transparent text-[20px] text-[#777]"
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                type="button"
              >
                -
              </button>
              <span>{quantity}</span>
              <button
                className="border-0 bg-transparent text-[22px] text-[#257a0d]"
                onClick={() => setQuantity((current) => Math.min(99, current + 1))}
                type="button"
              >
                +
              </button>
            </div>
          </section>

          <section className="mt-[16px] rounded-[8px] bg-[#f5f5f5] px-5 py-[16px] sm:px-[55px]">
            {product.oldPrice ? (
              <p className="text-[14px] leading-[18px] text-[#8493ad]">{formatCurrency(product.oldPrice)}</p>
            ) : null}
            <p className="text-[24px] leading-[29px] text-black">{formatCurrency(product.price)}</p>
            <p className="mt-[11px] text-[13px] leading-[16px] text-[#5d9a65]">
              Ou 5x de {formatCurrency(product.price / 5)}
            </p>
            <button
              className="mt-[15px] flex h-[40px] w-full items-center justify-center rounded-[4px] border-0 bg-[#1b7d0c] text-[13px] leading-[16px] text-white"
              onClick={() => {
                void handleAddToCart();
              }}
              type="button"
            >
              ADICIONAR AO CARRINHO
            </button>
            {addedMessage ? (
              <div className="mt-3 flex flex-wrap items-center gap-3 text-[12px] leading-[16px] text-[#167307]">
                <span>{addedMessage}</span>
                <Link className="text-[#167307]" to="/carrinho">
                  Ver carrinho
                </Link>
              </div>
            ) : null}
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
            <p className="mt-[14px] text-[12px] leading-[18px] text-[#355e3a]">
              Vendido por {product.sellerName ?? "Acesse+"}. Estoque: {product.stock ?? 1} unidade(s).
            </p>
          </section>
        </div>
      </section>
    </main>
  );
};

export default TelaProduto;
