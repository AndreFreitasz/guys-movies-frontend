import React from "react";

type ButtonSubmitProps = {
  label: string;
  onClick: () => void;
  className?: string;
};

const ButtonSubmit: React.FC<ButtonSubmitProps> = ({
  label,
  onClick,
  className,
}) => {
  return (
    <div className="flex justify-end">
      <button
        onClick={onClick}
        className={`bg-indigo-600 mt-8 hover:bg-indigo-700 w-28 text-white font-bold py-2 px-4 border-b-4 border-indigo-700 rounded transform transition duration-200 ease-in-out hover:-translate-y-1 hover:scale-110 ${className}`}
      >
        {label}
      </button>
    </div>
  );
};

export default ButtonSubmit;
