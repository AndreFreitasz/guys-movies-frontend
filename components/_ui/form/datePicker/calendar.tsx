import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { DayPicker, type MonthCaptionProps } from "react-day-picker";
import { ptBR } from "react-day-picker/locale";
import { format } from "date-fns";
import { FaChevronDown } from "react-icons/fa";
import { GridCell, PanelShell } from "./panel";
import {
  YEARS_PER_PAGE,
  capitalizeFirst,
  clampToBounds,
  toMonthIndex,
  toYearPageStart,
} from "./utils";

type CalendarView = "days" | "months" | "years";

interface CalendarProps {
  selected?: Date;
  minDate: Date;
  maxDate: Date;
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onSelect: (date: Date) => void;
}

const transition = { duration: 0.18, ease: [0.16, 1, 0.3, 1] as const };

const monthLabels = Array.from({ length: 12 }, (_, index) =>
  capitalizeFirst(format(new Date(2000, index, 1), "LLL", { locale: ptBR })),
);

const Calendar: React.FC<CalendarProps> = ({
  selected,
  minDate,
  maxDate,
  view,
  onViewChange,
  onSelect,
}) => {
  const minIndex = toMonthIndex(minDate);
  const maxIndex = toMonthIndex(maxDate);
  const minYear = minDate.getFullYear();
  const maxYear = maxDate.getFullYear();

  const [month, setMonth] = useState(() =>
    clampToBounds(selected ?? maxDate, minIndex, maxIndex),
  );
  const [yearPage, setYearPage] = useState(() =>
    toYearPageStart(month.getFullYear(), minYear),
  );

  const daysRef = useRef<HTMLDivElement>(null);
  const [daysSize, setDaysSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    if (view !== "days") return;
    const node = daysRef.current;
    if (!node) return;

    const { offsetWidth, offsetHeight } = node;
    if (!offsetWidth || !offsetHeight) return;

    setDaysSize((previous) =>
      previous?.width === offsetWidth && previous?.height === offsetHeight
        ? previous
        : { width: offsetWidth, height: offsetHeight },
    );
  }, [view, month]);

  const components = useMemo(
    () => ({
      MonthCaption: ({
        calendarMonth,
        displayIndex,
        ...rest
      }: MonthCaptionProps) => (
        <div {...rest}>
          <button
            type="button"
            onClick={() => onViewChange("months")}
            aria-label="Escolher mês e ano"
            className="flex items-center gap-2 rounded-xl px-2 py-1 text-sm font-extrabold text-white transition-colors duration-200 hover:bg-white/10"
          >
            {capitalizeFirst(
              format(calendarMonth.date, "LLLL 'de' yyyy", { locale: ptBR }),
            )}
            <FaChevronDown size={9} className="text-white/45" />
          </button>
        </div>
      ),
    }),
    [onViewChange],
  );

  const goToYears = () => {
    setYearPage(toYearPageStart(month.getFullYear(), minYear));
    onViewChange("years");
  };

  const shiftYear = (offset: number) => {
    setMonth(
      clampToBounds(
        new Date(month.getFullYear() + offset, month.getMonth(), 1),
        minIndex,
        maxIndex,
      ),
    );
  };

  const selectMonth = (index: number) => {
    setMonth(new Date(month.getFullYear(), index, 1));
    onViewChange("days");
  };

  const selectYear = (year: number) => {
    setMonth(
      clampToBounds(new Date(year, month.getMonth(), 1), minIndex, maxIndex),
    );
    onViewChange("months");
  };

  const frameStyle = daysSize ? { width: daysSize.width } : undefined;
  const panelStyle = daysSize ? { minHeight: daysSize.height } : undefined;

  return (
    <div style={frameStyle}>
      {view === "days" && (
        <motion.div
          key="days"
          ref={daysRef}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={transition}
        >
          <DayPicker
            mode="single"
            locale={ptBR}
            captionLayout="label"
            month={month}
            onMonthChange={setMonth}
            startMonth={minDate}
            endMonth={maxDate}
            disabled={{ after: maxDate }}
            selected={selected}
            onSelect={(day) => {
              if (day) onSelect(day);
            }}
            components={components}
          />
        </motion.div>
      )}

      {view === "months" && (
        <motion.div
          key="months"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={transition}
          className="flex flex-col"
          style={panelStyle}
        >
          <PanelShell
            label={String(month.getFullYear())}
            labelAction={goToYears}
            labelHint="Escolher ano"
            onPrevious={() => shiftYear(-1)}
            onNext={() => shiftYear(1)}
            previousDisabled={(month.getFullYear() - 1) * 12 + 11 < minIndex}
            nextDisabled={(month.getFullYear() + 1) * 12 > maxIndex}
            previousLabel="Ano anterior"
            nextLabel="Próximo ano"
          >
            {monthLabels.map((label, index) => {
              const cellIndex = month.getFullYear() * 12 + index;
              return (
                <GridCell
                  key={label}
                  label={label}
                  selected={
                    Boolean(selected) &&
                    toMonthIndex(selected as Date) === cellIndex
                  }
                  current={toMonthIndex(new Date()) === cellIndex}
                  disabled={cellIndex < minIndex || cellIndex > maxIndex}
                  onClick={() => selectMonth(index)}
                />
              );
            })}
          </PanelShell>
        </motion.div>
      )}

      {view === "years" && (
        <motion.div
          key="years"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={transition}
          className="flex flex-col"
          style={panelStyle}
        >
          <PanelShell
            label={`${yearPage} – ${yearPage + YEARS_PER_PAGE - 1}`}
            onPrevious={() => setYearPage(yearPage - YEARS_PER_PAGE)}
            onNext={() => setYearPage(yearPage + YEARS_PER_PAGE)}
            previousDisabled={yearPage - YEARS_PER_PAGE < minYear}
            nextDisabled={yearPage + YEARS_PER_PAGE > maxYear}
            previousLabel="Anos anteriores"
            nextLabel="Próximos anos"
          >
            {Array.from(
              { length: YEARS_PER_PAGE },
              (_, offset) => yearPage + offset,
            ).map((year) => (
              <GridCell
                key={year}
                label={String(year)}
                selected={selected?.getFullYear() === year}
                current={new Date().getFullYear() === year}
                disabled={year < minYear || year > maxYear}
                onClick={() => selectYear(year)}
              />
            ))}
          </PanelShell>
        </motion.div>
      )}
    </div>
  );
};

export default Calendar;
export type { CalendarView };
