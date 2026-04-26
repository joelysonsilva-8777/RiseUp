import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const HeaderIconButton = ({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) => (
  <button
    aria-label={label}
    className="flex h-9 w-9 shrink-0 items-center justify-center border-0 bg-transparent p-0 text-white"
    type="button"
  >
    {children}
  </button>
);

const CartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M5.6 21.4A1.93 1.93 0 0 1 5 20c0-.55.2-1.02.59-1.41A1.93 1.93 0 0 1 7 18c.55 0 1.02.2 1.41.59.4.39.59.86.59 1.41s-.2 1.02-.59 1.41A1.93 1.93 0 0 1 7 22c-.55 0-1.02-.2-1.4-.6Zm10 0A1.93 1.93 0 0 1 15 20c0-.55.2-1.02.59-1.41A1.93 1.93 0 0 1 17 18c.55 0 1.02.2 1.41.59.4.39.59.86.59 1.41s-.2 1.02-.59 1.41A1.93 1.93 0 0 1 17 22c-.55 0-1.02-.2-1.4-.6ZM6.15 6l2.4 5h7l2.75-5H6.15ZM5.2 4h14.75c.38 0 .67.17.88.51.2.34.2.69.02 1.04l-3.55 6.4c-.18.33-.43.59-.74.78-.3.18-.64.27-1.01.27H8.1L7 15h12v2H7c-.75 0-1.32-.33-1.7-.99a1.9 1.9 0 0 1-.05-1.96L6.6 11.6 3 4H1V2h3.25l.95 2Z"
      fill="currentColor"
    />
  </svg>
);

const BellIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M6 19v-7a6 6 0 0 1 12 0v7M4.5 19h15M10 21h4"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.4"
    />
  </svg>
);

const UserIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8c.65-3.42 3.42-5.5 7-5.5s6.35 2.08 7 5.5"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.4"
    />
  </svg>
);

type AppHeaderProps = {
  showNav?: boolean;
};

export const AppHeader = ({ showNav = true }: AppHeaderProps) => {
  const { user, firstName, loading, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const initials = (firstName || "Entrar")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <header className="w-full shrink-0 font-['Montserrat',sans-serif]">
      <div className="flex h-[78px] w-full items-center bg-[#167307] px-[14px] text-white">
        <Link className="shrink-0 no-underline" to="/" aria-label="Ir para a página inicial">
          <img
            className="h-[37px] w-[135px] object-contain"
            alt="Acesse+"
            src="/Group-56.svg"
          />
        </Link>

        <a
          className="ml-[25px] flex w-[132px] shrink-0 items-center gap-[6px] text-white no-underline"
          href="https://wa.me/5581911112222"
          target="_blank"
          rel="noreferrer"
        >
          <span className="w-[100px] leading-none">
            <span className="block text-[15px] leading-[17px]">Whats app</span>
            <span className="mt-1 block text-[13px] leading-[15px]">(81) 91111-2222</span>
          </span>
          <img className="h-6 w-6" alt="" src="/Frame.svg" />
        </a>

        <form
          className="ml-[6px] flex h-10 w-[clamp(360px,55vw,772px)] min-w-0 shrink items-center rounded-[10px] bg-[#ecf8e8] px-[22px]"
          onSubmit={(event) => event.preventDefault()}
          role="search"
        >
          <img className="h-6 w-6 shrink-0" alt="" src="/Magnifier.svg" />
          <label className="sr-only" htmlFor="header-search">
            Buscar na Acesse+
          </label>
          <div className="relative ml-4 min-w-0 flex-1">
            <input
              className="w-full min-w-0 border-0 bg-transparent p-0 text-[14px] leading-[17px] text-[#355e3a] outline-none placeholder:text-transparent"
              id="header-search"
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Buscar na Acesse+"
              type="search"
              value={searchQuery}
            />
            {searchQuery === "" ? (
              <div className="pointer-events-none absolute inset-0 flex items-center gap-1 text-[14px] leading-[17px] text-[#609166]">
                <span>Buscar na</span>
                <img
                  className="h-[18px] w-[65px] object-contain drop-shadow-[0_1px_2px_rgba(0,0,0,0.28)]"
                  alt="Acesse+"
                  src="/Group-57.svg"
                />
              </div>
            ) : null}
          </div>
        </form>

        <div className="ml-auto flex shrink-0 items-center gap-[18px]">
          <HeaderIconButton label="Notificações">
            <BellIcon />
          </HeaderIconButton>

          {loading ? (
            <div className="flex min-w-[162px] items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2">
              <span className="h-8 w-8 rounded-full bg-white/20" />
              <span className="text-[14px] leading-[18px] text-white/80">Carregando</span>
            </div>
          ) : user ? (
            <div className="flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ecf8e8] text-[13px] font-semibold text-[#167307]">
                {initials || "U"}
              </span>
              <span className="min-w-0">
                <span className="block text-[11px] leading-[13px] text-white/70">Olá,</span>
                <span className="block max-w-[150px] truncate text-[14px] leading-[18px] text-white">
                  {firstName || "Usuário"}
                </span>
              </span>
              <button
                className="ml-1 text-[12px] leading-[16px] text-white/75 transition-colors hover:text-white"
                onClick={() => {
                  void logout();
                }}
                type="button"
              >
                Sair
              </button>
            </div>
          ) : (
            <Link
              className="flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-white no-underline transition-colors hover:bg-white/15"
              to="/login"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ecf8e8] text-[#167307]">
                <UserIcon />
              </span>
              <span className="text-[14px] leading-[18px] text-white">Entrar</span>
            </Link>
          )}

          <Link
            aria-label="Carrinho"
            className="flex h-9 w-9 items-center justify-center text-white no-underline"
            to="/carrinho"
          >
            <CartIcon />
          </Link>
        </div>
      </div>

      {showNav ? (
        <nav className="flex h-[46px] w-full items-center bg-[#f4f4f4] px-[36px] text-[#257a0d]">
          <div className="grid w-full max-w-[713px] grid-cols-[173px_154px_143px_1fr] items-center gap-[30px]">
            <Link
              className="flex items-center gap-2 text-[14px] leading-[17px] text-[#257a0d] no-underline"
              to="/#categorias"
            >
              <img className="h-[18px] w-[18px] object-contain" alt="" src="/Menu-Background.svg" />
              <span>Departamentos</span>
            </Link>

            <Link
              className="flex items-center gap-3 text-[14px] leading-[15px] text-[#257a0d] no-underline"
              to="/#entrega"
            >
              <img className="h-6 w-6 object-contain" alt="" src="/Location-Icon.svg" />
              <span>
                Enviar para
                <br />
                <strong className="text-[15px]">44586-284</strong>
              </span>
            </Link>

            <Link
              className="flex items-center gap-3 text-[14px] leading-[17px] text-[#257a0d] no-underline"
              to="/#cupons"
            >
              <img className="h-6 w-6 object-contain" alt="" src="/Vector.svg" />
              <span>Meus Cupons</span>
            </Link>

            <Link
              className="flex items-center gap-2 text-[14px] leading-[17px] text-[#257a0d] no-underline"
              to="/#ofertas"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ecf8e8]">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M4 9.5V4h5.5L20 14.5l-5.5 5.5L4 9.5Z"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                  <circle cx="8.5" cy="8.5" r="1.1" fill="currentColor" />
                </svg>
              </span>
              <span>Ofertas Exclusivas</span>
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
};
