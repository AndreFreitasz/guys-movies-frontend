import React from "react";

interface RatingStarsProps {
  rating: number | null;
  size?: "sm" | "md";
}

const TOTAL_STARS = 5;
const STAR_PATH =
  "M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z";

const StarRow: React.FC<{ dimension: string; tone: string }> = ({
  dimension,
  tone,
}) => (
  <span className={`flex w-max gap-0.5 ${tone}`}>
    {Array.from({ length: TOTAL_STARS }).map((_, index) => (
      <svg key={index} viewBox="0 0 20 20" className={`${dimension} shrink-0`}>
        <path fill="currentColor" d={STAR_PATH} />
      </svg>
    ))}
  </span>
);

const RatingStars: React.FC<RatingStarsProps> = ({ rating, size = "sm" }) => {
  const dimension = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";

  if (rating === null) {
    return (
      <span className="text-[0.7rem] font-medium uppercase tracking-wider text-white/30">
        Sem nota
      </span>
    );
  }

  const clamped = Math.min(Math.max(rating, 0), TOTAL_STARS);
  const percentage = (clamped / TOTAL_STARS) * 100;

  return (
    <span
      className="relative inline-block w-max leading-none"
      role="img"
      aria-label={`Nota ${clamped} de ${TOTAL_STARS}`}
    >
      <StarRow dimension={dimension} tone="text-white/15" />
      <span
        className="absolute left-0 top-0 overflow-hidden"
        style={{ width: `${percentage}%` }}
      >
        <StarRow dimension={dimension} tone="text-amber-400" />
      </span>
    </span>
  );
};

export default React.memo(RatingStars);
