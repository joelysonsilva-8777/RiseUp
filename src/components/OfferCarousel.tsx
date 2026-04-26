import { FunctionComponent } from "react";

export type OfferCarouselType = {
  className?: string;
};

const OfferCarousel: FunctionComponent<OfferCarouselType> = ({
  className = "",
}) => {
  return (
    <div
      className={`self-stretch h-[426px] relative max-w-full text-left text-sm text-[#01122f] font-[Montserrat] mq450:h-auto mq450:min-h-[426px] ${className}`}
    >
      <section className="absolute top-[35px] left-[475px] w-[535px] flex flex-col items-start gap-px max-w-full text-left text-xl text-[#01122f] font-[Montserrat]">
        <div className="self-stretch flex items-start !pt-0 !pb-[5px] !pl-0 !pr-0 box-border max-w-full">
          <div className="flex-1 relative leading-[150%] font-semibold inline-block max-w-full">
            <span className="whitespace-pre-wrap">{`Ofertas     `}</span>
            <span className="text-[11px] text-[#4388ff]">
              mostrar todas as ofertas
              <br />
            </span>
          </div>
        </div>
        <div className="w-[402px] flex items-start flex-wrap content-start gap-[30px] max-w-full">
          <div className="h-[162px] flex-1 relative rounded-[5px] bg-[#fff] min-w-[121px] overflow-hidden">
            <img
              className="w-full h-full object-cover"
              src="https://placehold.co/186x162?text=Galaxy+A5"
              alt="Samsung Galaxy A5 - Branco"
            />
          </div>
          <div className="h-[162px] flex-1 relative rounded-[5px] bg-[#fff] min-w-[121px] overflow-hidden">
            <img
              className="w-full h-full object-cover"
              src="https://placehold.co/186x162?text=Galaxy+Tab+A11"
              alt="Galaxy tap a11"
            />
          </div>
        </div>
        <div className="w-[403px] flex items-start flex-wrap content-start !pt-0 !pb-2.5 !pl-0 !pr-0 box-border gap-[31px] max-w-full text-sm">
          <div className="flex-1 flex flex-col items-start !pt-[5px] !pb-0 !pl-0 !pr-0 box-border min-w-[121px]">
            <div className="self-stretch relative leading-[150%] font-semibold">
              Samsung Galaxy A5 - <br />
              Branco
            </div>
          </div>
          <div className="flex-1 relative leading-[150%] font-semibold inline-block min-w-[121px]">
            Galaxy tap a11
          </div>
        </div>
        <div className="w-[403px] flex flex-col items-start gap-4 max-w-full text-[11px] text-[#8694aa]">
          <div className="self-stretch flex flex-col items-start">
            <div className="w-[186px] relative leading-[150%] font-semibold inline-block">
              R$ 750
            </div>
            <div className="self-stretch flex items-start flex-wrap content-start gap-[31px] !mt-[-3px] relative text-base text-[#01122f]">
              <div className="flex-1 relative leading-[150%] font-semibold inline-block min-w-[121px]">
                R$ 700
              </div>
              <div className="flex-1 relative leading-[150%] font-semibold inline-block min-w-[121px]">
                R$ 850
              </div>
            </div>
          </div>
          <div className="self-stretch flex items-start flex-wrap content-start gap-[30px] text-[#1e1e1e]">
            <div className="flex-1 relative leading-[150%] font-semibold whitespace-pre-wrap inline-block min-w-[121px] shrink-0">
              Hoje, 16:46 Paulista - PE
            </div>
            <div className="flex-1 relative leading-[150%] font-semibold whitespace-pre-wrap inline-block min-w-[121px] shrink-0">
              Hoje, 16:46 Paulista - PE
            </div>
          </div>
        </div>
      </section>
      <div className="absolute top-[74px] left-[914px] w-[189px] h-[292px] flex flex-col items-start gap-[29px]">
        <div className="self-stretch flex-1 flex flex-col items-start gap-0.5">
          <div className="self-stretch flex-1 relative rounded-[5px] bg-[#fff] overflow-hidden">
            <img
              className="w-full h-full object-cover"
              src="https://placehold.co/189x200?text=iPhone+17+Pro"
              alt="iPhone 17 Pro Max 512GB"
            />
          </div>
          <div className="relative leading-[150%] font-semibold">
            iPhone 17 Pro Max 512GB - LACRADO
          </div>
        </div>
        <div className="self-stretch flex flex-col items-start gap-4 text-base">
          <div className="self-stretch flex items-start !pt-0 !pb-0 !pl-[3px] !pr-0">
            <div className="flex-1 relative leading-[150%] font-semibold">
              R$ 11.850
            </div>
          </div>
          <div className="self-stretch relative text-[11px] leading-[150%] font-semibold text-[#1e1e1e] whitespace-pre-wrap shrink-0">
            Hoje, 16:46 Paulista - PE
          </div>
        </div>
      </div>
      <div className="absolute top-[74px] left-[1136px] w-48 h-[292px] flex flex-col items-start gap-[29px]">
        <div className="self-stretch flex-1 flex flex-col items-start gap-0.5">
          <div className="w-[186px] flex-1 relative rounded-[5px] bg-[#fff] overflow-hidden">
            <img
              className="w-full h-full object-cover"
              src="https://placehold.co/186x200?text=Redmi+Note+14"
              alt="Redmi note 14 pro+ 256 gb"
            />
          </div>
          <div className="h-[42px] relative leading-[150%] font-semibold inline-block">
            Redmi note 14 pro+ 256 gb
          </div>
        </div>
        <div className="w-[186px] flex flex-col items-start gap-4 text-base">
          <div className="self-stretch relative leading-[150%] font-semibold">
            R$ 1.200
          </div>
          <div className="self-stretch relative text-[11px] leading-[150%] font-semibold text-[#1e1e1e] whitespace-pre-wrap shrink-0">
            Hoje, 16:46 Paulista - PE
          </div>
        </div>
      </div>
      <section className="absolute top-[0px] left-[0px] rounded-[10px] bg-[#fff] w-[415px] flex flex-col items-start !pt-2.5 !pb-2 !pl-[30px] !pr-0 box-border gap-[5px] max-w-full text-left text-xl text-[#01122f] font-[Montserrat]">
        <div className="w-[415px] h-[426px] relative rounded-[10px] bg-[#fff] hidden max-w-full shrink-0" />
        <h2 className="!m-0 self-stretch relative text-[32px] leading-[150%] font-semibold font-[inherit] z-[1] shrink-0 mq450:text-[19px] mq450:leading-[29px] mq750:text-[26px] mq750:leading-[38px]">
          Oferta do dia
        </h2>
        <div className="w-[354px] h-[205px] flex items-start !pt-0 !pb-0 !pl-[59px] !pr-[59px] box-border max-w-full shrink-0">
          <div className="self-stretch flex-1 relative rounded-[5px] bg-[#d9d9d9] z-[1] overflow-hidden">
            <img
              className="w-full h-full object-cover"
              src="https://placehold.co/236x205?text=Galaxy+A5"
              alt="Samsung Galaxy A5 - Branco"
            />
          </div>
        </div>
        <div className="w-[340px] flex items-start !pt-0 !pb-1.5 !pl-0 !pr-0 box-border max-w-full shrink-0">
          <h3 className="!m-0 flex-1 relative text-[length:inherit] leading-[150%] font-semibold font-[inherit] inline-block max-w-full z-[1] mq450:text-base mq450:leading-6">
            Samsung Galaxy A5 - Branco
          </h3>
        </div>
        <div className="w-[164px] flex flex-col items-start !pt-0 !pb-[3px] !pl-0 !pr-0 box-border shrink-0 text-base text-[#8694aa]">
          <div className="self-stretch relative leading-[150%] font-semibold z-[1]">
            R$ 750
          </div>
          <h2 className="!m-0 self-stretch relative text-[32px] leading-[150%] font-semibold font-[inherit] text-[#01122f] z-[1] !mt-[-6px] mq450:text-[19px] mq450:leading-[29px] mq750:text-[26px] mq750:leading-[38px]">
            R$ 700
          </h2>
        </div>
        <h3 className="!m-0 w-[294px] relative text-[length:inherit] leading-[150%] font-semibold font-[inherit] text-[#1e1e1e] whitespace-pre-wrap inline-block z-[1] shrink-0 mq450:text-base mq450:leading-6">
          Hoje, 16:46 Paulista - PE
        </h3>
      </section>
    </div>
  );
};

export default OfferCarousel;
