import { FunctionComponent, useMemo, type CSSProperties } from "react";

export type FrameComponent2Type = {
  className?: string;
  imveis?: string;
  esportesEFitness?: string;

  /** Style props */
  frameDivPadding?: CSSProperties["padding"];
  frameDivFlex?: CSSProperties["flex"];
  frameDivHeight?: CSSProperties["height"];
  esportesEFitnessAlignSelf?: CSSProperties["alignSelf"];
};

const FrameComponent2: FunctionComponent<FrameComponent2Type> = ({
  className = "",
  imveis,
  esportesEFitness,
  frameDivPadding,
  frameDivFlex,
  frameDivHeight,
  esportesEFitnessAlignSelf,
}) => {
  const frameDiv1Style: CSSProperties = useMemo(() => {
    return {
      padding: frameDivPadding,
    };
  }, [frameDivPadding]);

  const frameDiv2Style: CSSProperties = useMemo(() => {
    return {
      flex: frameDivFlex,
      height: frameDivHeight,
    };
  }, [frameDivFlex, frameDivHeight]);

  const esportesEFitnessStyle: CSSProperties = useMemo(() => {
    return {
      alignSelf: esportesEFitnessAlignSelf,
    };
  }, [esportesEFitnessAlignSelf]);

  return (
    <div
      className={`h-[273px] w-[109px] flex flex-col items-start justify-end !pt-0 !pb-[19px] !pl-0 !pr-1 box-border shrink-0 text-left text-[10px] text-[#01122f] font-[Montserrat] ${className}`}
      style={frameDiv1Style}
    >
      <div className="self-stretch flex-1 flex flex-col items-start gap-[18px]">
        <div
          className="self-stretch flex-1 flex flex-col items-start gap-[3px]"
          style={frameDiv2Style}
        >
          <div className="self-stretch flex-1 relative rounded-[5px] bg-[#fff] z-[1] overflow-hidden">
            <img
              className="w-full h-full object-cover"
              src={`https://placehold.co/108x130?text=${encodeURIComponent(
                imveis || ""
              )}`}
              alt={imveis}
            />
          </div>
          <div className="self-stretch relative leading-[150%] font-semibold z-[1]">
            {imveis}
          </div>
        </div>
        <div className="self-stretch flex-1 flex flex-col items-start gap-[3px]">
          <div className="self-stretch flex-1 relative rounded-[5px] bg-[#fff] z-[1] overflow-hidden">
            <img
              className="w-full h-full object-cover"
              src={`https://placehold.co/108x100?text=${encodeURIComponent(
                (esportesEFitness || "").trim()
              )}`}
              alt={esportesEFitness}
            />
          </div>
          <div
            className="self-stretch relative leading-[150%] font-semibold z-[1]"
            style={esportesEFitnessStyle}
          >
            {esportesEFitness}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrameComponent2;
