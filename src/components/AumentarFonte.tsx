import { FunctionComponent } from "react";

export type AumentarFonteType = {
  className?: string;
};

const AumentarFonte: FunctionComponent<AumentarFonteType> = ({
  className = "",
}) => {
  return (
    <div
      className={`flex flex-row items-center justify-start gap-2 text-left text-sm font-inter ${className}`}
    >
      <div className="text-xs font-medium text-gray-600">A</div>
      <div className="text-base font-medium text-gray-800">A</div>
      <div className="text-xl font-medium text-gray-900">A</div>
    </div>
  );
};

export default AumentarFonte;
