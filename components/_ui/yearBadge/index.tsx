import React from "react";
import { formatYear } from "../../../utils/formatYear";

interface YearBadgeProps {
  date: string | number | null | undefined;
}

const YearBadge: React.FC<YearBadgeProps> = ({ date }) => {
  const year = formatYear(date);
  if (!year) return null;

  return (
    <span className="pointer-events-none absolute left-2 top-2 z-10 rounded-lg border border-white/15 bg-black/55 px-1.5 py-0.5 text-[0.6rem] font-extrabold tracking-wide text-white/90 backdrop-blur-md">
      {year}
    </span>
  );
};

export default YearBadge;
