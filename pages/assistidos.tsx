import React, { useCallback, useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";

import Header from "../components/_ui/header";
import Footer from "../components/_ui/footer";
import StatCard from "../components/watched/statCard";
import WatchedTile from "../components/watched/watchedTile";
import WatchedSerieTile from "../components/watched/watchedSerieTile";
import WatchedToolbar, {
  WatchedSortOption,
} from "../components/watched/watchedToolbar";
import WatchedDetailSheet from "../components/watched/watchedDetailSheet";
import WatchedSerieSheet from "../components/watched/watchedSerieSheet";
import { useAuth } from "../hooks/authContext";
import { authFetch } from "../utils/authFetch";
import {
  WatchedMovieItem,
  WatchedMovieList,
  WatchedSortKey,
} from "../interfaces/watched/types";
import {
  WatchedSerieItem,
  WatchedSerieList,
  WatchedSerieSortKey,
} from "../interfaces/watched/serieTypes";

const SKELETON_COUNT = 10;

type WatchedTab = "movies" | "series";

const MOVIE_SORT_OPTIONS: WatchedSortOption<WatchedSortKey>[] = [
  { key: "recent", label: "Recentes" },
  { key: "rating", label: "Nota" },
  { key: "title", label: "A-Z" },
  { key: "release", label: "Lançamento" },
];

const SERIE_SORT_OPTIONS: WatchedSortOption<WatchedSerieSortKey>[] = [
  { key: "recent", label: "Recentes" },
  { key: "rating", label: "Nota" },
  { key: "title", label: "A-Z" },
  { key: "progress", label: "Progresso" },
];

const sortMovies = (
  movies: WatchedMovieItem[],
  sortKey: WatchedSortKey,
): WatchedMovieItem[] => {
  const sorted = [...movies];

  switch (sortKey) {
    case "rating":
      return sorted.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
    case "title":
      return sorted.sort((a, b) =>
        (a.title ?? "").localeCompare(b.title ?? "", "pt-BR"),
      );
    case "release":
      return sorted.sort(
        (a, b) =>
          new Date(b.releaseDate ?? 0).getTime() -
          new Date(a.releaseDate ?? 0).getTime(),
      );
    default:
      return sorted.sort(
        (a, b) =>
          new Date(b.watchedAt ?? b.createdAt).getTime() -
          new Date(a.watchedAt ?? a.createdAt).getTime(),
      );
  }
};

const sortSeries = (
  series: WatchedSerieItem[],
  sortKey: WatchedSerieSortKey,
): WatchedSerieItem[] => {
  const sorted = [...series];

  switch (sortKey) {
    case "rating":
      return sorted.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
    case "title":
      return sorted.sort((a, b) =>
        (a.name ?? "").localeCompare(b.name ?? "", "pt-BR"),
      );
    case "progress":
      return sorted.sort(
        (a, b) =>
          b.watchedSeasons / (b.numberOfSeasons || 1) -
          a.watchedSeasons / (a.numberOfSeasons || 1),
      );
    default:
      return sorted.sort(
        (a, b) =>
          new Date(b.watchedAt ?? b.createdAt).getTime() -
          new Date(a.watchedAt ?? a.createdAt).getTime(),
      );
  }
};

const formatRuntime = (minutes: number): string => {
  if (!minutes) return "—";
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  if (days > 0) return `≈ ${days}d ${hours}h`;
  return `≈ ${hours}h ${minutes % 60}min`;
};

const PageShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <Head>
      <title>GuysMovies - Assistidos</title>
    </Head>
    <Header />
    <main className="relative mx-auto w-full max-w-[1600px] px-4 pb-16 pt-8 sm:px-6 lg:px-10 xl:px-14">
      {children}
    </main>
    <Footer />
  </>
);

const WatchedPage = () => {
  const { user, authLoading } = useAuth();
  const router = useRouter();
  const activeTab: WatchedTab =
    router.query.tab === "series" ? "series" : "movies";

  const [data, setData] = useState<WatchedMovieList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<WatchedSortKey>("recent");
  const [onlyRated, setOnlyRated] = useState(false);
  const [selected, setSelected] = useState<WatchedMovieItem | null>(null);

  const [serieData, setSerieData] = useState<WatchedSerieList | null>(null);
  const [isSerieLoading, setIsSerieLoading] = useState(false);
  const [serieError, setSerieError] = useState("");
  const [serieQuery, setSerieQuery] = useState("");
  const [serieSortKey, setSerieSortKey] =
    useState<WatchedSerieSortKey>("recent");
  const [serieOnlyRated, setSerieOnlyRated] = useState(false);
  const [selectedSerie, setSelectedSerie] = useState<WatchedSerieItem | null>(
    null,
  );

  const switchTab = useCallback(
    (tab: WatchedTab) => {
      router.push({ query: { tab } }, undefined, { shallow: true });
    },
    [router],
  );

  const fetchWatched = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_URL_API}/watchedMovie/list`,
      );

      if (!response.ok) throw new Error("Falha ao carregar a lista");

      setData((await response.json()) as WatchedMovieList);
    } catch {
      setError("Não foi possível carregar seus filmes assistidos.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setIsLoading(false);
      return;
    }

    fetchWatched();
  }, [authLoading, fetchWatched, user]);

  const fetchWatchedSeries = useCallback(async () => {
    setIsSerieLoading(true);
    setSerieError("");

    try {
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_URL_API}/watchedSerie/list`,
      );
      if (!response.ok) throw new Error("Falha ao carregar a lista");
      setSerieData((await response.json()) as WatchedSerieList);
    } catch {
      setSerieError("Não foi possível carregar suas séries assistidas.");
    } finally {
      setIsSerieLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading || !user) return;
    if (activeTab !== "series" || serieData || isSerieLoading) return;
    fetchWatchedSeries();
  }, [
    activeTab,
    authLoading,
    fetchWatchedSeries,
    isSerieLoading,
    serieData,
    user,
  ]);

  const visibleMovies = useMemo(() => {
    if (!data) return [];

    const normalizedQuery = query.trim().toLowerCase();

    const filtered = data.items.filter((movie) => {
      if (onlyRated && movie.rating === null) return false;
      if (!normalizedQuery) return true;

      return (
        movie.title?.toLowerCase().includes(normalizedQuery) ||
        movie.director?.toLowerCase().includes(normalizedQuery)
      );
    });

    return sortMovies(filtered, sortKey);
  }, [data, onlyRated, query, sortKey]);

  const visibleSeries = useMemo(() => {
    if (!serieData) return [];

    const normalizedQuery = serieQuery.trim().toLowerCase();

    const filtered = serieData.items.filter((serie) => {
      if (serieOnlyRated && serie.rating === null) return false;
      if (!normalizedQuery) return true;

      return serie.name?.toLowerCase().includes(normalizedQuery);
    });

    return sortSeries(filtered, serieSortKey);
  }, [serieData, serieOnlyRated, serieQuery, serieSortKey]);

  const showSerieRuntimeCard = !serieData || serieData.stats.runtimeMinutes > 0;
  const serieStatsGridClass = showSerieRuntimeCard
    ? "mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    : "mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3";

  const updateWatchedAt = useCallback(
    async (idTmdb: number, watchedAt: string | null) => {
      const previous = data;
      const previousWatchedAt =
        data?.items.find((item) => item.idTmdb === idTmdb)?.watchedAt ?? null;

      setData((current) =>
        current
          ? {
              ...current,
              items: current.items.map((item) =>
                item.idTmdb === idTmdb ? { ...item, watchedAt } : item,
              ),
            }
          : current,
      );
      setSelected((current) =>
        current && current.idTmdb === idTmdb
          ? { ...current, watchedAt }
          : current,
      );

      try {
        const response = await authFetch(
          `${process.env.NEXT_PUBLIC_URL_API}/watchedMovie/watchedAt`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idTmdb, watchedAt }),
          },
        );

        if (!response.ok) throw new Error("Requisição rejeitada");

        const item = (await response.json()) as WatchedMovieItem;
        setData((current) =>
          current
            ? {
                ...current,
                items: current.items.map((existing) =>
                  existing.idTmdb === item.idTmdb ? item : existing,
                ),
              }
            : current,
        );
        setSelected((current) =>
          current && current.idTmdb === item.idTmdb ? item : current,
        );
      } catch {
        setData(previous);
        setSelected((current) =>
          current && current.idTmdb === idTmdb
            ? { ...current, watchedAt: previousWatchedAt }
            : current,
        );
        toast.error("Erro ao atualizar a data.");
        fetchWatched();
      }
    },
    [data, fetchWatched],
  );

  const handleSerieProgressChange = useCallback(
    (idTmdb: number, watchedSeasons: number, completedAt: string | null) => {
      setSerieData((current) =>
        current
          ? {
              ...current,
              items: current.items.map((item) =>
                item.idTmdb === idTmdb
                  ? { ...item, watchedSeasons, completedAt }
                  : item,
              ),
            }
          : current,
      );
      setSelectedSerie((current) =>
        current && current.idTmdb === idTmdb
          ? { ...current, watchedSeasons, completedAt }
          : current,
      );
    },
    [],
  );

  const closeSheet = useCallback(() => setSelected(null), []);
  const closeSerieSheet = useCallback(() => setSelectedSerie(null), []);

  if (authLoading) {
    return (
      <PageShell>
        <div className="flex min-h-[50vh] items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-indigo-400" />
        </div>
      </PageShell>
    );
  }

  if (!user) {
    return (
      <PageShell>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-16 max-w-lg rounded-[2rem] border border-white/10 bg-white/[0.03] p-10 text-center backdrop-blur-xl"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-300">
            <svg viewBox="0 0 20 20" className="h-7 w-7">
              <path
                fill="currentColor"
                d="M10 3.5c-4 0-7.2 2.6-8.5 6.5 1.3 3.9 4.5 6.5 8.5 6.5s7.2-2.6 8.5-6.5C17.2 6.1 14 3.5 10 3.5zm0 11a4.5 4.5 0 110-9 4.5 4.5 0 010 9zm0-2a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
              />
            </svg>
          </div>
          <h1 className="mt-5 text-2xl font-bold text-white">
            Sua estante de filmes
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/55">
            Entre na sua conta para ver tudo o que você já assistiu, com as
            notas que deu e as datas em que assistiu cada filme.
          </p>
          <Link
            href="/"
            className="mt-7 inline-flex rounded-2xl px-6 py-3 text-sm font-bold tracking-tight bg-white text-[#05050c] transition-all duration-300 ease-ios hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-[0_10px_30px_-12px_rgba(255,255,255,0.5)] active:translate-y-0 active:scale-[0.96]"
          >
            Voltar para a home
          </Link>
        </motion.div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <motion.header
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8"
      >
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.28em] text-indigo-300">
          Sua coleção
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
          {activeTab === "movies" ? (
            <>
              Filmes <span className="brand-text">assistidos</span>
            </>
          ) : (
            <>
              Séries <span className="brand-text">assistidas</span>
            </>
          )}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/55">
          {activeTab === "movies"
            ? "Tudo o que você marcou como assistido fica aqui. Use a busca e os filtros para reencontrar um filme, e toque em qualquer pôster para ver a nota que deu, a direção e a data em que assistiu."
            : "Tudo o que você já assistiu fica aqui, temporada por temporada. Toque em qualquer pôster para ver o progresso, marcar temporadas e acompanhar quando completou."}
        </p>

        <div
          role="tablist"
          aria-label="Alternar entre filmes e séries"
          className="mt-6 inline-flex rounded-2xl border border-white/10 bg-black/25 p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "movies"}
            onClick={() => switchTab("movies")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
              activeTab === "movies"
                ? "bg-white/12 text-white"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            Filmes
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "series"}
            onClick={() => switchTab("series")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
              activeTab === "series"
                ? "bg-white/12 text-white"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            Séries
          </button>
        </div>
      </motion.header>

      {activeTab === "movies" && (
        <>
          <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              label="Assistidos"
              value={data?.stats.total ?? null}
              hint="Total de filmes na sua estante"
              accent="indigo"
              delay={0.05}
            />
            <StatCard
              label="Nota média"
              value={data?.stats.averageRating ?? null}
              hint={
                data?.stats.rated
                  ? `Baseada em ${data.stats.rated} ${
                      data.stats.rated === 1 ? "avaliação" : "avaliações"
                    }`
                  : "Avalie um filme para ver sua média"
              }
              suffix=" / 5"
              decimals={1}
              accent="amber"
              delay={0.12}
            />
            <StatCard
              label="Avaliados"
              value={data?.stats.rated ?? null}
              hint="Filmes em que você deixou uma nota"
              accent="emerald"
              delay={0.19}
            />
          </section>

          {error && (
            <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-red-400/25 bg-red-500/10 px-5 py-4">
              <p className="text-sm text-red-200">{error}</p>
              <button
                type="button"
                onClick={fetchWatched}
                className="rounded-xl bg-red-500/20 px-4 py-2 text-xs font-semibold text-red-100 transition hover:bg-red-500/30"
              >
                Tentar de novo
              </button>
            </div>
          )}

          {!error && data && data.items.length > 0 && (
            <div className="mb-8">
              <WatchedToolbar
                query={query}
                onQueryChange={setQuery}
                searchPlaceholder="Buscar nos assistidos..."
                searchAriaLabel="Buscar nos filmes assistidos"
                sortKey={sortKey}
                onSortChange={setSortKey}
                sortOptions={MOVIE_SORT_OPTIONS}
                sortAriaLabel="Ordenar filmes"
                onlyRated={onlyRated}
                onOnlyRatedChange={setOnlyRated}
                resultCount={visibleMovies.length}
                resultLabelSingular="filme"
                resultLabelPlural="filmes"
              />
            </div>
          )}

          {isLoading && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5 xl:grid-cols-6">
              {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse overflow-hidden rounded-[1.75rem] border border-white/5 bg-white/[0.03]"
                >
                  <div className="aspect-[2/3] w-full bg-white/5" />
                  <div className="space-y-2 p-4">
                    <div className="h-3.5 w-4/5 rounded-full bg-white/10" />
                    <div className="h-3 w-1/2 rounded-full bg-white/5" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && !error && data?.items.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto mt-6 max-w-lg rounded-[2rem] border border-white/10 bg-white/[0.03] p-10 text-center backdrop-blur-xl"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-white/40">
                <svg viewBox="0 0 20 20" className="h-7 w-7">
                  <path
                    fill="currentColor"
                    d="M3 4h14a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1zm1.5 2.5v7h11v-7h-11z"
                  />
                </svg>
              </div>
              <h2 className="mt-5 text-xl font-bold text-white">
                Nenhum filme por aqui ainda
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/55">
                Abra a página de um filme e toque em{" "}
                <span className="font-semibold text-white/80">
                  Marcar como assistido
                </span>
                . Ele aparece aqui na hora, junto com a nota que você der.
              </p>
              <Link
                href="/"
                className="mt-7 inline-flex rounded-2xl px-6 py-3 text-sm font-bold tracking-tight bg-white text-[#05050c] transition-all duration-300 ease-ios hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-[0_10px_30px_-12px_rgba(255,255,255,0.5)] active:translate-y-0 active:scale-[0.96]"
              >
                Descobrir filmes
              </Link>
            </motion.div>
          )}

          {!isLoading &&
          !error &&
          visibleMovies.length === 0 &&
          data?.items.length ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] py-16 text-center">
              <p className="text-sm text-white/50">
                Nenhum filme corresponde à sua busca.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setOnlyRated(false);
                }}
                className="mt-4 rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/20"
              >
                Limpar filtros
              </button>
            </div>
          ) : null}

          {!isLoading && !error && visibleMovies.length > 0 && (
            <motion.div
              layout
              className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5 xl:grid-cols-6"
            >
              <AnimatePresence mode="popLayout">
                {visibleMovies.map((movie, index) => (
                  <WatchedTile
                    key={movie.idTmdb}
                    movie={movie}
                    index={index}
                    onSelect={setSelected}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </>
      )}

      {activeTab === "series" && (
        <>
          <section className={serieStatsGridClass}>
            <StatCard
              label="Séries"
              value={serieData?.stats.total ?? null}
              hint={
                serieData
                  ? `${serieData.stats.completed} completas · ${serieData.stats.inProgress} em andamento`
                  : "Total de séries na sua estante"
              }
              accent="indigo"
              delay={0.05}
            />
            <StatCard
              label="Episódios"
              value={serieData?.stats.episodes ?? null}
              hint="Episódios assistidos ao todo"
              accent="emerald"
              delay={0.1}
            />
            {showSerieRuntimeCard && (
              <StatCard
                label="Tempo assistido"
                value={serieData?.stats.runtimeMinutes ?? null}
                formatValue={formatRuntime}
                hint="Estimativa a partir da duração média dos episódios"
                accent="indigo"
                delay={0.15}
              />
            )}
            <StatCard
              label="Nota média"
              value={serieData?.stats.averageRating ?? null}
              hint="Baseada nas séries que você avaliou"
              suffix=" / 5"
              decimals={1}
              accent="amber"
              delay={showSerieRuntimeCard ? 0.2 : 0.15}
            />
          </section>

          {serieError && (
            <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-red-400/25 bg-red-500/10 px-5 py-4">
              <p className="text-sm text-red-200">{serieError}</p>
              <button
                type="button"
                onClick={fetchWatchedSeries}
                className="rounded-xl bg-red-500/20 px-4 py-2 text-xs font-semibold text-red-100 transition hover:bg-red-500/30"
              >
                Tentar de novo
              </button>
            </div>
          )}

          {!serieError && serieData && serieData.items.length > 0 && (
            <div className="mb-8">
              <WatchedToolbar
                query={serieQuery}
                onQueryChange={setSerieQuery}
                searchPlaceholder="Buscar nas séries assistidas..."
                searchAriaLabel="Buscar nas séries assistidas"
                sortKey={serieSortKey}
                onSortChange={setSerieSortKey}
                sortOptions={SERIE_SORT_OPTIONS}
                sortAriaLabel="Ordenar séries"
                onlyRated={serieOnlyRated}
                onOnlyRatedChange={setSerieOnlyRated}
                resultCount={visibleSeries.length}
                resultLabelSingular="série"
                resultLabelPlural="séries"
              />
            </div>
          )}

          {isSerieLoading && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5 xl:grid-cols-6">
              {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse overflow-hidden rounded-[1.75rem] border border-white/5 bg-white/[0.03]"
                >
                  <div className="aspect-[2/3] w-full bg-white/5" />
                  <div className="space-y-2 p-4">
                    <div className="h-3.5 w-4/5 rounded-full bg-white/10" />
                    <div className="h-3 w-1/2 rounded-full bg-white/5" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isSerieLoading && !serieError && serieData?.items.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto mt-6 max-w-lg rounded-[2rem] border border-white/10 bg-white/[0.03] p-10 text-center backdrop-blur-xl"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-white/40">
                <svg viewBox="0 0 20 20" className="h-7 w-7">
                  <path
                    fill="currentColor"
                    d="M3 4h14a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1zm1.5 2.5v7h11v-7h-11z"
                  />
                </svg>
              </div>
              <h2 className="mt-5 text-xl font-bold text-white">
                Nenhuma série por aqui ainda
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/55">
                Abra a página de uma série e marque uma{" "}
                <span className="font-semibold text-white/80">temporada</span>{" "}
                como assistida. Ela aparece aqui na hora, com o progresso de
                cada temporada.
              </p>
              <Link
                href="/series"
                className="mt-7 inline-flex rounded-2xl px-6 py-3 text-sm font-bold tracking-tight bg-white text-[#05050c] transition-all duration-300 ease-ios hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-[0_10px_30px_-12px_rgba(255,255,255,0.5)] active:translate-y-0 active:scale-[0.96]"
              >
                Descobrir séries
              </Link>
            </motion.div>
          )}

          {!isSerieLoading &&
          !serieError &&
          visibleSeries.length === 0 &&
          serieData?.items.length ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] py-16 text-center">
              <p className="text-sm text-white/50">
                Nenhuma série corresponde à sua busca.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSerieQuery("");
                  setSerieOnlyRated(false);
                }}
                className="mt-4 rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/20"
              >
                Limpar filtros
              </button>
            </div>
          ) : null}

          {!isSerieLoading && !serieError && visibleSeries.length > 0 && (
            <motion.div
              layout
              className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5 xl:grid-cols-6"
            >
              <AnimatePresence mode="popLayout">
                {visibleSeries.map((serie, index) => (
                  <WatchedSerieTile
                    key={serie.idTmdb}
                    serie={serie}
                    index={index}
                    onSelect={setSelectedSerie}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </>
      )}

      <WatchedDetailSheet
        movie={selected}
        onClose={closeSheet}
        onWatchedAtChange={updateWatchedAt}
      />

      <WatchedSerieSheet
        serie={selectedSerie}
        onClose={closeSerieSheet}
        onProgressChange={handleSerieProgressChange}
      />
    </PageShell>
  );
};

export default WatchedPage;
