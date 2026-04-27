import { useState } from "react";
import "./ProdutoPage.css";
import cepPromise from "cep-promise";



// CEPs válidos para simulação (substitua por chamada real de API depois)
const VALID_CEPS = {
  "01001000": { city: "São Paulo - SP", region: 1 },
  "01310100": { city: "São Paulo - SP", region: 1 },
  "20040020": { city: "Rio de Janeiro - RJ", region: 2 },
  "30112010": { city: "Belo Horizonte - MG", region: 2 },
  "40010010": { city: "Salvador - BA", region: 3 },
  "50010230": { city: "Recife - PE", region: 3 },
  "60010000": { city: "Fortaleza - CE", region: 3 },
  "70002900": { city: "Brasília - DF", region: 2 },
  "80010010": { city: "Curitiba - PR", region: 1 },
  "90010280": { city: "Porto Alegre - RS", region: 1 },
};

const FRETE_POR_REGIAO = {
  1: {
    pac:   { price: "R$ 89,90",  days: "Entrega em até 7 dias úteis" },
    sedex: { price: "R$ 159,90", days: "Entrega em até 3 dias úteis" },
  },
  2: {
    pac:   { price: "R$ 129,90", days: "Entrega em até 10 dias úteis" },
    sedex: { price: "R$ 219,90", days: "Entrega em até 5 dias úteis" },
  },
  3: {
    pac:   { price: "R$ 179,90", days: "Entrega em até 14 dias úteis" },
    sedex: { price: "R$ 289,90", days: "Entrega em até 7 dias úteis" },
  },
};

const BASE_PRICE = 15053.77;

const IMAGES = [
  "/images/img1.webp",
  "/images/img2.webp",
  "/images/img3.webp",
  "/images/img4.webp",
];

function formatCEP(value) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length > 5) return digits.slice(0, 5) + "-" + digits.slice(5);
  return digits;
}

function formatBRL(value) {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

export default function ProdutoPage({ cartCount = 0, onAddToCart, onNavigate }) {
  const [activeThumb, setActiveThumb] = useState(0);
  const [qty, setQty] = useState(1);
  const [cep, setCep] = useState("");
  const [cepError, setCepError] = useState("");
  const [freteResult, setFreteResult] = useState(null);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [toast, setToast] = useState(false);

  const totalPrice = BASE_PRICE * qty;
  const installment = totalPrice / 5;

  // ── Quantidade ──────────────────────────────────────────────
  const decreaseQty = () => setQty((q) => Math.max(1, q - 1));
  const increaseQty = () => setQty((q) => Math.min(99, q + 1));

  // ── Carrinho ────────────────────────────────────────────────
  const handleAddToCart = () => {
    if (onAddToCart) onAddToCart(qty);

    setAddedFeedback(true);
    setToast(true);
    setTimeout(() => setAddedFeedback(false), 1500);
    setTimeout(() => setToast(false), 3000);
  };

  // ── Frete ───────────────────────────────────────────────────
  const handleCepChange = (e) => {
    setCep(formatCEP(e.target.value));
    setCepError("");
    setFreteResult(null);
  };

  const calcularFrete = async () => { // ⚠️ TEM QUE SER async
  const raw = cep.replace(/\D/g, "");
  setCepError("");
  setFreteResult(null);

  if (raw.length !== 8) {
    setCepError("CEP inválido. O CEP deve ter 8 dígitos.");
    return;
  }

  try {
    const data = await cepPromise(raw); // ✅ AQUI

    const UF_TO_REGION = {
      SP: 1, RJ: 2, MG: 2, ES: 2,
      PR: 1, SC: 1, RS: 1,
      BA: 3, PE: 3, CE: 3,
      DF: 2, GO: 2, MT: 2, MS: 2,
      AM: 3, PA: 3, AC: 3, RO: 3, RR: 3, AP: 3, TO: 3,
      MA: 3, PI: 3, RN: 3, PB: 3, AL: 3, SE: 3,
    };

    const region = UF_TO_REGION[data.state];
    const frete = FRETE_POR_REGIAO[region];

    setFreteResult({
      ...frete,
      city: `${data.city} - ${data.state}`,
      bairro: data.neighborhood,
    });

  } catch {
    setCepError("CEP não encontrado. Verifique o número e tente novamente.");
  }
};

  const handleCepKeyDown = (e) => {
    if (e.key === "Enter") calcularFrete();
  };

  return (
    <div className="pp-root">
      {/* ── HEADER ─────────────────────────────────────────── */}
      <header className="pp-header">
        <div className="pp-logo">
          ACESS<span>E+</span>
        </div>

        <button
          className="pp-whatsapp"
          onClick={() => onNavigate && onNavigate("whatsapp")}
        >
          <span>💬 Whats app</span>
          <span>(81) 91111-2222</span>
        </button>

        <div className="pp-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input type="text" placeholder="Buscar na Acess E+" />
        </div>

        <div className="pp-header-actions">
          <button className="pp-icon-btn" onClick={() => onNavigate && onNavigate("notifications")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>

          <button className="pp-icon-btn" onClick={() => onNavigate && onNavigate("profile")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            <span>Olá, José!</span>
          </button>

          <button className="pp-icon-btn pp-cart-btn" onClick={() => onNavigate && onNavigate("cart")}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {cartCount > 0 && (
              <span className="pp-cart-badge">{cartCount}</span>
            )}
          </button>
        </div>
      </header>

      {/* ── SUBHEADER ──────────────────────────────────────── */}
      <nav className="pp-subheader">
        <button className="pp-sub-item" onClick={() => onNavigate && onNavigate("departamentos")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
          Departamentos
        </button>
        <button className="pp-sub-item" onClick={() => onNavigate && onNavigate("endereco")}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
          </svg>
          Enviar para 44586-284
        </button>
        <button className="pp-sub-item" onClick={() => onNavigate && onNavigate("cupons")}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          Meus Cupons
        </button>
        <button className="pp-sub-item pp-ofertas" onClick={() => onNavigate && onNavigate("ofertas")}>
          Ofertas Exclusivas
        </button>
      </nav>

      {/* ── MAIN CONTENT ───────────────────────────────────── */}
      <main className="pp-main">
        {/* GALLERY */}
        <section className="pp-gallery">
          <div className="pp-main-img">
  <img src={IMAGES[activeThumb]} alt="Produto" />
</div>
          <div className="pp-thumbs">
            {IMAGES.map((img, i) => (
  <button
    key={i}
    className={`pp-thumb ${activeThumb === i ? "active" : ""}`}
    onClick={() => setActiveThumb(i)}
  >
    <img src={img} alt={`thumb-${i}`} />
  </button>
))}
          </div>
        </section>

        {/* PRODUCT INFO */}
        <section className="pp-info">
          <h1 className="pp-title">
            Cadeira De Rodas Motorizada Dobrável, Compacta E Leve Ortobras Modelo E20
          </h1>

          <p className="pp-cod">COD 10031977</p>

          <div className="pp-rating-row">
            <div className="pp-stars">
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} className="pp-star">★</span>
              ))}
            </div>
            <button
              className="pp-link"
              onClick={() => onNavigate && onNavigate("avaliacoes")}
            >
              Seja o primeiro a avaliar
            </button>
          </div>

          <button
            className="pp-mais-info"
            onClick={() => onNavigate && onNavigate("mais-informacoes")}
          >
            Mais informações
          </button>

          {/* QUANTIDADE */}
          <div className="pp-qty-box">
            <span className="pp-qty-label">Selecione a quantidade</span>
            <div className="pp-qty-controls">
              <button className="pp-qty-btn" onClick={decreaseQty}>−</button>
              <span className="pp-qty-num">{qty}</span>
              <button className="pp-qty-btn" onClick={increaseQty}>+</button>
            </div>
          </div>

          {/* PREÇO */}
          <div className="pp-price-box">
            <div className="pp-price-main">R$ {formatBRL(totalPrice)}</div>
            <div className="pp-price-installment">
              Ou <strong>5x</strong> de<strong> R$ {formatBRL(installment)}</strong>
            </div>
          </div>

          {/* BOTÃO CARRINHO */}
          <button
            className={`pp-add-cart-btn ${addedFeedback ? "added" : ""}`}
            onClick={handleAddToCart}
          >
            {addedFeedback ? "✅ ADICIONADO!" : "ADICIONAR AO CARRINHO"}
          </button>

          {/* FRETE */}
          <div className="pp-frete-box">
            <h2 className="pp-frete-title">Calcule o frete e o prazo de entrega</h2>

            <div className="pp-frete-row">
              <input
                className={`pp-cep-input ${cepError ? "error" : ""}`}
                type="text"
                placeholder="Digite o CEP*"
                value={cep}
                onChange={handleCepChange}
                onKeyDown={handleCepKeyDown}
                maxLength={9}
              />
              <button className="pp-cep-btn" onClick={calcularFrete}>
                Calcular
              </button>
            </div>

            {cepError && (
              <p className="pp-frete-error">⚠ {cepError}</p>
            )}

            <button
              className="pp-nao-sei"
              onClick={() => onNavigate && onNavigate("buscar-cep")}
            >
              Não sei meu CEP
            </button>

            {freteResult && (
              <div className="pp-frete-result">
                <div className="pp-frete-city">📍 {freteResult.city}</div>
                <div className="pp-frete-option">
                  <span className="pp-frete-name">🚚 PAC (Correios)</span>
                  <div className="pp-frete-detail">
                    <span className="pp-frete-price">{freteResult.pac.price}</span>
                    <span className="pp-frete-days">{freteResult.pac.days}</span>
                  </div>
                </div>
                <div className="pp-frete-option">
                  <span className="pp-frete-name">⚡ SEDEX (Correios)</span>
                  <div className="pp-frete-detail">
                    <span className="pp-frete-price">{freteResult.sedex.price}</span>
                    <span className="pp-frete-days">{freteResult.sedex.days}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* TOAST */}
      <div className={`pp-toast ${toast ? "show" : ""}`}>
        ✅ Produto adicionado ao carrinho!
      </div>
    </div>
  );
}
