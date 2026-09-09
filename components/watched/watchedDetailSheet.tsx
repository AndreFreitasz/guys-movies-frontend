import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import { WatchedMovieItem } from "../../interfaces/watched/types";
import { MovieResponse } from "../../interfaces/movie/types";
import {
  WatchProviderOption,
  WatchSourceValue,
} from "../../constants/watchProviders";
import { authFetch } from "../../utils/authFetch";
import { useAuth } from "../../hooks/authContext";
import RatingStars from "./ratingStars";
import { formatWatchedDate } from "./watchedTile";
import WatchedDateForm from "./watchedDateForm";

interface WatchedDetailSheetProps {
  movie: WatchedMovieItem | null;
  onClose: () => void;
  onWatchedAtChange: (
    idTmdb: number,
    watchedAt: string | null,
  ) => Promise<void>;
}

const FALLBACK_POSTER = "/icons/home/cinema.png";

const formatReleaseYear = (value: string | null): string => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : String(date.getFullYear());
};

const DetailRow: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="flex items-baseline justify-between gap-4 border-b border-white/5 py-3 last:border-b-0">
    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
      {label}
    </span>
    <span className="text-right text-sm font-medium text-white/85">
      {value}
    </span>
  </div>
);

interface DetailSheetBodyProps {
  movie: WatchedMovieItem;
  onWatchedAtChange: (
    idTmdb: number,
    watchedAt: string | null,
  ) => Promise<void>;
}

const DetailSheetBody: React.FC<DetailSheetBodyProps> = ({
  movie,
  onWatchedAtChange,
}) => {
  const { user, authLoading } = useAuth();
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [previewStatus, setPreviewStatus] = useState<
    "loading" | "error" | "ready"
  >("loading");
  const [flatrateProviders, setFlatrateProviders] = useState<
    WatchProviderOption[]
  >([]);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setPreviewStatus("loading");

    authFetch(`${process.env.NEXT_PUBLIC_URL_API}/movie/${movie.idTmdb}`)
      .then((response) =>
        response.ok
          ? (response.json() as Promise<MovieResponse>)
          : Promise.reject(new Error("falha")),
      )
      .then((data) => {
        if (cancelled) return;
        setFlatrateProviders(
          (data.providers?.flatrate ?? []).map((provider) => ({
            id: provider.id_provider,
            name: provider.provider_name,
          })),
        );
        setPreviewStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setPreviewStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [movie.idTmdb, reloadToken]);

  const retryPreview = useCallback(
    () => setReloadToken((token) => token + 1),
    [],
  );

  const requireUser = useCallback(() => {
    if (authLoading) return false;
    if (!user) {
      toast.warn("Entre em uma conta para declarar onde você assistiu.");
      return false;
    }
    return true;
  }, [authLoading, user]);

  const saveWatchSource = useCallback(
    async (watchSource: WatchSourceValue | null, providerId: number | null) => {
      if (!requireUser()) return;

      try {
        const response = await authFetch(
          `${process.env.NEXT_PUBLIC_URL_API}/watchedMovie/watchSource/${movie.idTmdb}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(
              watchSource === "streaming"
                ? { watchSource, providerId }
                : { watchSource },
            ),
          },
        );

        if (!response.ok) throw new Error("Requisição rejeitada");

        toast.success("Atualizamos onde você assistiu.");
      } catch {
        toast.error("Erro ao salvar onde você assistiu.");
      }
    },
    [movie.idTmdb, requireUser],
  );

  return (
    <div className="flex-1">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-300">
        Assistido
      </p>
      <h2 className="mt-2 text-2xl font-bold leading-tight text-white sm:text-3xl">
        {movie.title ?? "Título indisponível"}
      </h2>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <RatingStars rating={movie.rating} size="md" />
        {movie.rating !== null && (
          <span className="text-sm font-semibold text-amber-300">
            {movie.rating.toFixed(1)} / 5
          </span>
        )}
      </div>

      {movie.overview && (
        <p className="mt-4 text-sm leading-relaxed text-white/65">
          {movie.overview}
        </p>
      )}

      <div className="mt-5">
        {isEditingDate ? (
          <div className="border-b border-white/5 py-3">
            {previewStatus === "error" && (
              <div className="mb-4 flex items-center justify-between gap-4 rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3">
                <p className="text-sm text-red-200">
                  Não foi possível carregar os streamings deste filme.
                </p>
                <button
                  type="button"
                  onClick={retryPreview}
                  className="rounded-xl bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-100 transition hover:bg-red-500/30"
                >
                  Tentar de novo
                </button>
              </div>
            )}
            <WatchedDateForm
              key={movie.watchedAt ?? "empty"}
              initialDate={movie.watchedAt}
              mode="edit"
              availableProviders={flatrateProviders}
              initialWatchSource={movie.watchSource}
              initialProviderId={movie.providerId}
              onSubmit={async (isoDate, watchSource, providerId) => {
                setIsEditingDate(false);
                await onWatchedAtChange(movie.idTmdb, isoDate);
                if (watchSource !== undefined) {
                  saveWatchSource(watchSource, providerId);
                }
              }}
              onClear={() => {
                setIsEditingDate(false);
                onWatchedAtChange(movie.idTmdb, null);
              }}
            />
          </div>
        ) : (
          <div className="flex items-baseline justify-between gap-4 border-b border-white/5 py-3">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
              Você assistiu em
            </span>
            <div className="flex items-center gap-3">
              <span className="text-right text-sm font-medium text-white/85">
                {formatWatchedDate(movie.watchedAt)}
              </span>
              <button
                type="button"
                onClick={() => setIsEditingDate(true)}
                className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-white/20"
              >
                Editar
              </button>
            </div>
          </div>
        )}
        <DetailRow
          label="Lançamento"
          value={formatReleaseYear(movie.releaseDate)}
        />
        <DetailRow label="Direção" value={movie.director ?? "Não informado"} />
        <DetailRow
          label="Nota TMDB"
          value={
            movie.voteAverage !== null
              ? `${movie.voteAverage.toFixed(1)} / 10`
              : "—"
          }
        />
      </div>

      <Link
        href={`/movie/${movie.idTmdb}`}
        className="group mt-6 inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold tracking-tight bg-white text-[#05050c] transition-all duration-300 ease-ios hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-[0_10px_30px_-12px_rgba(255,255,255,0.5)] active:translate-y-0 active:scale-[0.96]"
      >
        Abrir página do filme
        <svg viewBox="0 0 20 20" className="h-4 w-4">
          <path
            fill="currentColor"
            d="M7.5 4.5l5.5 5.5-5.5 5.5-1-1 4.5-4.5-4.5-4.5z"
          />
        </svg>
      </Link>
    </div>
  );
};

const WatchedDetailSheet: React.FC<WatchedDetailSheetProps> = ({
  movie,
  onClose,
  onWatchedAtChange,
}) => {
  const previousOverflowRef = useRef("");
  const isLockedRef = useRef(false);

  useEffect(() => {
    if (!movie) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    if (!isLockedRef.current) {
      previousOverflowRef.current = document.body.style.overflow;
      isLockedRef.current = true;
    }
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [movie, onClose]);

  useEffect(
    () => () => {
      if (!isLockedRef.current) return;
      document.body.style.overflow = previousOverflowRef.current;
    },
    [],
  );

  const restoreScroll = () => {
    if (!isLockedRef.current) return;
    isLockedRef.current = false;
    document.body.style.overflow = previousOverflowRef.current;
  };

  return (
    <AnimatePresence onExitComplete={restoreScroll}>
      {movie && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 backdrop-blur-md" />

          <motion.div
            className="absolute inset-0 bg-black/70"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={movie.title ?? "Detalhes do filme"}
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.18 } }}
            transition={{ type: "spring", stiffness: 420, damping: 38 }}
            className="relative w-full max-w-3xl"
          >
            <div className="max-h-[92vh] overflow-y-auto rounded-t-[2rem] border border-white/10 bg-[#0a0a16]/95 shadow-lift sm:rounded-[2rem]">
              <div className="sticky top-0 z-10 flex justify-center bg-gradient-to-b from-[#0a0a16] to-transparent pb-4 pt-3 sm:hidden">
                <span className="h-1.5 w-12 rounded-full bg-white/25" />
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar detalhes"
                className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 backdrop-blur transition hover:bg-white/20 hover:text-white"
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4">
                  <path
                    fill="currentColor"
                    d="M5.3 4.3l4.7 4.7 4.7-4.7 1 1-4.7 4.7 4.7 4.7-1 1-4.7-4.7-4.7 4.7-1-1 4.7-4.7-4.7-4.7z"
                  />
                </svg>
              </button>

              <div className="flex flex-col gap-6 p-6 sm:flex-row sm:p-8">
                <img
                  src={movie.posterPath || FALLBACK_POSTER}
                  alt={movie.title ?? "Pôster do filme"}
                  onError={(event) => {
                    const target = event.currentTarget;
                    if (target.src.endsWith(FALLBACK_POSTER)) return;
                    target.src = FALLBACK_POSTER;
                    target.classList.add("object-contain", "p-6", "opacity-40");
                  }}
                  className="mx-auto aspect-[2/3] w-40 self-start rounded-2xl object-cover shadow-xl sm:mx-0 sm:w-52"
                />

                <DetailSheetBody
                  key={movie.idTmdb}
                  movie={movie}
                  onWatchedAtChange={onWatchedAtChange}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WatchedDetailSheet;
