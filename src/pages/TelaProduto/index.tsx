import { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  FiTruck, FiShield, FiHeart, FiShare2, FiStar,
  FiChevronRight, FiRotateCcw, FiCheckCircle,
} from "react-icons/fi";
import { AppHeader } from "../../components/AppHeader";
import FooterSection from "../../components/inicial/FooterSection";
import { todosProdutos } from "../../data/products";
import type { Product } from "../../data/products";

// ─── Card de sugestão ─────────────────────────────────────────────────────────

const SugestaoCard = ({ id, name, image, oldPrice, category, description, price }: Product) => (
  <Link
    to={`/produto?id=${id}`}
    className="min-w-0 cursor-pointer group no-underline"
    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
  >
    <div className="relative aspect-square w-full overflow-hidden rounded-[8px] border border-[#f0f0f0] bg-white transition-shadow duration-200 group-hover:shadow-[0_4px_12px_rgba(22,115,7,0.15)]">
      <img alt={name} className="h-full w-full object-contain p-4" loading="lazy" src={image} />
      <span className="absolute left-3 top-3 inline-flex rounded-full bg-[#ecf8e8] px-3 py-1 text-[10px] uppercase leading-[13px] tracking-[0.12em] text-[#167307]">
        {category}
      </span>
    </div>
    <h3 className="mt-3 text-[13px] leading-[18px] text-[#071735] transition-colors group-hover:text-[#167307]">{name}</h3>
    <p className="mt-1 text-[11px] leading-[16px] text-[#476155]">{description}</p>
    <div className="mt-2">
      {oldPrice && <p className="text-[11px] text-[#8493ad] line-through">{oldPrice}</p>}
      <p className="text-[15px] font-semibold text-[#071735]">{price}</p>
    </div>
  </Link>
);

// ─── Tela principal ───────────────────────────────────────────────────────────

const TelaProduto = () => {
  const [searchParams] = useSearchParams();
  const id = Number(searchParams.get("id"));

  const produto = todosProdutos.find((p) => p.id === id) ?? todosProdutos[0];
  const images = produto.images ?? [produto.image];

  const [imagemAtiva, setImagemAtiva] = useState(0);
  const [quantidade, setQuantidade] = useState(1);
  const [favoritado, setFavoritado] = useState(false);

  const diminuir = () => setQuantidade((q) => Math.max(1, q - 1));
  const aumentar = () => setQuantidade((q) => q + 1);

  const sugestoes = useMemo(() => {
    const mesmaCategoria = todosProdutos.filter(
      (p) => p.id !== produto.id && p.category === produto.category
    );
    const outras = todosProdutos.filter(
      (p) => p.id !== produto.id && p.category !== produto.category
    );
    return [...mesmaCategoria, ...outras].slice(0, 6);
  }, [produto.id, produto.category]);

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#f5f5f5] font-['Montserrat',sans-serif] text-black [&_h1]:m-0 [&_h2]:m-0 [&_h3]:m-0 [&_p]:m-0">
      <AppHeader />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-[#ebebeb]">
        <nav className="mx-auto flex w-[calc(100%-24px)] max-w-[1230px] items-center gap-1 py-3 text-[12px] text-[#666] sm:w-[calc(100%-70px)]">
          <Link to="/" className="text-[#167307] no-underline hover:underline">Início</Link>
          <span className="mx-1 text-[#ccc]">›</span>
          <Link
            to={`/lista-produtos?categoria=${encodeURIComponent(produto.category)}`}
            className="text-[#167307] no-underline hover:underline"
          >
            {produto.category}
          </Link>
          <span className="mx-1 text-[#ccc]">›</span>
          <span className="max-w-[300px] truncate text-[#666]">{produto.name}</span>
        </nav>
      </div>

      {/* ── Bloco principal ── */}
      <div className="mx-auto w-[calc(100%-24px)] max-w-[1230px] py-4 sm:w-[calc(100%-70px)]">
        <div className="grid gap-4 lg:grid-cols-[1fr_340px] lg:items-start">

          {/* ── Coluna esquerda ── */}
          <div className="flex flex-col gap-4">

            {/* Card da galeria */}
            <div className="rounded-[8px] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <div className="relative">

                {/* Botões flutuantes */}
                <div className="absolute right-0 top-0 flex flex-col gap-2 z-10">
                  <button
                    onClick={() => setFavoritado((f) => !f)}
                    className={`flex h-9 w-9 items-center justify-center rounded-full border bg-white shadow-sm transition-colors ${
                      favoritado ? "border-[#e53935] text-[#e53935]" : "border-[#e0e0e0] text-[#666] hover:border-[#e53935] hover:text-[#e53935]"
                    }`}
                    type="button"
                    aria-label="Favoritar"
                  >
                    <FiHeart size={16} fill={favoritado ? "#e53935" : "none"} />
                  </button>
                  <button
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e0e0e0] bg-white text-[#666] shadow-sm transition-colors hover:border-[#167307] hover:text-[#167307]"
                    type="button"
                    aria-label="Compartilhar"
                  >
                    <FiShare2 size={16} />
                  </button>
                </div>

                {/* Imagem principal */}
                <div className="flex h-[320px] items-center justify-center sm:h-[440px]">
                  <img
                    className="max-h-full max-w-full object-contain transition-opacity duration-200"
                    alt={produto.name}
                    src={images[imagemAtiva]}
                  />
                </div>

                {/* Dots indicadores */}
                <div className="mt-3 flex items-center justify-center gap-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setImagemAtiva(index)}
                      className={`h-2 rounded-full border-0 p-0 transition-all ${
                        imagemAtiva === index
                          ? "w-6 bg-[#167307]"
                          : "w-2 bg-[#d0d0d0] hover:bg-[#b2edb8]"
                      }`}
                      type="button"
                      aria-label={`Imagem ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Thumbnails */}
              <div className="mt-4 flex items-center gap-2">
                {images.map((thumb, index) => (
                  <button
                    key={thumb}
                    onClick={() => setImagemAtiva(index)}
                    className={`flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-[6px] border-2 bg-white p-1 transition-all ${
                      imagemAtiva === index
                        ? "border-[#167307]"
                        : "border-[#ebebeb] hover:border-[#b2edb8]"
                    }`}
                    type="button"
                  >
                    <img className="max-h-full max-w-full object-contain" alt="" src={thumb} />
                  </button>
                ))}
              </div>
            </div>

            {/* Card: título e avaliações */}
            <div className="rounded-[8px] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <span className="inline-flex rounded-full bg-[#ecf8e8] px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-[#167307]">
                {produto.category}
              </span>
              <h1 className="mt-3 text-[18px] leading-[26px] text-[#071735] sm:text-[20px]">
                {produto.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar
                      key={star}
                      size={14}
                      className={star <= 4 ? "fill-[#f5a623] text-[#f5a623]" : "text-[#ddd]"}
                    />
                  ))}
                </div>
                <span className="text-[12px] text-[#666]">0 (novo)</span>
                <span className="text-[12px] text-[#999]">COD {produto.code ?? "—"}</span>
              </div>
              <p className="mt-3 text-[13px] text-[#666]">
                Vendido por{" "}
                <span className="font-semibold text-[#167307]">Acesse+</span>
                {" "}e entregue por{" "}
                <span className="font-semibold text-[#167307]">Acesse+</span>
              </p>
            </div>

            {/* Card: principais características */}
            <div className="rounded-[8px] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <h2 className="text-[16px] font-semibold text-[#071735]">Principais características</h2>
              <ul className="mt-3 space-y-2">
                {[
                  produto.description,
                  "Alta durabilidade e resistência",
                  "Design ergonômico e adaptável",
                  "Suporte técnico especializado",
                  "Garantia do fabricante",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[13px] leading-[20px] text-[#476155]">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#167307]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Card: descrição e ficha técnica */}
            <div className="rounded-[8px] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <h2 className="text-[16px] font-semibold text-[#071735]">Descrição e ficha técnica</h2>
              <p className="mt-1 text-[12px] text-[#999]">Código {produto.code ?? "—"}</p>
              <p className="mt-4 text-[13px] leading-[22px] text-[#476155]">
                Produto desenvolvido para oferecer máxima autonomia e qualidade de vida.
                Fabricado com materiais de alta durabilidade e tecnologia de ponta para
                atender as necessidades de pessoas com deficiência e seus cuidadores.
                Ideal para uso doméstico e em ambientes externos.
              </p>
              <table className="mt-6 w-full text-[13px]">
                <tbody>
                  {[
                    ["Código", produto.code ?? "—"],
                    ["Categoria", produto.category],
                    ["Condição", "Novo"],
                    ["Garantia", "12 meses"],
                    ["Disponibilidade", "Em estoque"],
                  ].map(([label, value]) => (
                    <tr key={label} className="border-b border-[#f5f5f5]">
                      <td className="w-[180px] py-3 pr-6 font-semibold text-[#071735]">{label}</td>
                      <td className="py-3 text-[#476155]">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Coluna direita: sidebar ── */}
          <div className="flex flex-col gap-3">

            {/* Card de preço e compra */}
            <div className="rounded-[8px] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              {produto.oldPrice && (
                <p className="text-[13px] text-[#999] line-through">{produto.oldPrice}</p>
              )}
              <p className="text-[30px] font-bold leading-[36px] text-[#071735]">
                {produto.price}
                <span className="ml-2 text-[13px] font-normal text-[#666]">no Pix</span>
                <span className="ml-2 inline-flex items-center rounded-[4px] bg-[#ecf8e8] px-2 py-0.5 text-[11px] font-bold text-[#167307]">5% OFF</span>
              </p>
              {produto.installments && (
                <p className="mt-1 text-[12px] text-[#476155]">
                  ou <strong>{produto.installments}</strong> sem juros
                </p>
              )}

              {/* Quantidade */}
              <div className="mt-4">
                <p className="text-[12px] text-[#666]">Quantidade</p>
                <div className="mt-2 inline-grid h-[38px] w-[110px] grid-cols-3 items-center rounded-[6px] border border-[#d7e8d4] text-center">
                  <button
                    onClick={diminuir}
                    className="border-0 bg-transparent text-[18px] text-[#999] transition-colors hover:text-[#167307]"
                    type="button"
                    aria-label="Diminuir"
                  >
                    −
                  </button>
                  <span className="text-[14px] font-semibold text-[#071735]">{quantidade}</span>
                  <button
                    onClick={aumentar}
                    className="border-0 bg-transparent text-[20px] text-[#167307] transition-colors hover:text-[#125d05]"
                    type="button"
                    aria-label="Aumentar"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Botões */}
              <div className="mt-4 flex flex-col gap-2">
                <Link
                  to="/carrinho"
                  className="flex h-[46px] w-full items-center justify-center gap-2 rounded-[6px] bg-[#167307] text-[14px] font-semibold text-white no-underline transition-colors hover:bg-[#125d05]"
                >
                  🛒 Adicionar à sacola
                </Link>
                <button
                  className="flex h-[46px] w-full items-center justify-center rounded-[6px] border-2 border-[#167307] bg-white text-[14px] font-semibold text-[#167307] transition-colors hover:bg-[#ecf8e8]"
                  type="button"
                >
                  Comprar agora
                </button>
              </div>
            </div>

            {/* Card: calcular frete */}
            <div className="rounded-[8px] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <button
                className="flex w-full items-center justify-between gap-2 border-0 bg-transparent px-5 py-4 text-left"
                type="button"
              >
                <div className="flex items-center gap-2">
                  <FiTruck size={18} className="text-[#167307]" />
                  <span className="text-[14px] font-semibold text-[#071735]">Calcular frete e prazo</span>
                </div>
                <FiChevronRight size={16} className="text-[#999]" />
              </button>
              <div className="border-t border-[#f5f5f5] px-5 pb-4 pt-3">
                <div className="flex gap-2">
                  <input
                    className="h-[40px] flex-1 rounded-[6px] border border-[#e0e0e0] bg-white px-4 text-[13px] outline-none placeholder:text-[#aaa] focus:border-[#167307]"
                    placeholder="Digite seu CEP"
                    type="text"
                    maxLength={9}
                  />
                  <button
                    className="h-[40px] rounded-[6px] bg-[#167307] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#125d05]"
                    type="button"
                  >
                    OK
                  </button>
                </div>
                <button
                  className="mt-2 border-0 bg-transparent p-0 text-[12px] text-[#167307] hover:underline"
                  type="button"
                >
                  Não sei meu CEP
                </button>
              </div>
            </div>

            {/* Card: informações da loja */}
            <div className="rounded-[8px] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <h2 className="text-[14px] font-semibold text-[#071735]">Informações da loja</h2>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ecf8e8] text-[18px] font-bold text-[#167307]">
                  A+
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#071735]">Acesse+</p>
                  <div className="flex items-center gap-1">
                    <FiCheckCircle size={12} className="text-[#167307]" />
                    <p className="text-[11px] text-[#167307]">Loja oficial</p>
                  </div>
                </div>
              </div>
              <button
                className="mt-3 w-full border-0 bg-transparent p-0 text-[13px] font-semibold text-[#167307] hover:underline text-left"
                type="button"
              >
                Ver mais sobre a loja
              </button>
            </div>

            {/* Card: garantias */}
            <div className="rounded-[8px] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              {[
                {
                  icon: <FiTruck size={18} className="shrink-0 text-[#167307]" />,
                  title: "Entrega rápida",
                  desc: "Frete barato e mais segurança para você.",
                },
                {
                  icon: <FiShield size={18} className="shrink-0 text-[#167307]" />,
                  title: "Acesse+ garante",
                  desc: "A sua compra, do pedido à entrega.",
                },
                {
                  icon: <FiRotateCcw size={18} className="shrink-0 text-[#167307]" />,
                  title: "Devolução gratuita",
                  desc: "Em até 7 dias após receber o produto.",
                },
              ].map((item, index, arr) => (
                <button
                  key={item.title}
                  className={`flex w-full items-center justify-between gap-3 border-0 bg-transparent px-5 py-4 text-left transition-colors hover:bg-[#fafafa] ${
                    index < arr.length - 1 ? "border-b border-[#f5f5f5]" : ""
                  }`}
                  type="button"
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <div>
                      <p className="text-[13px] font-semibold text-[#071735]">{item.title}</p>
                      <p className="text-[11px] text-[#666]">{item.desc}</p>
                    </div>
                  </div>
                  <FiChevronRight size={16} className="shrink-0 text-[#999]" />
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* ── Sugestões ── */}
        {sugestoes.length > 0 && (
          <section className="mt-6 rounded-[8px] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-semibold text-[#071735]">Você também pode gostar</h2>
              <Link
                to={`/lista-produtos?categoria=${encodeURIComponent(produto.category)}`}
                className="text-[13px] text-[#167307] no-underline hover:underline"
              >
                Ver mais
              </Link>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {sugestoes.map((p) => (
                <SugestaoCard key={p.id} {...p} />
              ))}
            </div>
          </section>
        )}
      </div>

      <FooterSection />
    </main>
  );
};

export default TelaProduto;