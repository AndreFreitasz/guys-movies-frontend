import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ptBR } from "react-day-picker/locale";
import { format, parse, isValid } from "date-fns";
import { FaRegCalendar } from "react-icons/fa";
import Calendar, { type CalendarView } from "./calendar";
import "react-day-picker/style.css";

interface DatePickerProps {
  id?: string;
  label: string;
  value: string;
  max?: string;
  min?: string;
  onChange: (value: string) => void;
  helper?: string;
}

const toDate = (value: string): Date | undefined => {
  if (!value) return undefined;
  const parsed = parse(value, "yyyy-MM-dd", new Date());
  return isValid(parsed) ? parsed : undefined;
};

const DatePicker: React.FC<DatePickerProps> = ({
  id,
  label,
  value,
  max,
  min,
  onChange,
  helper,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<CalendarView>("days");

  const selected = toDate(value);
  const maxDate = (max ? toDate(max) : undefined) ?? new Date();
  const minDate = (min ? toDate(min) : undefined) ?? new Date(1900, 0, 1);

  const close = () => {
    setIsOpen(false);
    setView("days");
  };

  useEffect(() => {
    if (!isOpen) return;

    const onClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setView("days");
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      if (view === "years") setView("months");
      else if (view === "months") setView("days");
      else setIsOpen(false);
    };

    document.addEventListener("mousedown", onClickOutside);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, view]);

  const commit = (date: Date) => {
    onChange(format(date, "yyyy-MM-dd"));
    close();
  };

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
          onClick={() => (isOpen ? close() : setIsOpen(true))}
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
            {selected
              ? format(selected, "d 'de' MMMM 'de' yyyy", { locale: ptBR })
              : "Escolher data (opcional)"}
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
            className="gm-calendar absolute left-0 z-30 mt-2 rounded-3xl border border-white/12 bg-ink-800/95 p-4 shadow-lift backdrop-blur-2xl"
          >
            <Calendar
              selected={selected}
              minDate={minDate}
              maxDate={maxDate}
              view={view}
              onViewChange={setView}
              onSelect={commit}
            />

            <div className="mt-1 flex items-center justify-between border-t border-white/[0.07] pt-3">
              <button
                type="button"
                onClick={() => commit(new Date())}
                className="text-xs font-bold text-brand-200 transition-colors duration-200 hover:text-brand-100"
              >
                Hoje
              </button>
              <button
                type="button"
                onClick={close}
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
