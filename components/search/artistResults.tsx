import React from "react";
import Link from "next/link";
import { ArtistSearchResult, tmdbProfile } from "../../interfaces/person/types";

interface ArtistResultsProps {
  artists: ArtistSearchResult[];
  status: "idle" | "loading" | "ready" | "failed";
  term: string;
  onRetry: () => void;
}

const ArtistResults: React.FC<ArtistResultsProps> = ({
  artists,
  status,
  term,
  onRetry,
}) => {
  if (status === "failed") {
    return (
      <div className="mt-10 text-center">
        <p className="text-sm text-white/60">
          Não foi possível buscar artistas agora.
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

  if (status === "loading") {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="skeleton h-16 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (status === "idle") {
    return (
      <p className="mt-10 text-center text-sm leading-relaxed text-white/50">
        Busque por um nome para encontrar atores e diretores.
      </p>
    );
  }

  if (artists.length === 0) {
    return (
      <p className="mt-10 text-center text-sm leading-relaxed text-white/50">
        Nenhum artista encontrado para{" "}
        <span className="font-bold text-white">{term}</span>.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-1">
      {artists.map((artist) => {
        const profileUrl = tmdbProfile(artist.profilePath, "w185");

        return (
          <Link
            key={artist.id}
            href={`/pessoa/${artist.id}`}
            className="flex items-center gap-3 rounded-2xl p-3 transition-colors hover:bg-white/5"
          >
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-white/10 bg-black/40">
              {profileUrl ? (
                <img
                  src={profileUrl}
                  alt={artist.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-xs font-semibold uppercase text-white/60">
                  {artist.name.substring(0, 2)}
                </span>
              )}
            </div>
            <div className="min-w-0 space-y-1">
              <p className="truncate text-sm font-semibold leading-snug text-white">
                {artist.name}
              </p>
              {artist.knownForDepartment && (
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                  {artist.knownForDepartment}
                </p>
              )}
              {artist.knownFor.length > 0 && (
                <p className="truncate text-xs text-white/40">
                  {artist.knownFor.join(" · ")}
                </p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default ArtistResults;
