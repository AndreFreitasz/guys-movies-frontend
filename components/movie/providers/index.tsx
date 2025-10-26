import React from "react";
import { Providers } from "../../../interfaces/movie/types";

const labelStyles = {
  flatrate: "from-emerald-400/70 to-emerald-500/70 text-emerald-50",
  buy: "from-sky-400/70 to-sky-500/70 text-sky-50",
  rent: "from-amber-400/70 to-amber-500/70 text-amber-50",
};

const readableLabel = {
  flatrate: "Streaming",
  buy: "Comprar",
  rent: "Alugar",
};

const ProvidersMovie: React.FC<Providers> = ({ flatrate, buy, rent }) => {
  const sections = [
    { key: "flatrate" as const, providers: flatrate },
    { key: "buy" as const, providers: buy },
    { key: "rent" as const, providers: rent },
  ].filter((section) => section.providers && section.providers.length > 0);

  if (sections.length === 0) {
    return (
      <p className="rounded-2xl border border-white/10 bg-black/40 px-4 py-6 text-sm text-white/60 backdrop-blur">
        Ainda não temos informações sobre onde este título está disponível.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {sections.map(({ key, providers }) => (
        <div
          key={key}
          className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <span
              className={`inline-flex items-center rounded-full bg-gradient-to-r px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] ${labelStyles[key]}`}
            >
              {readableLabel[key]}
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            {providers!.map((provider) => (
              <div
                key={
                  provider.provider_id
                    ? `${key}-${provider.provider_id}`
                    : `${key}-${provider.provider_name}`
                }
                className="group relative"
                title={provider.provider_name}
              >
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-lg transition-transform duration-300 group-hover:scale-105">
                  <img
                    src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                    alt={provider.provider_name}
                    className="h-12 w-12 object-contain"
                    loading="lazy"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProvidersMovie;
