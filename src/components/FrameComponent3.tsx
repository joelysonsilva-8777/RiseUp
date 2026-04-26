import { FunctionComponent } from "react";

export type FrameComponent3Type = {
  className?: string;
};

const FrameComponent3: FunctionComponent<FrameComponent3Type> = ({
  className = "",
}) => {
  return (
    <section
      className={`self-stretch flex flex-col items-start max-w-full text-left text-base text-[#ecf8e8] font-[Inter] ${className}`}
    >
      <div className="self-stretch flex items-start relative isolate max-w-full">
        <img
          className="h-[13px] w-[25px] absolute !!m-[0 important] top-[12px] left-[45px] object-cover"
          alt=""
          src="/Status-Item@2x.png"
        />
        <img
          className="h-[9px] w-5 absolute !!m-[0 important] top-[14px] right-[34px] object-contain"
          alt=""
          src="/Nearly-Empty-Battery@2x.png"
        />
        <img
          className="h-3.5 w-[11px] absolute !!m-[0 important] top-[10px] right-[76px] object-cover z-[2]"
          alt=""
          src="/Signal@2x.png"
        />
        <div className="flex-1 bg-[#257a0d] overflow-hidden flex items-start !pt-[19px] !pb-[17px] !pl-3.5 !pr-3.5 box-border gap-[7px] max-w-full z-[3]">
          <div className="flex flex-col items-start !pt-[5px] !pb-0 !pl-0 !pr-[19px]">
            <img
              className="self-stretch h-[37px] relative [filter:drop-shadow(0px_4px_4px_rgba(0,_0,_0,_0.25))] max-w-full overflow-hidden shrink-0"
              alt=""
              src="/Group-56.svg"
            />
          </div>
          <div className="flex flex-col items-start !pt-px !pb-0 !pl-0 !pr-[19px]">
            <div className="flex flex-col items-start">
              <div className="flex items-start gap-[3px]">
                <h3 className="!m-0 relative text-[length:inherit] font-bold font-[inherit]">
                  Whats app
                </h3>
                <img className="h-6 w-6 relative" alt="" src="/Frame.svg" />
              </div>
              <b className="relative text-xs">(81) 91111-2222</b>
            </div>
          </div>
          <div className="w-[802px] flex flex-col items-start !pt-0 !pb-0 !pl-0 !pr-[30px] box-border max-w-full text-xs text-[#257a0d]">
            <div className="self-stretch rounded-[10px] bg-[#ecf8e8] flex items-start !pt-2 !pb-2 !pl-[18px] !pr-[18px] box-border max-w-full">
              <div className="h-10 w-[772px] relative rounded-[10px] bg-[#ecf8e8] hidden max-w-full z-[1] shrink-0" />
              <div className="flex flex-col items-start !pt-0 !pb-0 !pl-0 !pr-[7px] shrink-0">
                <img
                  className="w-6 h-6 relative z-[1]"
                  alt=""
                  src="/Magnifier.svg"
                />
              </div>
              <div className="flex flex-col items-start !pt-[3px] !pb-0 !pl-0 !pr-0 !ml-[-2px] relative shrink-0">
                <div className="relative whitespace-pre-wrap inline-block min-w-[64px] z-[1]">{`Buscar na  `}</div>
              </div>
              <div className="flex flex-col items-start !pt-[3px] !pb-0 !pl-0 !pr-0 !ml-[-2px] relative shrink-0">
                <img
                  className="self-stretch h-[17.9px] relative [filter:drop-shadow(0px_4px_4px_rgba(0,_0,_0,_0.25))] max-w-full overflow-hidden shrink-0 z-[1]"
                  loading="lazy"
                  alt=""
                  src="/Group-57.svg"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start !pt-1.5 !pb-0 !pl-0 !pr-[29px]">
            <img
              className="w-[25px] h-[25px] relative"
              alt=""
              src="/Location-Pin.svg"
            />
          </div>
          <div className="flex flex-col items-start !pt-[7px] !pb-0 !pl-0 !pr-0">
            <img
              className="w-[26px] h-[26px] relative"
              alt=""
              src="/Profile-Picture.svg"
            />
          </div>
          <div className="flex flex-col items-start !pt-[11px] !pb-0 !pl-0 !pr-5 text-[#fff]">
            <h3 className="!m-0 relative text-[length:inherit] font-bold font-[inherit]">
              Olá, Jose!
            </h3>
          </div>
          <div className="flex flex-col items-start !pt-1.5 !pb-0 !pl-0 !pr-0">
            <img className="w-6 h-6 relative" alt="" src="/Icon-Button.svg" />
          </div>
        </div>
      </div>
      <div className="self-stretch bg-[#f6f6f6] overflow-hidden flex items-start !pt-[11px] !pb-1 !pl-[34px] !pr-[34px] relative isolate gap-[83px] z-[4] text-xs text-[#257a0d] mq450:gap-[21px] mq1100:gap-[41px]">
        <div className="flex flex-col items-start !pt-[3px] !pb-0 !pl-0 !pr-0">
          <div className="flex items-start gap-2">
            <img
              className="h-[18px] w-[18px] relative"
              alt=""
              src="/Menu-Background.svg"
            />
            <div className="flex flex-col items-start !pt-px !pb-0 !pl-0 !pr-0">
              <b className="relative">Departamentos</b>
            </div>
          </div>
        </div>
        <img
          className="h-[25.4px] w-[25.5px] absolute !!m-[0 important] bottom-[9.6px] left-[424px] object-contain"
          alt=""
          src="/Vector.svg"
        />
        <div className="flex items-start !pt-0 !pb-0 !pl-0 !pr-11 gap-[11px]">
          <div className="flex flex-col items-start !pt-px !pb-0 !pl-0 !pr-0">
            <img
              className="w-[22px] h-[22px] relative"
              alt=""
              src="/Location-Icon.svg"
            />
          </div>
          <div className="flex flex-col items-start gap-px">
            <div className="relative">Enviar para</div>
            <b className="relative">44586-284</b>
          </div>
        </div>
        <div className="flex flex-col items-start !pt-1 !pb-0 !pl-0 !pr-[11px]">
          <b className="relative z-[5]">Meus Cupons</b>
        </div>
        <div className="flex flex-col items-start !pt-[5px] !pb-0 !pl-0 !pr-0">
          <b className="relative">Ofertas Exclusivas</b>
        </div>
      </div>
    </section>
  );
};

export default FrameComponent3;
