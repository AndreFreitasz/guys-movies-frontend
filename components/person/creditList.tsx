import React from "react";
import Link from "next/link";
import {
  creditHref,
  PersonCredit,
  tmdbPoster,
} from "../../interfaces/person/types";

interface CreditListProps {
  items: PersonCredit[];
  status: "ready" | "loading" | "failed";
  hasMore: boolean;
  activeGenreName: string | null;
  onLoadMore: () => void;
  onClearGenre: () => void;
  onRetry: () => void;
}

const CreditList: React.FC<CreditListProps> = ({
  items,
  status,
  hasMore,
  activeGenreName,
  onLoadMore,
  onClearGenre,
  onRetry,
}) => {
  if (status === "failed" && !items.length) {
    return (
      <div className="mt-8 text-center">
        <p className="text-sm text-white/60">
          Não foi possível carregar a filmografia.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 min-h-[44px] rounded-full border border-white/15 px-6 text-sm font-semibold text-white"
        >
          Tentar de novo
        </button>
      </div>
    );
  }

  if (status === "loading" && !items.length) {
    return (
      <div className="mt-5 flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="skeleton h-[72px] w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="mt-8 text-center">
        <p className="text-sm text-white/50">
          {activeGenreName
            ? `Nenhum título de ${activeGenreName} neste departamento.`
            : "Nada por aqui ainda."}
        </p>
        {activeGenreName && (
          <button
            type="button"
            onClick={onClearGenre}
            className="mt-4 min-h-[44px] rounded-full border border-white/15 px-6 text-sm font-semibold text-white"
          >
            Limpar filtro
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="mt-5 flex flex-col gap-2">
      {items.map((credit) => (
        <Link
          key={`${credit.department}-${credit.mediaType}-${credit.id}-${credit.role}`}
          href={creditHref(credit)}
          className="grid grid-cols-[38px_1fr_auto] items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-2.5 transition-colors duration-200 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-indigo-400"
        >
          <div className="h-[54px] w-[38px] overflow-hidden rounded-md border border-white/10 bg-white/5">
            {credit.posterPath && (
              <img
                src={tmdbPoster(credit.posterPath, "w154") ?? undefined}
                alt=""
                loading="lazy"
                decoding="async"
                width={154}
                height={231}
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {credit.title}
            </p>
            <p className="truncate text-xs text-white/40">
              {credit.department === "acting" ? "como " : ""}
              <span className="text-indigo-300">{credit.role}</span>
            </p>
          </div>
          <span className="whitespace-nowrap text-right text-xs tabular-nums text-white/40">
            {credit.year ?? "—"}
            {credit.voteAverage ? ` · ★ ${credit.voteAverage.toFixed(1)}` : ""}
          </span>
        </Link>
      ))}

      {hasMore && (
        <>
          {status === "failed" && (
            <p className="mt-3 text-center text-sm text-white/60">
              Não foi possível carregar mais títulos.
            </p>
          )}
          <button
            type="button"
            onClick={onLoadMore}
            disabled={status === "loading"}
            className="mt-3 min-h-[44px] w-full rounded-2xl border border-white/10 text-sm font-semibold text-white/70 disabled:opacity-60"
          >
            {status === "loading"
              ? "Carregando..."
              : status === "failed"
                ? "Tentar de novo"
                : "Carregar mais"}
          </button>
        </>
      )}
    </div>
  );
};

export default CreditList;
