import React from "react";
import { motion } from "framer-motion";
import { useUserStats } from "../../hooks/useUserStats";

export interface LibrarySummaryValues {
  movies: number | null;
  series: number | null;
  episodes: number | null;
  serieRuntimeMinutes: number | null;
}

interface LibrarySummaryProps {
  enabled: boolean;
  filtered?: LibrarySummaryValues | null;
}

const formatRuntime = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours} h`;
  return `${Math.round(hours / 24)} dias`;
};

const show = (
  value: number | null | undefined,
  format: (raw: number) => string = String,
): string => (value == null ? "—" : format(value));

const LibrarySummary: React.FC<LibrarySummaryProps> = ({
  enabled,
  filtered,
}) => {
  const stats = useUserStats(enabled);
  const values = filtered ?? stats;

  const entries = [
    { label: "Filmes", value: show(values?.movies) },
    { label: "Séries", value: show(values?.series) },
    { label: "Episódios", value: show(values?.episodes) },
    {
      label: "Tempo em séries",
      value: show(values?.serieRuntimeMinutes, formatRuntime),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="relative mt-6 mb-6 grid grid-cols-2 gap-3 rounded-3xl border border-white/10 bg-white/3 p-4 sm:grid-cols-4"
    >
      {filtered && (
        <span className="absolute right-4 top-3 rounded-full bg-indigo-500/20 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-indigo-200">
          Filtrado
        </span>
      )}
      {entries.map((entry) => (
        <div key={entry.label}>
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-white/45">
            {entry.label}
          </p>
          <p className="mt-1 text-2xl font-black tabular-nums text-white">
            {entry.value}
          </p>
        </div>
      ))}
    </motion.div>
  );
};

export default LibrarySummary;
