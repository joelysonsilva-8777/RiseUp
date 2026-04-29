import { AppHeader } from "./AppHeader";

type AuthLayoutProps = {
  children: React.ReactNode;
  firstToggleActive?: boolean;
};

const accessibilityItems = [
  { icon: "hand", label: "Ativar Libras", control: "toggle" },
  { icon: "eye", label: "Ativar Leitor de Tela", control: "toggle" },
  { icon: "zoom", label: "Aumentar Fonte", control: "font" },
  { icon: "sun", label: "Modo Claro", control: "toggle" },
  { icon: "translate", label: "Tradução Automatica", control: "toggle" },
];

export const AppleMark = () => (
  <svg width="24" height="28" viewBox="0 0 24 28" fill="none" aria-hidden="true">
    <path
      d="M18.7 14.8c0-3 2.4-4.5 2.5-4.6-1.4-2-3.5-2.3-4.2-2.4-1.8-.2-3.5 1.1-4.4 1.1-.9 0-2.3-1.1-3.8-1-1.9 0-3.7 1.1-4.7 2.8-2 3.5-.5 8.6 1.4 11.4 1 1.4 2.1 3 3.6 2.9 1.5-.1 2-.9 3.8-.9 1.8 0 2.3.9 3.8.9 1.6 0 2.6-1.4 3.5-2.8 1.1-1.6 1.6-3.2 1.6-3.3 0-.1-3.1-1.2-3.1-4.1ZM15.8 5.9c.8-1 1.3-2.3 1.2-3.6-1.2 0-2.6.8-3.4 1.8-.7.9-1.4 2.3-1.2 3.6 1.3.1 2.6-.7 3.4-1.8Z"
      fill="currentColor"
    />
  </svg>
);

const AccessIcon = ({ type }: { type: string }) => {
  if (type === "hand") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M8 11.5V5.75a1.75 1.75 0 1 1 3.5 0V10h.6V7.75a1.65 1.65 0 1 1 3.3 0V10h.55V8.75a1.55 1.55 0 1 1 3.1 0v4.65c0 4.65-2.55 7.35-6.85 7.35h-1.1c-2.05 0-3.7-.74-4.86-2.18L3.2 14.8a1.82 1.82 0 0 1 2.76-2.36L8 14.25V11.5Z"
          fill="white"
        />
      </svg>
    );
  }

  if (type === "eye") {
    return (
      <svg width="27" height="27" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
          fill="#1b7d0c"
        />
        <circle cx="12" cy="12" r="3" fill="#ebf9e9" />
      </svg>
    );
  }

  if (type === "zoom") {
    return (
      <svg width="27" height="27" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="6.5" stroke="#1b7d0c" strokeWidth="2" />
        <path d="M15 15l6 6" stroke="#1b7d0c" strokeLinecap="round" strokeWidth="2" />
        <path
          d="M10 6v8M6 10h8"
          stroke="#1b7d0c"
          strokeLinecap="round"
          strokeWidth="2"
        />
      </svg>
    );
  }

  if (type === "sun") {
    return (
      <svg width="27" height="27" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="4" stroke="#1b7d0c" strokeWidth="2" />
        <path
          d="M12 1.8v2.4M12 19.8v2.4M4.8 4.8l1.7 1.7M17.5 17.5l1.7 1.7M1.8 12h2.4M19.8 12h2.4M4.8 19.2l1.7-1.7M17.5 6.5l1.7-1.7"
          stroke="#1b7d0c"
          strokeLinecap="round"
          strokeWidth="2"
        />
      </svg>
    );
  }

  return (
    <svg width="27" height="27" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="10" height="10" rx="1.5" stroke="#1b7d0c" strokeWidth="2" />
      <rect x="11" y="10" width="10" height="10" rx="1.5" stroke="#1b7d0c" strokeWidth="2" />
      <path d="M6.2 11 8 7l1.8 4M6.8 9.8h2.4" stroke="#1b7d0c" strokeLinecap="round" />
      <path
        d="M14.2 14.2h4.6M16.5 12.9v1.3M15 14.2c.4 1.7 1.5 2.8 3.4 3.5M18.2 14.2c-.35 1.55-1.35 2.7-3 3.45"
        stroke="#1b7d0c"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const Toggle = ({ active = false }: { active?: boolean }) => (
  <button
    aria-pressed={active}
    className={`flex h-[24px] w-[62px] items-center rounded-full border border-[#1b7d0c] p-[2px] ${
      active ? "justify-end bg-[#146f91]" : "justify-start bg-white"
    }`}
    type="button"
  >
    <span className="h-[20px] w-[20px] rounded-full bg-[#1b7d0c] shadow-sm" />
  </button>
);

const FontControl = () => (
  <span className="flex items-center justify-end gap-[6px]">
    <button
      aria-label="Diminuir fonte"
      className="flex h-[29px] w-[29px] items-center justify-center rounded-full border-0 bg-[#1b7d0c] p-0 text-[24px] leading-none text-white"
      type="button"
    >
      -
    </button>
    <button
      aria-label="Aumentar fonte"
      className="flex h-[29px] w-[29px] items-center justify-center rounded-full border-2 border-[#1b7d0c] bg-white p-0 text-[27px] leading-none text-[#1b7d0c]"
      type="button"
    >
      +
    </button>
  </span>
);

const AccessibilityPanel = ({ firstToggleActive = false }: { firstToggleActive?: boolean }) => (
  <aside className="relative min-w-0 overflow-hidden bg-[#edfdec] px-[clamp(42px,10.8vw,157px)] pb-10 pt-[34px] text-[#1b7d0c]">
    <span className="absolute -left-[63px] -top-[62px] h-[357px] w-[357px] rounded-full bg-[#d3ebcf]" />
    <span className="absolute right-[36px] top-[86px] h-[210px] w-[210px] rounded-full bg-[#d3ebcf]" />
    <span className="absolute bottom-[136px] left-[117px] h-[124px] w-[124px] rounded-full bg-[#d3ebcf]" />
    <span className="absolute -bottom-[170px] right-[1px] h-[315px] w-[315px] rounded-full bg-[#d3ebcf]" />

    <div className="relative z-10 mx-auto max-w-[411px]">
      <img
        className="mx-auto h-[96px] w-[340px] max-w-full object-contain drop-shadow-[0_4px_5px_rgba(0,0,0,0.35)]"
        alt="Acesse+"
        src="/Group-561.svg"
      />
      <p className="mt-[58px] text-[17px] leading-[24px]">
        Descubra tecnologias acessíveis, compare soluções inclusivas, receba
        recomendações personalizadas e encontre autonomia com mais segurança.
      </p>

      <h1 className="mt-[50px] text-center text-[22px] leading-[27px]">
        Melhore a sua experiência!
      </h1>

      <div className="mx-auto mt-[36px] flex w-[277px] max-w-full flex-col gap-[24px]">
        {accessibilityItems.map((item, index) => (
          <div className="grid grid-cols-[32px_1fr_64px] items-center gap-[19px]" key={item.label}>
            <span
              className={
                item.icon === "hand"
                  ? "flex h-[28px] w-[28px] items-center justify-center rounded-[4px] bg-[#1b7d0c]"
                  : "flex h-[28px] w-[28px] items-center justify-center"
              }
            >
              <AccessIcon type={item.icon} />
            </span>
            <span className="whitespace-nowrap text-[13px] leading-[16px]">{item.label}</span>
            {item.control === "font" ? (
              <FontControl />
            ) : (
              <Toggle active={index === 0 && firstToggleActive} />
            )}
          </div>
        ))}
      </div>
    </div>
  </aside>
);

export const AuthLayout = ({ children, firstToggleActive = false }: AuthLayoutProps) => (
  <main className="min-h-screen w-full overflow-x-hidden bg-[#edfdec] font-['Montserrat',sans-serif] text-[#071735] [&_h1]:m-0 [&_h2]:m-0 [&_h3]:m-0 [&_p]:m-0">
    <AppHeader showNav={false} />
    <section className="grid min-h-[801px] w-full grid-cols-1 lg:grid-cols-[minmax(520px,51.2%)_minmax(430px,1fr)]">
      <div className="hidden lg:block">
        <AccessibilityPanel firstToggleActive={firstToggleActive} />
      </div>
      <section className="relative flex min-w-0 items-center justify-center overflow-hidden bg-black px-4 py-8 sm:px-8 sm:py-12">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          alt=""
          src="/image-132@2x.png"
        />
        <div className="absolute inset-0 bg-black/65" />
        <div className="relative z-10 flex w-full justify-center lg:-translate-y-[32px]">
          {children}
        </div>
      </section>
    </section>
  </main>
);
