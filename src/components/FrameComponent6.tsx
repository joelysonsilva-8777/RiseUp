import { FunctionComponent, useState } from "react";
import FrameComponent2 from "./FrameComponent2";

export type FrameComponent6Type = {
  className?: string;
};

const FrameComponent6: FunctionComponent<FrameComponent6Type> = ({
  className = "",
}) => {
  const [frameComponent2Items] = useState([
    {
      imveis: "Imóveis",
      esportesEFitness: "Esportes e Fitness\n",
      frameDivPadding: "0px 4px 19px 0px" as const,
      frameDivFlex: 1,
      frameDivHeight: undefined,
      esportesEFitnessAlignSelf: "stretch" as const,
    },
    {
      imveis: "Ferramentas\n",
      esportesEFitness: "Beleza e Cuidado Pessoal\n",
      frameDivPadding: "0px 6px 4px 0px" as const,
      frameDivFlex: "unset" as const,
      frameDivHeight: "118px" as const,
      esportesEFitnessAlignSelf: "unset" as const,
    },
    {
      imveis: "Agro",
      esportesEFitness: "Eletrônicos, Áudio e Vídeo",
      frameDivPadding: "0px 4px 4px 0px" as const,
      frameDivFlex: "unset" as const,
      frameDivHeight: "118px" as const,
      esportesEFitnessAlignSelf: "unset" as const,
    },
  ]);
  return (
    <section
      className={`self-stretch h-[419px] flex items-start !pt-0 !pb-[93px] !pl-0 !pr-0 box-border max-w-full text-left text-[10px] text-[#01122f] font-[Montserrat] mq450:!pb-[60px] mq450:box-border ${className}`}
    >
      <div className="self-stretch flex-1 bg-[#eaeaea] flex items-end !pt-0 !pb-[17px] !pl-14 !pr-14 box-border gap-[19px] max-w-full mq1275:flex-wrap mq1275:!pl-7 mq1275:!pr-7 mq1275:box-border">
        <div className="h-[326px] w-[1397px] relative bg-[#eaeaea] hidden max-w-full shrink-0" />
        <div className="self-stretch flex flex-col items-start justify-end !pt-0 !pb-[25px] !pl-0 !pr-[13px] shrink-0 text-2xl">
          <div className="self-stretch flex-1 flex flex-col items-start gap-0.5">
            <div className="w-[211px] flex items-start">
              <h3 className="!m-0 flex-1 relative text-[length:inherit] leading-[150%] font-semibold font-[inherit] z-[1] mq450:text-[19px] mq450:leading-[29px]">
                Categorias
              </h3>
              <h3 className="!m-0 flex-1 relative text-[length:inherit] leading-[150%] font-semibold font-[inherit] z-[2] !ml-[-211px] mq450:text-[19px] mq450:leading-[29px]">
                Categorias
              </h3>
            </div>
            <div className="self-stretch flex-1 flex items-start justify-end">
              <div className="self-stretch w-[231px] relative rounded-[5px] bg-[#fff] z-[2] overflow-hidden">
                <img
                  className="w-full h-full object-cover"
                  src="https://placehold.co/231x140?text=Carros"
                  alt="Carros, Motos e outros"
                />
              </div>
            </div>
            <div className="flex items-start !pt-0 !pb-0 !pl-[72px] !pr-5 text-base mq450:!pl-5 mq450:box-border">
              <h3 className="!m-0 w-[211px] relative text-[length:inherit] leading-[150%] font-semibold font-[inherit] inline-block shrink-0 z-[1]">
                Carros, Motos e outros
              </h3>
            </div>
          </div>
        </div>
        <div className="h-[269px] w-[111px] flex flex-col items-start gap-[3px] shrink-0">
          <div className="self-stretch flex-1 flex items-start !pt-0 !pb-0 !pl-0.5 !pr-1">
            <div className="self-stretch flex-1 relative rounded-[5px] bg-[#fff] z-[1] overflow-hidden">
              <img
                className="w-full h-full object-cover"
                src="https://placehold.co/105x130?text=Celulares"
                alt="Celulares e Telefones"
              />
            </div>
          </div>
          <div className="self-stretch h-[30px] flex items-start !pt-0 !pb-0 !pl-0.5 !pr-0 box-border">
            <div className="self-stretch relative leading-[150%] font-semibold z-[1]">
              Celulares e Telefones
            </div>
          </div>
          <div className="w-[105px] h-[100px] relative rounded-[5px] bg-[#fff] z-[1] overflow-hidden">
            <img
              className="w-full h-full object-cover"
              src="https://placehold.co/105x100?text=Casa"
              alt="Casa, Móveis e Decoração"
            />
          </div>
          <div className="relative leading-[150%] font-semibold z-[1]">
            Casa, Móveis e Decoração
          </div>
        </div>
        <div className="h-[269px] w-[109px] flex flex-col items-start justify-end !pt-0 !pb-[15px] !pl-0 !pr-1 box-border shrink-0">
          <div className="self-stretch flex-1 flex flex-col items-start gap-[3px]">
            <div className="self-stretch flex-1 relative rounded-[5px] bg-[#fff] z-[1] overflow-hidden">
              <img
                className="w-full h-full object-cover"
                src="https://placehold.co/108x130?text=Calcados"
                alt="Calçados, Roupas e Bolsas"
              />
            </div>
            <div className="relative leading-[150%] font-semibold z-[1]">
              Calçados, Roupas e Bolsas
              <br />
            </div>
            <div className="self-stretch h-[100px] relative rounded-[5px] bg-[#fff] z-[1] overflow-hidden">
              <img
                className="w-full h-full object-cover"
                src="https://placehold.co/108x100?text=Informatica"
                alt="Informática"
              />
            </div>
            <div className="self-stretch relative leading-[150%] font-semibold z-[1]">
              Informática
            </div>
          </div>
        </div>
        {frameComponent2Items.map((item, index) => (
          <FrameComponent2
            key={index}
            imveis={item.imveis}
            esportesEFitness={item.esportesEFitness}
            frameDivPadding={item.frameDivPadding}
            frameDivFlex={item.frameDivFlex}
            frameDivHeight={item.frameDivHeight}
            esportesEFitnessAlignSelf={item.esportesEFitnessAlignSelf}
          />
        ))}
        <div className="h-[278px] w-[109px] flex flex-col items-start justify-end !pt-0 !pb-[9px] !pl-0 !pr-[3px] box-border shrink-0">
          <div className="self-stretch flex-1 flex flex-col items-start gap-[3px]">
            <div className="self-stretch flex-1 relative rounded-[5px] bg-[#fff] z-[1] overflow-hidden">
              <img
                className="w-full h-full object-cover"
                src="https://placehold.co/109x130?text=Alimentos"
                alt="Alimentos e Bebidas"
              />
            </div>
            <div className="h-[30px] relative leading-[150%] font-semibold inline-block z-[1]">
              Alimentos e Bebidas
            </div>
            <div className="self-stretch h-[100px] relative rounded-[5px] bg-[#fff] z-[1] overflow-hidden">
              <img
                className="w-full h-full object-cover"
                src="https://placehold.co/109x100?text=Antiguidades"
                alt="Antiguidades e Coleções"
              />
            </div>
            <div className="relative leading-[150%] font-semibold z-[1]">
              Antiguidades e Coleções
            </div>
          </div>
        </div>
        <div className="h-[282px] w-[105px] flex flex-col items-start justify-end !pt-0 !pb-7 !pl-0 !pr-0 box-border shrink-0">
          <div className="self-stretch flex-1 flex flex-col items-start gap-[3px]">
            <div className="self-stretch flex-1 relative rounded-[5px] bg-[#fff] z-[1] overflow-hidden">
              <img
                className="w-full h-full object-cover"
                src="https://placehold.co/105x130?text=Arte"
                alt="Arte, Papelaria e Armarinho"
              />
            </div>
            <div className="relative leading-[150%] font-semibold z-[1]">
              Arte, Papelaria e Armarinho
            </div>
            <div className="self-stretch h-[100px] relative rounded-[5px] bg-[#fff] z-[1] overflow-hidden">
              <img
                className="w-full h-full object-cover"
                src="https://placehold.co/105x100?text=Saude"
                alt="Saúde"
              />
            </div>
            <div className="self-stretch relative leading-[150%] font-semibold z-[1]">
              Saúde
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FrameComponent6;
