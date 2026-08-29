import React, { forwardRef } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";
export type ButtonShape = "pill" | "rounded";

interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  label: string;
  icon?: React.ReactNode;
  iconPosition?: "leading" | "trailing";
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  fullWidth?: boolean;
  isLoading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-white text-[#05050c] hover:bg-white/90 hover:shadow-[0_10px_30px_-12px_rgba(255,255,255,0.5)]",
  secondary:
    "border border-white/12 bg-white/[0.06] text-white hover:border-white/25 hover:bg-white/[0.11]",
  ghost: "text-white/55 hover:bg-white/[0.06] hover:text-white",
  danger: "bg-red-500 text-white hover:bg-red-400",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-xs",
  md: "h-11 px-6 text-sm",
  lg: "h-12 px-7 text-sm",
};

const shapeClasses: Record<ButtonShape, string> = {
  pill: "rounded-full",
  rounded: "rounded-2xl",
};

const baseClasses =
  "group relative inline-flex select-none items-center justify-center gap-2 font-bold tracking-tight transition-all duration-300 ease-ios hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.96] disabled:pointer-events-none disabled:opacity-50";

export const buttonClasses = ({
  variant = "primary",
  size = "md",
  shape = "pill",
  fullWidth = false,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  fullWidth?: boolean;
} = {}) =>
  `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${shapeClasses[shape]} ${fullWidth ? "w-full" : ""}`;

const Spinner = ({ variant }: { variant: ButtonVariant }) => (
  <span
    className={`h-4 w-4 animate-spin rounded-full border-2 ${
      variant === "primary"
        ? "border-black/20 border-t-black/70"
        : "border-white/25 border-t-white"
    }`}
  />
);

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      label,
      icon,
      iconPosition = "leading",
      variant = "primary",
      size = "md",
      shape = "pill",
      fullWidth = false,
      isLoading = false,
      className,
      disabled,
      type = "button",
      ...rest
    },
    ref,
  ) => {
    const iconMotion =
      iconPosition === "trailing"
        ? "transition-transform duration-300 ease-ios group-hover:translate-x-0.5"
        : "transition-transform duration-300 ease-ios group-hover:-translate-x-0.5";

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`${buttonClasses({ variant, size, shape, fullWidth })} ${className ?? ""}`}
        {...rest}
      >
        {isLoading ? (
          <Spinner variant={variant} />
        ) : (
          <>
            {icon && iconPosition === "leading" && (
              <span className={`flex items-center ${iconMotion}`}>{icon}</span>
            )}
            <span>{label}</span>
            {icon && iconPosition === "trailing" && (
              <span className={`flex items-center ${iconMotion}`}>{icon}</span>
            )}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
