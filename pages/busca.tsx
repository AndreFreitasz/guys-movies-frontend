import React, { useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Header from "../components/_ui/header";
import Footer from "../components/_ui/footer";
import CatalogErrorState from "../components/_ui/catalogErrorState";
import MovieCard from "../components/home/movieCard";
import SearchResultGrid from "../components/search/searchResultGrid";
import SearchTypeFilter, {
  SearchTypeFilterValue,
} from "../components/search/searchTypeFilter";
import { useSearch } from "../hooks/useSearch";

interface PopularMovie {
  id: number;
  title: string;
  poster_path: string;
  overview: string;
  vote_average: number;
}

const URL_SYNC_DEBOUNCE_MS = 300;
const SKELETON_TILE_COUNT = 12;

const SearchSkeletonGrid: React.FC = () => (
  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
    {Array.from({ length: SKELETON_TILE_COUNT }).map((_, index) => (
      <div key={index} className="skeleton aspect-[2/3] w-full rounded-2xl" />
    ))}
  </div>
);

const Busca: React.FC = () => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [term, setTerm] = useState("");
  const [autoFocusEnabled, setAutoFocusEnabled] = useState(false);
  const [typeFilter, setTypeFilter] = useState<SearchTypeFilterValue>("all");
  const [popularMovies, setPopularMovies] = useState<PopularMovie[]>([]);
  const [isLoadingPopular, setIsLoadingPopular] = useState(true);
  const [popularError, setPopularError] = useState(false);
  const [popularReloadToken, setPopularReloadToken] = useState(0);

  const { results, isSearching, error, retry } = useSearch(term);

  useEffect(() => {
    if (!router.isReady || isReady) return;

    const queryValue = router.query.q;
    const initialTerm = typeof queryValue === "string" ? queryValue : "";

    setTerm(initialTerm);
    setAutoFocusEnabled(!queryValue);
    setIsReady(true);
  }, [router.isReady, router.query.q, isReady]);

  useEffect(() => {
    if (isReady && autoFocusEnabled) inputRef.current?.focus();
  }, [isReady, autoFocusEnabled]);

  useEffect(() => {
    if (!isReady) return;

    const timeout = setTimeout(() => {
      const trimmedTerm = term.trim();

      router.replace(
        {
          pathname: "/busca",
          query: trimmedTerm ? { q: trimmedTerm } : {},
        },
        undefined,
        { shallow: true },
      );
    }, URL_SYNC_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [term, isReady]);

  useEffect(() => {
    let cancelled = false;

    setIsLoadingPopular(true);
    setPopularError(false);

    fetch(`${process.env.NEXT_PUBLIC_URL_API}/movies/popular`)
      .then((response) => {
        if (!response.ok) throw new Error("Falha ao buscar populares");
        return response.json();
      })
      .then((data: PopularMovie[]) => {
        if (!cancelled) setPopularMovies(data);
      })
      .catch(() => {
        if (!cancelled) setPopularError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingPopular(false);
      });

    return () => {
      cancelled = true;
    };
  }, [popularReloadToken]);

  const visible = useMemo(
    () =>
      typeFilter === "all"
        ? results
        : results.filter((item) => item.type === typeFilter),
    [results, typeFilter],
  );

  const counts = useMemo(
    () => ({
      all: results.length,
      movie: results.filter((item) => item.type === "movie").length,
      serie: results.filter((item) => item.type === "serie").length,
    }),
    [results],
  );

  const hasTerm = term.trim().length > 0;
  const showResting = !hasTerm && !isSearching;
  const showEmpty = hasTerm && !isSearching && !error && results.length === 0;

  return (
    <>
      <Head>
        <title>GuysMovies - Busca</title>
        <meta
          name="description"
          content="Busque filmes e séries pelo título."
        />
      </Head>
      <Header />

      <main className="relative mx-auto w-full max-w-[1600px] px-4 pb-16 pt-8 sm:px-6 lg:px-10 xl:px-14">
        <div className="aurora" />

        <header className="relative mb-6">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.28em] text-indigo-300">
            Busca
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
            Encontre o que <span className="brand-text">assistir</span>
          </h1>
        </header>

        <div className="relative mb-5 max-w-xl">
          <input
            ref={inputRef}
            type="text"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Buscar filmes, séries..."
            aria-label="Buscar filmes e séries"
            className="w-full rounded-full border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-medium text-white placeholder:text-white/35 backdrop-blur-xl focus:border-indigo-400/60 focus:outline-none"
          />
        </div>

        <div className="mb-8">
          <SearchTypeFilter
            value={typeFilter}
            onChange={setTypeFilter}
            counts={counts}
          />
        </div>

        {error ? (
          <CatalogErrorState
            title="Não foi possível buscar agora"
            message="Verifique sua conexão e tente novamente."
            onRetry={retry}
          />
        ) : showResting ? (
          <section className="relative">
            <h2 className="mb-4 text-lg font-black tracking-tight text-white">
              Em alta agora
            </h2>
            {popularError ? (
              <CatalogErrorState
                title="Não conseguimos carregar os populares"
                message="Tente novamente em alguns instantes."
                onRetry={() => setPopularReloadToken((token) => token + 1)}
              />
            ) : isLoadingPopular ? (
              <SearchSkeletonGrid />
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
                {popularMovies.map((movie) => (
                  <MovieCard key={movie.id} {...movie} />
                ))}
              </div>
            )}
          </section>
        ) : isSearching ? (
          <SearchSkeletonGrid />
        ) : showEmpty ? (
          <p className="mt-10 text-center text-sm leading-relaxed text-white/50">
            Nada encontrado para{" "}
            <span className="font-bold text-white">{term.trim()}</span>. Tente
            outro termo ou confira a grafia.
          </p>
        ) : (
          <SearchResultGrid results={visible} />
        )}
      </main>

      <Footer />
    </>
  );
};

export default Busca;
