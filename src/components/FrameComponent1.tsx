import { FunctionComponent, useMemo, type CSSProperties } from "react";

export type FrameComponent1Type = {
  className?: string;

  /** Style props */
  frameDivFlex?: CSSProperties["flex"];
  frameDivWidth?: CSSProperties["width"];
};

const FrameComponent1: FunctionComponent<FrameComponent1Type> = ({
  className = "",
  frameDivFlex,
  frameDivWidth,
}) => {
  const frameDivStyle: CSSProperties = useMemo(() => {
    return {
      flex: frameDivFlex,
      width: frameDivWidth,
    };
  }, [frameDivFlex, frameDivWidth]);

  return (
    <div
      className={`h-[331px] flex-1 relative max-w-full text-left text-[11px] text-[#01122f] font-[Montserrat] mq1100:h-auto mq1100:min-h-[331px] ${className}`}
      style={frameDivStyle}
    >
      <h3 className="!m-0 absolute top-[0px] left-[0px] text-xl leading-[150%] font-semibold font-[inherit] inline-block w-[535px] mq450:text-base mq450:leading-6">
        Baixaram de preço em Eletrônicos e celulares
      </h3>
      <div className="absolute top-[34px] left-[0px] w-[1273px] flex items-end gap-[27px] max-w-full mq1100:flex-wrap">
        <div className="flex-[0.9841] flex flex-col items-start !pt-0 !pb-0 !pl-0 !pr-[3px] box-border min-w-[185px] max-w-[189px] mq450:flex-1">
          <div className="self-stretch h-[162px] relative rounded-[5px] bg-[#fff] overflow-hidden">
            <img
              className="w-full h-full object-cover"
              src="https://placehold.co/186x162?text=Galaxy+A5"
              alt="Samsung Galaxy A5"
            />
          </div>
        </div>
        <div className="flex-[0.949] flex flex-col items-start !pt-0 !pb-0 !pl-0 !pr-2.5 box-border min-w-[192px] max-w-[196px] mq450:flex-1">
          <div className="self-stretch h-[162px] relative rounded-[5px] bg-[#fff] overflow-hidden">
            <img
              className="w-full h-full object-cover"
              src="https://placehold.co/186x162?text=Galaxy+Tab+A11"
              alt="Galaxy tap a11"
            />
          </div>
        </div>
        <div className="flex-[0.9538] flex flex-col items-start !pt-0 !pb-0 !pl-0 !pr-[9px] box-border max-w-[195px] mq450:flex-1">
          <div className="self-stretch h-[162px] relative rounded-[5px] bg-[#fff] overflow-hidden">
            <img
              className="w-full h-full object-cover"
              src="https://placehold.co/186x162?text=iPhone+17+Pro"
              alt="iPhone 17 Pro Max"
            />
          </div>
        </div>
        <div className="h-[162px] flex-1 relative rounded-[5px] bg-[#fff] max-w-[186px] overflow-hidden">
          <img
            className="w-full h-full object-cover"
            src="https://placehold.co/186x162?text=Redmi+Note+14"
            alt="Redmi note 14 pro+"
          />
        </div>
        <div className="h-[162px] flex-1 relative rounded-[5px] bg-[#fff] max-w-[186px] overflow-hidden">
          <img
            className="w-full h-full object-cover"
            src="https://placehold.co/186x162?text=Redmi+Note+14"
            alt="Redmi note 14 pro+"
          />
        </div>
        <div className="flex-1 flex flex-col items-start justify-end !pt-0 !pb-[5px] !pl-0 !pr-0 box-border min-w-[182px] max-w-[186px]">
          <div className="self-stretch h-[162px] relative rounded-[5px] bg-[#fff] overflow-hidden">
            <img
              className="w-full h-full object-cover"
              src="https://placehold.co/186x162?text=Redmi+Note+14"
              alt="Redmi note 14 pro+"
            />
          </div>
        </div>
      </div>
      <div className="absolute top-[198px] left-[0px] w-full flex items-start gap-[21px] max-w-full text-sm mq1275:flex-wrap">
        <div className="w-[196px] flex flex-col items-start !pt-[9px] !pb-0 !pl-0 !pr-2.5 box-border">
          <div className="self-stretch relative leading-[150%] font-semibold">
            Samsung Galaxy A5 - <br />
            Branco
          </div>
        </div>
        <div className="w-[201px] flex flex-col items-start !pt-1 !pb-0 !pl-0 !pr-[15px] box-border">
          <div className="self-stretch relative leading-[150%] font-semibold">
            Galaxy tap a11
          </div>
        </div>
        <div className="flex-1 flex flex-col items-start !pt-[5px] !pb-0 !pl-0 !pr-0 box-border min-w-[269px] max-w-full">
          <div className="self-stretch flex items-start gap-9 mq450:gap-[18px] mq450:flex-wrap">
            <div className="flex-1 relative leading-[150%] font-semibold inline-block min-w-[121px]">
              iPhone 17 Pro Max 512GB - LACRADO
            </div>
            <div className="h-[42px] relative leading-[150%] font-semibold inline-block">
              Redmi note 14 pro+ 256 gb
            </div>
          </div>
        </div>
        <div className="h-[47px] flex flex-col items-start !pt-[5px] !pb-0 !pl-0 !pr-0 box-border">
          <div className="flex-1 relative leading-[150%] font-semibold">
            Redmi note 14 pro+ 256 gb
          </div>
        </div>
        <div className="h-[42px] relative leading-[150%] font-semibold inline-block">
          Redmi note 14 pro+ 256 gb
        </div>
      </div>
      <div className="absolute top-[260px] left-[0px] w-full flex flex-col items-start max-w-full text-[#8694aa]">
        <div className="w-[186px] relative leading-[150%] font-semibold inline-block z-[1]">
          R$ 750
        </div>
        <div className="self-stretch flex items-start gap-[27px] !mt-[-8px] relative text-base text-[#01122f] mq1100:flex-wrap">
          <div className="flex-[0.9789] flex flex-col items-start !pt-[5px] !pb-0 !pl-0 !pr-1 box-border max-w-[190px] mq450:flex-1">
            <div className="self-stretch relative leading-[150%] font-semibold">
              R$ 700
            </div>
          </div>
          <div className="flex-[0.9394] flex flex-col items-start !pt-[5px] !pb-0 !pl-0 !pr-3 box-border min-w-[194px] max-w-[198px] mq450:flex-1">
            <div className="self-stretch relative leading-[150%] font-semibold">
              R$ 850
            </div>
          </div>
          <div className="flex-[0.9688] flex flex-col items-start !pt-[5px] !pb-0 !pl-0 !pr-1.5 box-border min-w-[188px] max-w-[192px] mq450:flex-1">
            <div className="self-stretch relative leading-[150%] font-semibold">
              R$ 11.850
            </div>
          </div>
          <div className="flex-1 flex flex-col items-start !pt-[5px] !pb-0 !pl-0 !pr-0 box-border min-w-[182px] max-w-[186px]">
            <div className="self-stretch relative leading-[150%] font-semibold">
              R$ 1.200
            </div>
          </div>
          <div className="flex-1 flex flex-col items-start !pt-[5px] !pb-0 !pl-0 !pr-0 box-border min-w-[182px] max-w-[186px]">
            <div className="self-stretch relative leading-[150%] font-semibold">
              R$ 1.200
            </div>
          </div>
          <div className="flex-1 relative leading-[150%] font-semibold inline-block min-w-[182px] max-w-[186px]">
            R$ 1.200
          </div>
        </div>
      </div>
      <div className="absolute top-[309px] left-[0px] w-full flex items-start gap-[27px] max-w-full text-[#1e1e1e] mq1100:flex-wrap">
        <div className="flex-[0.9841] flex flex-col items-start !pt-[5px] !pb-0 !pl-0 !pr-[3px] box-border min-w-[185px] max-w-[189px] mq450:flex-1">
          <div className="self-stretch relative leading-[150%] font-semibold whitespace-pre-wrap shrink-0">
            Hoje, 16:46 Paulista - PE
          </div>
        </div>
        <div className="flex-[0.949] flex flex-col items-start !pt-[5px] !pb-0 !pl-0 !pr-2.5 box-border min-w-[192px] max-w-[196px] mq450:flex-1">
          <div className="self-stretch relative leading-[150%] font-semibold whitespace-pre-wrap shrink-0">
            Hoje, 16:46 Paulista - PE
          </div>
        </div>
        <div className="flex-[0.9538] flex flex-col items-start !pt-[5px] !pb-0 !pl-0 !pr-[9px] box-border max-w-[195px] mq450:flex-1">
          <div className="self-stretch relative leading-[150%] font-semibold whitespace-pre-wrap shrink-0">
            Hoje, 16:46 Paulista - PE
          </div>
        </div>
        <div className="flex-1 flex flex-col items-start !pt-[5px] !pb-0 !pl-0 !pr-0 box-border max-w-[186px]">
          <div className="self-stretch relative leading-[150%] font-semibold whitespace-pre-wrap shrink-0">
            Hoje, 16:46 Paulista - PE
          </div>
        </div>
        <div className="flex-1 flex flex-col items-start !pt-[5px] !pb-0 !pl-0 !pr-0 box-border max-w-[186px]">
          <div className="self-stretch relative leading-[150%] font-semibold whitespace-pre-wrap shrink-0">
            Hoje, 16:46 Paulista - PE
          </div>
        </div>
        <div className="flex-1 relative leading-[150%] font-semibold whitespace-pre-wrap inline-block min-w-[182px] max-w-[186px] shrink-0">
          Hoje, 16:46 Paulista - PE
        </div>
      </div>
    </div>
  );
};

export default FrameComponent1;
