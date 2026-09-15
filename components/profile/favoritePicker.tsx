import React, { useEffect, useMemo, useState } from "react";
import Modal from "../_ui/modal";
import { authFetch } from "../../utils/authFetch";
import { FavoriteType, resolvePosterUrl } from "../../interfaces/profile/types";
import { WatchedMovieList } from "../../interfaces/watched/types";
import { WatchedSerieList } from "../../interfaces/watched/serieTypes";

interface PickerOption {
  type: FavoriteType;
  idTmdb: number;
  title: string;
  posterPath: string | null;
}

interface FavoritePickerProps {
  isOpen: boolean;
  type: FavoriteType;
  onClose: () => void;
  onSelect: (option: PickerOption) => void;
  excludedKeys: string[];
}

const FavoritePicker: React.FC<FavoritePickerProps> = ({
  isOpen,
  type,
  onClose,
  onSelect,
  excludedKeys,
}) => {
  const [options, setOptions] = useState<PickerOption[]>([]);
  const [term, setTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setIsLoading(true);
    setHasFailed(false);
    setTerm("");

    Promise.all([
      authFetch(`${process.env.NEXT_PUBLIC_URL_API}/watchedMovie/list`),
      authFetch(`${process.env.NEXT_PUBLIC_URL_API}/watchedSerie/list`),
    ])
      .then(async ([movieResponse, serieResponse]) => {
        if (!movieResponse.ok || !serieResponse.ok) {
          throw new Error("Falha ao carregar a biblioteca");
        }

        const movieData = (await movieResponse.json()) as WatchedMovieList;
        const serieData = (await serieResponse.json()) as WatchedSerieList;

        if (cancelled) return;

        setOptions([
          ...movieData.items.map((item) => ({
            type: "movie" as const,
            idTmdb: item.idTmdb,
            title: item.title ?? "Sem título",
            posterPath: item.posterPath,
          })),
          ...serieData.items.map((item) => ({
            type: "serie" as const,
            idTmdb: item.idTmdb,
            title: item.name ?? "Sem título",
            posterPath: item.posterPath,
          })),
        ]);
      })
      .catch(() => {
        if (!cancelled) setHasFailed(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const visible = useMemo(() => {
    const excluded = new Set(excludedKeys);
    const normalized = term.trim().toLowerCase();

    return options
      .filter((option) => option.type === type)
      .filter((option) => !excluded.has(`${option.type}:${option.idTmdb}`))
      .filter((option) =>
        normalized ? option.title.toLowerCase().includes(normalized) : true,
      );
  }, [excludedKeys, options, term, type]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={type === "movie" ? "Escolher filme" : "Escolher série"}
    >
      <input
        type="search"
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        placeholder={
          type === "movie" ? "Buscar um filme..." : "Buscar uma série..."
        }
        aria-label="Buscar na sua biblioteca"
        className="mb-4 w-full rounded-full border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-medium text-white placeholder:text-white/35 focus:border-indigo-400/60 focus:outline-none"
      />

      <div className="max-h-[55vh] overflow-y-auto">
        {hasFailed && (
          <p className="py-8 text-center text-sm text-white/60">
            Não foi possível carregar sua biblioteca.
          </p>
        )}

        {isLoading && (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="skeleton aspect-[2/3] w-full rounded-xl"
              />
            ))}
          </div>
        )}

        {!isLoading && !hasFailed && visible.length === 0 && (
          <p className="py-8 text-center text-sm leading-relaxed text-white/50">
            {options.length === 0
              ? `Você ainda não marcou ${type === "movie" ? "nenhum filme" : "nenhuma série"} como assistido.`
              : "Nada encontrado com esse termo."}
          </p>
        )}

        {!isLoading && !hasFailed && visible.length > 0 && (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {visible.map((option) => (
              <button
                key={`${option.type}:${option.idTmdb}`}
                type="button"
                onClick={() => onSelect(option)}
                className="group text-left"
              >
                <img
                  src={resolvePosterUrl(option.posterPath)}
                  alt={option.title}
                  loading="lazy"
                  className="aspect-[2/3] w-full rounded-xl border border-white/10 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="mt-1.5 block truncate text-[0.7rem] font-semibold text-white/70">
                  {option.title}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default FavoritePicker;
