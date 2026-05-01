import { FaInstagram, FaLinkedinIn, FaWhatsapp } from "react-icons/fa";
import backgroundImage from "../../pages/ImagemDeFundo.png";
import emojiTemplate from "../../pages/EmojiTemplate.png";

const socialLinks = [
  {
    href: "https://wa.me/5581911112222",
    label: "Abrir WhatsApp da Acesse+",
    icon: <FaWhatsapp size={34} />,
  },
  {
    href: "https://www.instagram.com/accenturebrasil/",
    label: "Abrir Instagram da Acesse+",
    icon: <FaInstagram size={34} />,
  },
  {
    href: "https://www.linkedin.com/company/accenture/",
    label: "Abrir LinkedIn da Acesse+",
    icon: <FaLinkedinIn size={34} />,
  },
];

const SocialCommunityCard = () => (
  <section className="w-full bg-white px-0 py-6 sm:py-8">
    <div className="mx-auto w-[calc(100%-24px)] max-w-[1245px] sm:w-[calc(100%-70px)]">
      <div className="relative isolate h-[390px] overflow-visible sm:h-[430px]">
        <div
          className="absolute left-1/2 top-1/2 z-20 aspect-[1245/700] max-w-none -translate-x-1/2 -translate-y-1/2"
          style={{ width: "clamp(760px, 100vw, 1245px)" }}
        >
          <article className="absolute left-0 right-0 top-[30.7%] z-10 h-[38.7%] overflow-hidden rounded-[18px] bg-black text-white shadow-[0_18px_50px_rgba(0,0,0,0.18)] sm:rounded-[22px]">
            <img
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-90"
              src={backgroundImage}
            />
            <div className="absolute inset-0 bg-black/35" />
          </article>

          <img
            alt=""
            className="pointer-events-none absolute inset-0 z-20 h-full w-full max-w-none object-fill opacity-100"
            src={emojiTemplate}
          />

          <div className="absolute left-0 right-0 top-[30.7%] z-30 flex h-[38.7%] flex-col items-center justify-center px-5 text-center text-white sm:px-8">
            <h2 className="max-w-[720px] text-[21px] leading-[29px] text-white sm:text-[27px] sm:leading-[38px]">
              Faça parte da nossa comunidade nas redes sociais e veja informações,
              descontos e eventos acessíveis
            </h2>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-7">
              {socialLinks.map((link) => (
                <a
                  aria-label={link.label}
                  className="flex h-[66px] w-[66px] items-center justify-center rounded-full bg-[#08c56f] text-white no-underline shadow-[0_10px_25px_rgba(0,0,0,0.28)] transition-colors hover:bg-[#06a95f] sm:h-[78px] sm:w-[78px]"
                  href={link.href}
                  key={link.label}
                  rel="noreferrer"
                  target="_blank"
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default SocialCommunityCard;
