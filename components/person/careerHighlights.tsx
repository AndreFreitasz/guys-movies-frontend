import React from "react";
import Link from "next/link";
import {
  creditHref,
  PersonCredit,
  tmdbPoster,
} from "../../interfaces/person/types";

interface CareerHighlightsProps {
  credits: PersonCredit[];
}

const CareerHighlights: React.FC<CareerHighlightsProps> = ({ credits }) => {
  if (!credits.length) return null;

  return (
    <section className="mt-12 lg:mt-16">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/40">
        Definem a carreira
      </h2>
      <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {credits.map((credit) => (
          <Link
            key={`${credit.mediaType}-${credit.id}`}
            href={creditHref(credit)}
            className="group flex flex-col gap-2 transition-transform duration-300 ease-ios hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-indigo-400"
          >
            <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-white/10 bg-white/5">
              {credit.posterPath ? (
                <img
                  src={tmdbPoster(credit.posterPath, "w342") ?? undefined}
                  alt={credit.title}
                  loading="lazy"
                  decoding="async"
                  width={342}
                  height={513}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center p-2 text-center text-[11px] font-semibold text-white/50">
                  {credit.title}
                </span>
              )}
            </div>
            <span className="line-clamp-2 text-xs font-semibold leading-snug text-white">
              {credit.title}
            </span>
            <span className="text-[11px] tabular-nums text-white/40">
              {credit.year ?? "—"}
              {credit.voteAverage
                ? ` · ★ ${credit.voteAverage.toFixed(1)}`
                : ""}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CareerHighlights;
