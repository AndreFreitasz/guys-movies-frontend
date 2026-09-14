import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  TimelineEvent,
  eventKey,
  formatEventDate,
  monthLabel,
  resolvePosterUrl,
} from "../../interfaces/profile/types";

interface TimelineListProps {
  events: TimelineEvent[];
  status: "idle" | "loading" | "ready" | "failed";
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
  emptyMessage: string;
}

const groupByMonth = (events: TimelineEvent[]) => {
  const groups: { label: string; events: TimelineEvent[] }[] = [];

  events.forEach((event) => {
    const label = monthLabel(event.occurredAt);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.events.push(event);
    else groups.push({ label, events: [event] });
  });

  return groups;
};

const RatingStars: React.FC<{ rating: number }> = ({ rating }) => (
  <span className="shrink-0 text-xs font-bold tabular-nums text-amber-200">
    ★ {rating.toFixed(1)}
  </span>
);

const TimelineList: React.FC<TimelineListProps> = ({
  events,
  status,
  isLoadingMore,
  hasMore,
  onLoadMore,
  onRetry,
  emptyMessage,
}) => {
  if (status === "loading" || status === "idle") {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="skeleton h-20 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.02] py-10 text-center">
        <p className="text-sm text-white/60">
          Não foi possível carregar o histórico.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 min-h-[44px] rounded-full border border-white/15 px-5 text-sm font-semibold text-white"
        >
          Tentar de novo
        </button>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <p className="rounded-3xl border border-white/10 bg-white/[0.02] py-10 text-center text-sm leading-relaxed text-white/50">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {groupByMonth(events).map((group) => (
        <section key={group.label}>
          <h3 className="mb-3 text-[0.65rem] font-bold uppercase tracking-[0.22em] text-indigo-300">
            {group.label}
          </h3>
          <ul className="space-y-2">
            {group.events.map((event, index) => (
              <motion.li
                key={eventKey(event)}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.4,
                  delay: Math.min(index, 6) * 0.04,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <Link
                  href={
                    event.kind === "movie"
                      ? `/movie/${event.idTmdb}`
                      : `/serie/${event.idTmdb}`
                  }
                  className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-3 transition-colors duration-300 hover:bg-white/[0.05]"
                >
                  <img
                    src={resolvePosterUrl(event.posterPath)}
                    alt={event.title}
                    loading="lazy"
                    className="h-[4.5rem] w-12 shrink-0 rounded-lg object-cover"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm leading-snug text-white/70">
                      {event.kind === "movie" ? (
                        <>
                          Assistiu{" "}
                          <span className="font-bold text-white">
                            {event.title}
                          </span>
                        </>
                      ) : (
                        <>
                          Terminou a{" "}
                          <span className="font-bold text-white">
                            {event.seasonNumber}ª temporada
                          </span>{" "}
                          de{" "}
                          <span className="font-bold text-white">
                            {event.title}
                          </span>
                        </>
                      )}
                    </span>
                    <span className="mt-1 block text-xs text-white/40">
                      {event.kind === "season" &&
                        `${event.episodeCount} episódios · `}
                      {formatEventDate(event.occurredAt)}
                    </span>
                  </span>
                  {event.kind === "movie" && event.rating !== null && (
                    <RatingStars rating={event.rating} />
                  )}
                </Link>
              </motion.li>
            ))}
          </ul>
        </section>
      ))}

      {hasMore && (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={isLoadingMore}
          className="min-h-[48px] w-full rounded-2xl border border-white/10 bg-white/[0.03] text-sm font-bold text-white/75 transition-colors duration-300 hover:bg-white/[0.06] disabled:opacity-60"
        >
          {isLoadingMore ? "Carregando..." : "Carregar mais"}
        </button>
      )}
    </div>
  );
};

export default TimelineList;
