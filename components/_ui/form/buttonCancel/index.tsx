import React from "react";

type ButtonCancelProps = {
  label: string;
  onClick: () => void;
  className?: string;
};

const ButtonCancel: React.FC<ButtonCancelProps> = ({
  label,
  onClick,
  className,
}) => {
  return (
    <div className="flex justify-end">
      <button
        onClick={onClick}
        className={`bg-red-600 mt-8 hover:bg-red-700 w-28 text-white font-bold py-2 px-4 border-b-4 border-red-700 rounded transform transition duration-200 ease-in-out hover:-translate-y-1 hover:scale-110 ${className}`}
      >
        {label}
      </button>
    </div>
  );
};

export default ButtonCancel;
