import React, { useCallback, useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

import Header from "../components/_ui/header";
import Footer from "../components/_ui/footer";
import StatCard from "../components/watched/statCard";
import WatchedTile from "../components/watched/watchedTile";
import WatchedToolbar from "../components/watched/watchedToolbar";
import WatchedDetailSheet from "../components/watched/watchedDetailSheet";
import { useAuth } from "../hooks/authContext";
import { authFetch } from "../utils/authFetch";
import {
  WatchedMovieItem,
  WatchedMovieList,
  WatchedSortKey,
} from "../interfaces/watched/types";

const SKELETON_COUNT = 10;

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

const PageShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <Head>
      <title>GuysMovies - Assistidos</title>
    </Head>
    <Header />
    <main className="mx-auto w-full max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:px-10">
      {children}
    </main>
    <Footer />
  </>
);

const WatchedPage = () => {
  const { user, authLoading } = useAuth();

  const [data, setData] = useState<WatchedMovieList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<WatchedSortKey>("recent");
  const [onlyRated, setOnlyRated] = useState(false);
  const [selected, setSelected] = useState<WatchedMovieItem | null>(null);

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

  const closeSheet = useCallback(() => setSelected(null), []);

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
            className="mt-7 inline-flex rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
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
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-300">
          Sua coleção
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Filmes assistidos
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/55">
          Tudo o que você marcou como assistido fica aqui. Use a busca e os
          filtros para reencontrar um filme, e toque em qualquer pôster para ver
          a nota que deu, a direção e a data em que assistiu.
        </p>
      </motion.header>

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
            sortKey={sortKey}
            onSortChange={setSortKey}
            onlyRated={onlyRated}
            onOnlyRatedChange={setOnlyRated}
            resultCount={visibleMovies.length}
          />
        </div>
      )}

      {isLoading && (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
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
            className="mt-7 inline-flex rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
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
          className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5"
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

      <WatchedDetailSheet movie={selected} onClose={closeSheet} />
    </PageShell>
  );
};

export default WatchedPage;
