import { FunctionComponent } from "react";

export type FrameComponent4Type = {
  className?: string;
};

const FrameComponent4: FunctionComponent<FrameComponent4Type> = ({
  className = "",
}) => {
  return (
    <section
      className={`w-full !!m-[0 important] absolute top-[89px] right-[0px] left-[0px] flex flex-col items-center !pt-[54px] !pb-[84px] !pl-[21px] !pr-5 box-border isolate gap-24 max-w-full text-center text-[29px] text-[#fefefe] font-[Poppins] mq450:gap-12 ${className}`}
    >
      <div className="w-full h-full absolute !!m-[0 important] top-[0px] right-[0px] bottom-[0px] left-[0px] [filter:blur(22.9px)] bg-[rgba(0,0,0,0.35)] z-[2] shrink-0" />
      <div className="flex items-start !pt-0 !pb-0 !pl-[105px] !pr-[105px] box-border max-w-full shrink-0 mq450:!pl-5 mq450:!pr-5 mq450:box-border">
        <h2 className="!m-0 relative text-[length:inherit] font-normal font-[inherit] z-[3] mq450:text-[23px]">
          Bem-vindo a
        </h2>
      </div>
      <div className="relative text-[15px] font-semibold inline-block max-w-full z-[3] shrink-0">
        Descubra tecnologias acessíveis, compare soluções inclusivas, receba
        recomendações personalizadas e encontre autonomia com mais segurança.
      </div>
      <div className="w-full h-[325px] absolute !!m-[0 important] top-[0px] right-[0px] left-[0px] shrink-0">
        <div className="absolute top-[0px] left-[0px] bg-[#e8f4f8] w-full h-full" />
        <img
          className="absolute top-[109px] left-[576px] [filter:drop-shadow(0px_4px_4px_rgba(0,_0,_0,_0.25))] w-[253.6px] h-[70px] z-[3]"
          alt=""
          src="/Group-561.svg"
        />
      </div>
    </section>
  );
};

export default FrameComponent4;
