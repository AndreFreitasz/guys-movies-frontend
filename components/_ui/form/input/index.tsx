import React, { forwardRef } from "react";

type InputProps = {
  type: string;
  placeholder: string;
  label: string;
  icon?: React.ReactNode;
  className?: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ type, placeholder, label, icon, className, error, ...rest }, ref) => {
    const inputPadding = icon ? "pl-10" : "pl-3";

    return (
      <div className="relative">
        <label className="block text-white mb-1 font-bold text-lg">
          {label}
        </label>
        {icon && (
          <div className="absolute left-3 top-2/3 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          className={`${inputPadding} p-3 rounded-md bg-gray-800 text-white w-full focus:outline-none ${className}`}
          {...rest}
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  },
);

export default Input;
