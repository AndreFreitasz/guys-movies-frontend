import React, { forwardRef, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

type InputProps = {
  type: string;
  placeholder?: string;
  label: string;
  icon?: React.ReactNode;
  className?: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ type, placeholder, label, icon, className, error, ...rest }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isRevealed, setIsRevealed] = useState(false);

    const isPassword = type === "password";
    const resolvedType = isPassword && isRevealed ? "text" : type;

    return (
      <div className="w-full">
        <label className="mb-2 block text-[0.7rem] font-bold uppercase tracking-[0.15em] text-white/45">
          {label}
        </label>
        <div
          className={`flex items-center gap-3 rounded-2xl border bg-white/[0.04] px-4 transition-all duration-300 ease-ios ${
            error
              ? "border-red-400/50 bg-red-500/[0.04]"
              : isFocused
                ? "border-indigo-400/60 bg-white/[0.07] shadow-glow-sm"
                : "border-white/10"
          }`}
        >
          {icon && (
            <span
              className={`shrink-0 transition-colors duration-300 ${
                isFocused ? "text-indigo-300" : "text-white/35"
              }`}
            >
              {icon}
            </span>
          )}
          <input
            ref={ref}
            type={resolvedType}
            placeholder={placeholder}
            className={`w-full bg-transparent py-3.5 text-sm font-medium text-white placeholder:text-white/25 focus:outline-none ${className ?? ""}`}
            {...rest}
            onFocus={(event) => {
              setIsFocused(true);
              rest.onFocus?.(event);
            }}
            onBlur={(event) => {
              setIsFocused(false);
              rest.onBlur?.(event);
            }}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setIsRevealed((previous) => !previous)}
              aria-label={isRevealed ? "Ocultar senha" : "Mostrar senha"}
              className="shrink-0 text-white/35 transition-colors duration-200 hover:text-white/70"
            >
              {isRevealed ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
            </button>
          )}
        </div>
        {error && (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-300">
            <span className="h-1 w-1 rounded-full bg-red-400" />
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
