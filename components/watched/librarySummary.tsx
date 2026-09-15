import React from "react";
import { motion } from "framer-motion";
import { useUserStats } from "../../hooks/useUserStats";

interface LibrarySummaryProps {
  enabled: boolean;
}

const formatRuntime = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours} h`;
  return `${Math.round(hours / 24)} dias`;
};

const LibrarySummary: React.FC<LibrarySummaryProps> = ({ enabled }) => {
  const stats = useUserStats(enabled);

  const entries = [
    { label: "Filmes", value: stats ? String(stats.movies) : "—" },
    { label: "Séries", value: stats ? String(stats.series) : "—" },
    { label: "Episódios", value: stats ? String(stats.episodes) : "—" },
    {
      label: "Tempo em séries",
      value: stats ? formatRuntime(stats.serieRuntimeMinutes) : "—",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="mt-6 mb-6 grid grid-cols-2 gap-3 rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-4"
    >
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
