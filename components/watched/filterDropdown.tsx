import React, { useEffect, useRef, useState } from "react";

interface FilterDropdownProps {
  label: string;
  badge?: number;
  isActive?: boolean;
  align?: "left" | "right";
  panelClassName?: string;
  children: (close: () => void) => React.ReactNode;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  badge,
  isActive,
  align = "left",
  panelClassName,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = () => setIsOpen(false);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    const frame = window.requestAnimationFrame(() => {
      panelRef.current?.scrollIntoView({ block: "nearest" });
    });

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const hasSelection = isActive ?? Boolean(badge && badge > 0);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        className={`flex min-h-[44px] items-center gap-1.5 rounded-full border px-4 text-sm transition ${
          hasSelection
            ? "border-indigo-400/60 bg-indigo-500/20 text-indigo-100"
            : "border-white/10 bg-white/[0.03] text-white/60 hover:text-white"
        }`}
      >
        {label}
        {Boolean(badge) && (
          <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-indigo-500/30 px-1.5 text-xs font-bold text-indigo-100">
            {badge}
          </span>
        )}
        <svg
          viewBox="0 0 20 20"
          className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <path fill="currentColor" d="M5.5 7.5l4.5 4.5 4.5-4.5z" />
        </svg>
      </button>

      {isOpen && (
        <div
          ref={panelRef}
          className={`absolute top-[calc(100%+0.5rem)] z-30 min-w-[16rem] rounded-2xl border border-white/10 bg-[#0e0e1c] p-3 shadow-lift ${
            align === "right" ? "right-0" : "left-0"
          } ${panelClassName ?? ""}`}
        >
          {children(close)}
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;
