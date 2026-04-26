import { FunctionComponent, useState } from "react";

export type SwitchButtonType = {
  className?: string;
};

const SwitchButton: FunctionComponent<SwitchButtonType> = ({
  className = "",
}) => {
  const [isOn, setIsOn] = useState(false);

  return (
    <div
      className={`w-[51px] h-[31px] rounded-[15.5px] relative cursor-pointer ${
        isOn ? "bg-[#34c759]" : "bg-[#e5e5ea]"
      } ${className}`}
      onClick={() => setIsOn(!isOn)}
    >
      <div
        className={`absolute top-[2px] w-[27px] h-[27px] rounded-full bg-white shadow-[0px_3px_8px_rgba(0,0,0,0.15)] transition-all duration-200 ${
          isOn ? "left-[22px]" : "left-[2px]"
        }`}
      />
    </div>
  );
};

export default SwitchButton;
