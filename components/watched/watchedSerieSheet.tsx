import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import { authFetch } from "../../utils/authFetch";
import { useWatchedSeasons } from "../../hooks/useWatchedSeasons";
import SeasonChecklist, { SeasonOption } from "../series/seasonChecklist";
import { WatchedSerieItem } from "../../interfaces/watched/serieTypes";
import { SerieSeason } from "../../interfaces/series/types";
import RatingStars from "./ratingStars";
import WatchedDateForm from "./watchedDateForm";

interface WatchedSerieSheetProps {
  serie: WatchedSerieItem | null;
  onClose: () => void;
  onProgressChange: (
    idTmdb: number,
    watchedSeasons: number,
    completedAt: string | null,
  ) => void;
}

const FALLBACK_POSTER = "/icons/home/cinema.png";

const formatCompletedAt = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

interface SerieSheetBodyProps {
  serie: WatchedSerieItem;
  onProgressChange: (
    idTmdb: number,
    watchedSeasons: number,
    completedAt: string | null,
  ) => void;
}

const SerieSheetBody: React.FC<SerieSheetBodyProps> = ({
  serie,
  onProgressChange,
}) => {
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [isUpdatingDate, setIsUpdatingDate] = useState(false);
  const [seasonOptions, setSeasonOptions] = useState<SeasonOption[]>([]);
  const [seasonsStatus, setSeasonsStatus] = useState<
    "loading" | "error" | "ready"
  >("loading");
  const [reloadSeasonsToken, setReloadSeasonsToken] = useState(0);
  const isFirstProgressRef = useRef(true);

  const buildPayload = useCallback(
    () => ({
      name: serie.name,
      overview: serie.overview,
      firstAirDate: serie.firstAirDate,
      idTmdb: serie.idTmdb,
      posterPath: serie.posterPath,
      voteAverage: serie.voteAverage,
    }),
    [serie],
  );

  const {
    watchedSeasons,
    completedAt,
    isBusy,
    toggleSeason,
    completeAll,
    reload,
  } = useWatchedSeasons({ idTmdb: serie.idTmdb, buildPayload });

  useEffect(() => {
    let cancelled = false;
    setSeasonsStatus("loading");

    authFetch(`${process.env.NEXT_PUBLIC_URL_API}/serie/${serie.idTmdb}`)
      .then((response) =>
        response.ok ? response.json() : Promise.reject(new Error("falha")),
      )
      .then((data) => {
        if (cancelled) return;
        setSeasonOptions(
          (data.seasons ?? []).map((season: SerieSeason) => ({
            seasonNumber: season.season_number,
            name: season.name,
            episodeCount: season.episode_count,
            airDate: season.air_date,
            posterPath: season.poster_path,
          })),
        );
        setSeasonsStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setSeasonsStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [serie.idTmdb, reloadSeasonsToken]);

  const retrySeasons = useCallback(
    () => setReloadSeasonsToken((token) => token + 1),
    [],
  );

  useEffect(() => {
    if (isFirstProgressRef.current) {
      isFirstProgressRef.current = false;
      return;
    }
    onProgressChange(serie.idTmdb, watchedSeasons.length, completedAt);
  }, [watchedSeasons, completedAt, serie.idTmdb, onProgressChange]);

  const handleCompletedAtSubmit = useCallback(
    async (isoDate: string) => {
      setIsEditingDate(false);
      setIsUpdatingDate(true);

      try {
        const response = await authFetch(
          `${process.env.NEXT_PUBLIC_URL_API}/watchedSerie/complete`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              idTmdb: serie.idTmdb,
              completedAt: isoDate,
              createSerieDto: buildPayload(),
            }),
          },
        );

        if (!response.ok) throw new Error("falha");

        await reload();
        toast.success("Data atualizada!");
      } catch {
        toast.error("Erro ao atualizar a data.");
      } finally {
        setIsUpdatingDate(false);
      }
    },
    [buildPayload, reload, serie.idTmdb],
  );

  return (
    <div className="flex-1">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-300">
        Assistido
      </p>
      <h2 className="mt-2 text-2xl font-bold leading-tight text-white sm:text-3xl">
        {serie.name ?? "Título indisponível"}
      </h2>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <RatingStars rating={serie.rating} size="md" />
        {serie.rating !== null && (
          <span className="text-sm font-semibold text-amber-300">
            {serie.rating.toFixed(1)} / 5
          </span>
        )}
      </div>

      {serie.overview && (
        <p className="mt-4 text-sm leading-relaxed text-white/65">
          {serie.overview}
        </p>
      )}

      <div className="mt-5">
        {isEditingDate ? (
          <div className="border-b border-white/5 py-3">
            <WatchedDateForm
              key={completedAt ?? "empty"}
              initialDate={completedAt}
              mode="edit"
              loading={isUpdatingDate}
              onSubmit={handleCompletedAtSubmit}
            />
          </div>
        ) : (
          <div className="flex items-baseline justify-between gap-4 border-b border-white/5 py-3">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
              Concluída em
            </span>
            <div className="flex items-center gap-3">
              <span className="text-right text-sm font-medium text-white/85">
                {completedAt ? formatCompletedAt(completedAt) : "Em andamento"}
              </span>
              {completedAt && (
                <button
                  type="button"
                  onClick={() => setIsEditingDate(true)}
                  className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-white/20"
                >
                  Editar
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6">
        {seasonsStatus === "loading" && (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/60">
            Carregando temporadas...
          </div>
        )}

        {seasonsStatus === "error" && (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm text-white/60">
              Não foi possível carregar as temporadas.
            </p>
            <button
              type="button"
              onClick={retrySeasons}
              className="mt-3 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/20"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {seasonsStatus === "ready" && (
          <SeasonChecklist
            seasons={seasonOptions}
            watchedSeasons={watchedSeasons}
            isBusy={isBusy || isUpdatingDate}
            completedAt={completedAt}
            onToggle={toggleSeason}
            onCompleteAll={() =>
              completeAll(
                seasonOptions.map((season) => ({
                  seasonNumber: season.seasonNumber,
                  episodeCount: season.episodeCount,
                })),
              )
            }
          />
        )}
      </div>

      <Link
        href={`/serie/${serie.idTmdb}`}
        className="group mt-6 inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold tracking-tight bg-white text-[#05050c] transition-all duration-300 ease-ios hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-[0_10px_30px_-12px_rgba(255,255,255,0.5)] active:translate-y-0 active:scale-[0.96]"
      >
        Abrir página da série
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

const WatchedSerieSheet: React.FC<WatchedSerieSheetProps> = ({
  serie,
  onClose,
  onProgressChange,
}) => {
  const previousOverflowRef = useRef("");
  const isLockedRef = useRef(false);

  useEffect(() => {
    if (!serie) return;

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
  }, [serie, onClose]);

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
      {serie && (
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
            aria-label={serie.name ?? "Detalhes da série"}
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
                  src={serie.posterPath || FALLBACK_POSTER}
                  alt={serie.name ?? "Pôster da série"}
                  onError={(event) => {
                    const target = event.currentTarget;
                    if (target.src.endsWith(FALLBACK_POSTER)) return;
                    target.src = FALLBACK_POSTER;
                    target.classList.add("object-contain", "p-6", "opacity-40");
                  }}
                  className="mx-auto aspect-[2/3] w-40 self-start rounded-2xl object-cover shadow-xl sm:mx-0 sm:w-52"
                />

                <SerieSheetBody
                  key={serie.idTmdb}
                  serie={serie}
                  onProgressChange={onProgressChange}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WatchedSerieSheet;
