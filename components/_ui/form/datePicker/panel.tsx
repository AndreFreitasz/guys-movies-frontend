import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface PanelShellProps {
  label: string;
  labelAction?: () => void;
  labelHint?: string;
  onPrevious: () => void;
  onNext: () => void;
  previousDisabled: boolean;
  nextDisabled: boolean;
  previousLabel: string;
  nextLabel: string;
  children: React.ReactNode;
}

const navClassName =
  "flex h-[2.1rem] w-[2.1rem] items-center justify-center rounded-xl text-white/55 transition-colors duration-200 hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-25";

export const PanelShell: React.FC<PanelShellProps> = ({
  label,
  labelAction,
  labelHint,
  onPrevious,
  onNext,
  previousDisabled,
  nextDisabled,
  previousLabel,
  nextLabel,
  children,
}) => (
  <div className="flex flex-1 flex-col">
    <div className="flex items-center justify-between">
      <button
        type="button"
        onClick={onPrevious}
        disabled={previousDisabled}
        aria-label={previousLabel}
        className={navClassName}
      >
        <FaChevronLeft size={12} />
      </button>

      {labelAction ? (
        <button
          type="button"
          onClick={labelAction}
          aria-label={labelHint}
          className="rounded-xl px-3 py-1 text-sm font-extrabold text-white transition-colors duration-200 hover:bg-white/10"
        >
          {label}
        </button>
      ) : (
        <span className="px-3 py-1 text-sm font-extrabold text-white">
          {label}
        </span>
      )}

      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        aria-label={nextLabel}
        className={navClassName}
      >
        <FaChevronRight size={12} />
      </button>
    </div>

    <div className="mt-3 grid flex-1 auto-rows-[3.25rem] grid-cols-4 content-center gap-2">
      {children}
    </div>
  </div>
);

interface GridCellProps {
  label: string;
  selected: boolean;
  current: boolean;
  disabled: boolean;
  onClick: () => void;
}

export const GridCell: React.FC<GridCellProps> = ({
  label,
  selected,
  current,
  disabled,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-selected={selected}
    className={`flex items-center justify-center rounded-xl text-[0.8rem] font-semibold tabular-nums capitalize transition-colors duration-200 disabled:pointer-events-none disabled:opacity-25 ${
      selected
        ? "bg-gradient-to-r from-[#8b5cf6] to-[#4f46e5] font-extrabold text-white"
        : "text-white/75 hover:bg-white/10 hover:text-white"
    } ${current && !selected ? "shadow-[inset_0_0_0_1px_rgba(124,77,255,0.45)] text-brand-300" : ""}`}
  >
    {label}
  </button>
);
