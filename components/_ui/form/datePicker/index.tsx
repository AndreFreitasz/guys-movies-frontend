import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaChevronLeft, FaChevronRight, FaRegCalendar } from "react-icons/fa";

interface DatePickerProps {
  id?: string;
  label: string;
  value: string;
  max?: string;
  onChange: (value: string) => void;
  helper?: string;
}

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

const MONTHS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

const toIsoDay = (year: number, month: number, day: number): string =>
  `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const parseIsoDay = (value: string): Date | null => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatLong = (value: string): string => {
  const parsed = parseIsoDay(value);
  if (!parsed) return "";
  return `${parsed.getDate()} de ${MONTHS[parsed.getMonth()]} de ${parsed.getFullYear()}`;
};

const DatePicker: React.FC<DatePickerProps> = ({
  id,
  label,
  value,
  max,
  onChange,
  helper,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const selected = parseIsoDay(value);
  const today = useMemo(() => new Date(), []);
  const maxDate = max ? parseIsoDay(max) : null;

  const [cursor, setCursor] = useState(() => {
    const base = selected ?? today;
    return { year: base.getFullYear(), month: base.getMonth() };
  });

  useEffect(() => {
    if (!isOpen) return;

    const onClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", onClickOutside);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  const days = useMemo(() => {
    const first = new Date(cursor.year, cursor.month, 1);
    const total = new Date(cursor.year, cursor.month + 1, 0).getDate();
    const blanks = first.getDay();

    return [
      ...Array.from({ length: blanks }, () => null),
      ...Array.from({ length: total }, (_, index) => index + 1),
    ];
  }, [cursor]);

  const isAfterMax = (day: number): boolean => {
    if (!maxDate) return false;
    return new Date(cursor.year, cursor.month, day) > maxDate;
  };

  const step = (direction: -1 | 1) =>
    setCursor((current) => {
      const next = new Date(current.year, current.month + direction, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });

  return (
    <div ref={containerRef} className="relative">
      <label
        htmlFor={id}
        className="block text-[0.65rem] font-bold uppercase tracking-[0.2em] text-brand-300"
      >
        {label}
      </label>

      <div className="mt-2 flex gap-2">
        <button
          id={id}
          type="button"
          onClick={() => setIsOpen((previous) => !previous)}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          className={`flex min-h-[44px] flex-1 items-center gap-3 rounded-2xl border bg-white/[0.04] px-4 text-left text-sm transition-colors duration-300 focus:outline-none ${
            isOpen
              ? "border-brand-400/60"
              : "border-white/10 hover:border-white/20"
          }`}
        >
          <FaRegCalendar
            size={13}
            className={value ? "text-brand-300" : "text-white/35"}
          />
          <span className={value ? "text-white" : "text-white/35"}>
            {value ? formatLong(value) : "Escolher data (opcional)"}
          </span>
        </button>

        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="min-h-[44px] shrink-0 rounded-2xl border border-white/10 px-4 text-xs font-semibold text-white/50 transition-colors duration-300 hover:text-white/80"
          >
            Limpar
          </button>
        )}
      </div>

      {helper && <p className="mt-1.5 text-xs text-white/35">{helper}</p>}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-label="Escolher data"
            className="absolute left-0 right-0 z-30 mt-2 rounded-3xl border border-white/12 bg-ink-800/95 p-4 shadow-lift backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Mês anterior"
                className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition-colors duration-200 hover:bg-white/10 hover:text-white"
              >
                <FaChevronLeft size={12} />
              </button>

              <span className="text-sm font-bold capitalize text-white">
                {MONTHS[cursor.month]} {cursor.year}
              </span>

              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Próximo mês"
                className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition-colors duration-200 hover:bg-white/10 hover:text-white"
              >
                <FaChevronRight size={12} />
              </button>
            </div>

            <div className="mt-3 grid grid-cols-7 gap-1">
              {WEEKDAYS.map((weekday, index) => (
                <span
                  key={`${weekday}-${index}`}
                  className="flex h-8 items-center justify-center text-[0.65rem] font-bold uppercase text-white/30"
                >
                  {weekday}
                </span>
              ))}

              {days.map((day, index) => {
                if (day === null) return <span key={`blank-${index}`} />;

                const iso = toIsoDay(cursor.year, cursor.month, day);
                const isSelected = iso === value;
                const isToday =
                  iso ===
                  toIsoDay(
                    today.getFullYear(),
                    today.getMonth(),
                    today.getDate(),
                  );
                const disabled = isAfterMax(day);

                return (
                  <button
                    key={iso}
                    type="button"
                    disabled={disabled}
                    aria-pressed={isSelected}
                    onClick={() => {
                      onChange(iso);
                      setIsOpen(false);
                    }}
                    className={`flex h-9 items-center justify-center rounded-xl text-sm font-semibold tabular-nums transition-colors duration-200 disabled:cursor-not-allowed disabled:text-white/15 ${
                      isSelected
                        ? "bg-gradient-to-r from-violet-500 to-indigo-600 text-white"
                        : isToday
                          ? "text-brand-200 ring-1 ring-brand-400/40 hover:bg-white/10"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-white/[0.07] pt-3">
              <button
                type="button"
                onClick={() => {
                  onChange(
                    toIsoDay(
                      today.getFullYear(),
                      today.getMonth(),
                      today.getDate(),
                    ),
                  );
                  setIsOpen(false);
                }}
                className="text-xs font-bold text-brand-200 transition-colors duration-200 hover:text-brand-100"
              >
                Hoje
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-xs font-semibold text-white/45 transition-colors duration-200 hover:text-white/70"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DatePicker;
