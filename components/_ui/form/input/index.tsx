import React from "react";

type InputProps = {
  type: string;
  placeholder: string;
  label: string;
  icon?: React.ReactNode;
  className?: string;
};

const Input: React.FC<InputProps> = ({
  type,
  placeholder,
  label,
  icon,
  className,
}) => {
  return (
    <div className="relative">
      <label
        htmlFor={label}
        className="block text-white mb-1 font-bold text-lg"
      >
        {label}
      </label>
      {icon && (
        <div className="absolute left-3 top-2/3 transform -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      <input
        type={type}
        id={label}
        placeholder={placeholder}
        className={`pl-10 p-3 rounded-md bg-gray-800 text-white w-full focus:outline-none ${className}`}
      />
    </div>
  );
};

export default Input;
