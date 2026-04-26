import { FunctionComponent } from "react";

export type FrameComponent5Type = {
  className?: string;
};

const FrameComponent5: FunctionComponent<FrameComponent5Type> = ({
  className = "",
}) => {
  return (
    <section
      className={`self-stretch flex items-start justify-center !pt-0 !pb-0 !pl-0 !pr-0 box-border max-w-full text-center text-[10px] text-[#08c00f] font-[Montserrat] mq450:!pl-5 mq450:!pr-5 mq450:box-border mq750:!pl-5 mq750:!pr-5 mq750:box-border ${className}`}
    >
      <div className="w-max flex flex-col items-center max-w-full ml-[96px] mq750:ml-0">
        <div className="w-[803px] flex items-start max-w-full">
          <div className="w-[169px] rounded-[13px] bg-[#fff] flex flex-col items-start !pt-0 !pb-1.5 !pl-[21px] !pr-[21px] box-border gap-[60px] shrink-0 z-[3]">
            <div className="w-[169px] h-[164px] relative rounded-[13px] bg-[#fff] hidden shrink-0" />
            <div className="flex items-start !pt-0 !pb-0 !pl-6 !pr-6 shrink-0">
              <img
                className="h-[79px] w-[79px] relative object-cover z-[4]"
                loading="lazy"
                alt=""
                src="/Empty-Box@2x.png"
              />
            </div>
            <div className="self-stretch rounded bg-[rgba(8,192,15,0.3)] flex items-start !pt-0.5 !pb-0.5 !pl-0 !pr-0 z-[4] shrink-0">
              <div className="h-[19px] w-[127px] relative rounded bg-[rgba(8,192,15,0.3)] hidden shrink-0" />
              <div className="flex-1 relative leading-[150%] font-semibold z-[5] shrink-0">
                Mostrar Produtos
              </div>
            </div>
          </div>
        </div>
        <div className="self-stretch flex items-start justify-end !pt-0 !pb-0 !pl-[216px] !pr-[418px] !mt-[-164px] relative mq450:!pl-5 mq450:!pr-5 mq450:box-border mq1100:!pl-[108px] mq1100:!pr-[209px] mq1100:box-border">
          <div className="w-[169px] rounded-[13px] bg-[#fff] flex flex-col items-start !pt-0 !pb-1.5 !pl-[21px] !pr-[21px] box-border gap-[60px] shrink-0 z-[3]">
            <div className="flex items-start !pt-0 !pb-0 !pl-6 !pr-6 shrink-0">
              <img
                className="h-[79px] w-[79px] relative object-cover z-[4]"
                loading="lazy"
                alt="Mostrar Meios"
                src="/Magnifier.svg"
              />
            </div>
            <div className="h-[164px] w-[169px] relative rounded-[13px] bg-[#fff] hidden shrink-0" />
            <div className="flex-1 rounded bg-[rgba(8,192,15,0.3)] flex items-start !pt-0.5 !pb-0.5 !pl-0 !pr-0 z-[4] shrink-0">
              <div className="h-[19px] w-[127px] relative rounded bg-[rgba(8,192,15,0.3)] hidden shrink-0" />
              <div className="flex-1 relative leading-[150%] font-semibold z-[5] shrink-0">
                Mostrar Meios
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-start justify-end !pt-0 !pb-0 !pl-[209px] !pr-[209px] box-border max-w-full !mt-[-164px] relative mq450:!pl-5 mq450:!pr-5 mq450:box-border mq750:!pl-[104px] mq750:!pr-[104px] mq750:box-border">
          <div className="w-[169px] rounded-[13px] bg-[#fff] flex flex-col items-start !pt-0 !pb-1.5 !pl-[21px] !pr-[21px] box-border gap-[52px] shrink-0 z-[3]">
            <div className="w-[169px] h-[164px] relative rounded-[13px] bg-[#fff] hidden shrink-0" />
            <div className="flex items-start !pt-0 !pb-0 !pl-5 !pr-5 shrink-0">
              <img
                className="h-[87px] w-[87px] relative object-cover z-[4]"
                loading="lazy"
                alt=""
                src="/Market-Square@2x.png"
              />
            </div>
            <div className="self-stretch rounded bg-[rgba(8,192,15,0.3)] flex items-start !pt-0.5 !pb-0.5 !pl-0 !pr-0 z-[4] shrink-0">
              <div className="h-[19px] w-[127px] relative rounded bg-[rgba(8,192,15,0.3)] hidden shrink-0" />
              <div className="flex-1 relative leading-[150%] font-semibold z-[5] shrink-0">
                Mostrar Produtos
              </div>
            </div>
          </div>
        </div>
        <div className="w-[169px] rounded-[13px] bg-[#fff] flex flex-col items-start !pt-0 !pb-1.5 !pl-[21px] !pr-5 box-border gap-[57px] shrink-0 z-[3] !mt-[-164px] relative">
          <div className="w-[169px] h-[164px] relative rounded-[13px] bg-[#fff] hidden shrink-0" />
          <div className="flex items-start !pt-0 !pb-0 !pl-[23px] !pr-6 shrink-0">
            <div className="h-[82px] w-[81px] relative bg-[url('/public/Account-Image@3x.png')] bg-cover bg-no-repeat bg-[top] z-[4]">
              <img
                className="absolute top-[0px] left-[0px] w-full h-full object-cover hidden"
                alt=""
                src="/Browse-page@2x.png"
              />
              <img
                className="absolute top-[24px] left-[18.4px] w-[43.8px] h-[43.8px] object-contain"
                alt=""
                src="/Users@2x.png"
              />
            </div>
          </div>
          <div className="self-stretch rounded bg-[rgba(8,192,15,0.3)] flex items-start !pt-0.5 !pb-0.5 !pl-px !pr-0 z-[4] shrink-0">
            <div className="h-[19px] w-[127px] relative rounded bg-[rgba(8,192,15,0.3)] hidden shrink-0" />
            <div className="flex-1 relative leading-[150%] font-semibold z-[5] shrink-0">
              Entrar na sua Conta
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FrameComponent5;
