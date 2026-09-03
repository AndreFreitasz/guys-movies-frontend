import React, { useEffect, useRef } from "react";
import { animate, motion, useInView } from "framer-motion";

interface StatCardProps {
  label: string;
  value: number | null;
  hint: string;
  suffix?: string;
  decimals?: number;
  formatValue?: (value: number) => string;
  accent: "indigo" | "amber" | "emerald";
  delay?: number;
}

const accentStyles = {
  indigo: "from-indigo-500/20 to-indigo-500/0 text-indigo-200",
  amber: "from-amber-500/20 to-amber-500/0 text-amber-200",
  emerald: "from-emerald-500/20 to-emerald-500/0 text-emerald-200",
};

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  hint,
  suffix = "",
  decimals = 0,
  formatValue,
  accent,
  delay = 0,
}) => {
  const valueRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animatedRef = useRef(false);
  const isInView = useInView(containerRef, { once: true, amount: 0.3 });
  const format = formatValue ?? ((raw: number) => raw.toFixed(decimals));

  useEffect(() => {
    const node = valueRef.current;
    if (!node || value === null) return;

    if (!isInView) {
      node.textContent = format(0);
      return;
    }

    if (animatedRef.current) {
      node.textContent = format(value);
      return;
    }

    animatedRef.current = true;

    const controls = animate(0, value, {
      duration: 1.1,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        node.textContent = format(latest);
      },
      onComplete: () => {
        node.textContent = format(value);
      },
    });

    return () => controls.stop();
  }, [decimals, delay, format, isInView, value]);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl"
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accentStyles[accent]}`}
      />
      <div className="relative">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white/45">
          {label}
        </p>
        <p className="mt-2 text-4xl font-bold tabular-nums text-white">
          {value === null ? (
            <span className="text-white/30">—</span>
          ) : (
            <>
              <span ref={valueRef} />
              {suffix}
            </>
          )}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-white/45">{hint}</p>
      </div>
    </motion.div>
  );
};

export default StatCard;
