import React, { useCallback, useEffect, useRef, useState } from "react";
import Head from "next/head";
import { GetServerSideProps } from "next";
import Header from "../components/_ui/header";
import Footer from "../components/_ui/footer";
import Hero from "../components/home/hero";
import SectionRow from "../components/home/sectionRow";
import MoviesProvider from "../components/home/moviesProvider";
import MovieCard from "../components/home/movieCard";
import LoadingSpinner from "../components/_ui/loadingSpinner";
import { setPublicCache } from "../utils/httpCache";

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  overview: string;
  vote_average: number;
  backdrop_path?: string | null;
  release_date?: string | null;
}

interface HomeProps {
  initialProviderData: any[];
  initialPopularMovies: Movie[];
  initialPopularMoviesHorror: Movie[];
  initialPopularMoviesSciFi: Movie[];
  initialPopularMoviesFamily: Movie[];
  initialTopRatedMovies: Movie[];
  initialPopularMoviesDrama: Movie[];
  initialPopularMoviesSciFiDrama: Movie[];
  initialPopularMoviesComedy: Movie[];
  error: string | null;
}

const MAX_POPULAR_PAGES = 5;

const providerResponsive = [
  { breakpoint: 1536, settings: { slidesToShow: 3, slidesToScroll: 1 } },
  { breakpoint: 1280, settings: { slidesToShow: 2, slidesToScroll: 1 } },
  { breakpoint: 900, settings: { slidesToShow: 1, slidesToScroll: 1 } },
];

const Home: React.FC<HomeProps> = ({
  initialProviderData,
  initialPopularMovies,
  initialPopularMoviesHorror,
  initialPopularMoviesSciFi,
  initialPopularMoviesFamily,
  initialTopRatedMovies,
  initialPopularMoviesDrama,
  initialPopularMoviesSciFiDrama,
  initialPopularMoviesComedy,
  error,
}) => {
  const [popularMovies, setPopularMovies] = useState(initialPopularMovies);
  const [page, setPage] = useState(1);
  const [hasMoreMovies, setHasMoreMovies] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const seenIdsRef = useRef(
    new Set(initialPopularMovies.map((movie) => movie.id)),
  );

  useEffect(() => {
    seenIdsRef.current = new Set(initialPopularMovies.map((movie) => movie.id));
    setPopularMovies(initialPopularMovies);
    setPage(1);
    setHasMoreMovies(true);
  }, [initialPopularMovies]);

  const loadMoreMovies = useCallback(async () => {
    if (loadingRef.current) return;

    loadingRef.current = true;

    try {
      const nextPage = page + 1;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL_API}/movies/popular?page=${nextPage}`,
      );

      if (!response.ok) throw new Error("Falha ao carregar mais filmes");

      const data: Movie[] = await response.json();
      const newMovies = data.filter(
        (movie) => !seenIdsRef.current.has(movie.id),
      );

      if (!newMovies.length) {
        setHasMoreMovies(false);
        return;
      }

      newMovies.forEach((movie) => seenIdsRef.current.add(movie.id));
      setPopularMovies((previous) => [...previous, ...newMovies]);
      setPage(nextPage);
      setHasMoreMovies(nextPage < MAX_POPULAR_PAGES);
    } catch {
      setHasMoreMovies(false);
    } finally {
      loadingRef.current = false;
    }
  }, [page]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMoreMovies) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMoreMovies();
      },
      { rootMargin: "600px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMoreMovies, loadMoreMovies]);

  if (error) {
    return (
      <>
        <Head>
          <title>GuysMovies - Erro</title>
        </Head>
        <Header />
        <div className="mx-auto flex min-h-[60vh] w-full max-w-lg flex-col items-center justify-center px-4 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/15 text-2xl">
            ⚠️
          </span>
          <h1 className="mt-5 text-2xl font-black text-white">
            Não conseguimos carregar o catálogo
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/45">{error}</p>
        </div>
        <Footer />
      </>
    );
  }

  const renderMovieCard = (movie: Movie) => (
    <MovieCard key={movie.id} {...movie} />
  );

  return (
    <>
      <Head>
        <title>GuysMovies - Filmes</title>
        <meta
          name="description"
          content="Descubra filmes populares, aclamados pela crítica e disponíveis nos principais streamings."
        />
      </Head>
      <Header />

      {!initialProviderData.length ? (
        <LoadingSpinner />
      ) : (
        <main className="relative overflow-x-hidden">
          <Hero movies={popularMovies} />

          <div
            id="catalogo"
            className="relative mx-auto w-full max-w-[1600px] px-4 pb-16 sm:px-6 lg:px-10 xl:px-14"
          >
            <div className="aurora" />

            <SectionRow
              iconSrc="/icons/home/popular.png"
              iconAlt="Ícone de uma estrela"
              eyebrow="Por plataforma"
              title="Populares nos streamings"
              data={initialProviderData}
              slidesToShow={4}
              infinite={false}
              responsive={providerResponsive}
              skeletonVariant="panel"
              renderItem={(providerData: any) => (
                <MoviesProvider
                  providerData={providerData}
                  key={providerData.provider.id}
                />
              )}
            />

            <SectionRow
              iconSrc="/icons/home/cinema.png"
              iconAlt="Ícone de um cinema"
              eyebrow="Todo mundo assistindo"
              title="Filmes populares"
              data={popularMovies}
              renderItem={renderMovieCard}
            />

            <SectionRow
              iconSrc="/icons/home/horror.png"
              iconAlt="Ícone de terror"
              eyebrow="Para uma noite tensa"
              title="Terror e suspense"
              data={initialPopularMoviesHorror}
              renderItem={renderMovieCard}
            />

            <SectionRow
              iconSrc="/icons/home/scifi.png"
              iconAlt="Ícone de tecnologia"
              eyebrow="Mundos possíveis"
              title="Ficção científica"
              data={initialPopularMoviesSciFi}
              renderItem={renderMovieCard}
            />

            <SectionRow
              iconSrc="/icons/home/like.png"
              iconAlt="Ícone de curtir"
              eyebrow="Nota alta"
              title="Aclamados pela crítica"
              data={initialTopRatedMovies}
              renderItem={renderMovieCard}
            />

            <SectionRow
              iconSrc="/icons/home/family.png"
              iconAlt="Ícone de uma família"
              eyebrow="Para ver junto"
              title="Família"
              data={initialPopularMoviesFamily}
              renderItem={renderMovieCard}
            />

            <SectionRow
              iconSrc="/icons/home/drama.png"
              iconAlt="Ícone de drama"
              eyebrow="História que fica"
              title="Drama"
              data={initialPopularMoviesDrama}
              renderItem={renderMovieCard}
            />

            <SectionRow
              iconSrc="/icons/home/rocket.png"
              iconAlt="Ícone de um foguete"
              eyebrow="O melhor dos dois"
              title="Sci-Fi dramático"
              data={initialPopularMoviesSciFiDrama}
              renderItem={renderMovieCard}
            />

            <SectionRow
              iconSrc="/icons/home/comedy.png"
              iconAlt="Ícone de comédia"
              eyebrow="Para relaxar"
              title="Comédia"
              data={initialPopularMoviesComedy}
              renderItem={renderMovieCard}
            />

            <div ref={sentinelRef} aria-hidden className="h-px w-full" />
          </div>
        </main>
      )}

      <Footer />
    </>
  );
};

const OVERVIEW_MAX_LENGTH = 200;

const truncateOverview = (overview: unknown): string => {
  if (typeof overview !== "string") return "";
  return overview.length > OVERVIEW_MAX_LENGTH
    ? `${overview.slice(0, OVERVIEW_MAX_LENGTH).trimEnd()}...`
    : overview;
};

const pickMovieFields = (movie: any, withHeroFields: boolean): Movie => ({
  id: movie.id,
  title: movie.title,
  poster_path: movie.poster_path,
  overview: truncateOverview(movie.overview),
  vote_average: movie.vote_average ?? 0,
  ...(withHeroFields
    ? {
        backdrop_path: movie.backdrop_path ?? null,
        release_date: movie.release_date ?? null,
      }
    : {}),
});

const pickMovies = (movies: any, withHeroFields = false): Movie[] =>
  Array.isArray(movies)
    ? movies.map((movie) => pickMovieFields(movie, withHeroFields))
    : [];

const PROVIDER_MOVIES_SHOWN = 5;

const pickProviderData = (providers: any) =>
  Array.isArray(providers)
    ? providers.map((entry: any) => ({
        provider: {
          id: entry.provider?.id,
          name: entry.provider?.name,
          logoUrl: entry.provider?.logoUrl,
        },
        movies: (Array.isArray(entry.movies) ? entry.movies : [])
          .slice(0, PROVIDER_MOVIES_SHOWN)
          .map((movie: any) => ({
            id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
            overview: truncateOverview(movie.overview),
          })),
      }))
    : [];

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  try {
    const [
      providerRes,
      popularRes,
      horrorRes,
      sciFiRes,
      familyRes,
      topRatedRes,
      dramaRes,
      sciFiDramaRes,
      comedyRes,
    ] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_URL_API}/movies/popularByProviders`),
      fetch(`${process.env.NEXT_PUBLIC_URL_API}/movies/popular`),
      fetch(
        `${process.env.NEXT_PUBLIC_URL_API}/movies/popularByGenres/27,9648`,
      ),
      fetch(`${process.env.NEXT_PUBLIC_URL_API}/movies/popularByGenres/878`),
      fetch(`${process.env.NEXT_PUBLIC_URL_API}/movies/popularByGenres/10751`),
      fetch(`${process.env.NEXT_PUBLIC_URL_API}/movies/topRated`),
      fetch(`${process.env.NEXT_PUBLIC_URL_API}/movies/popularByGenres/18`),
      fetch(`${process.env.NEXT_PUBLIC_URL_API}/movies/popularByGenres/18,878`),
      fetch(`${process.env.NEXT_PUBLIC_URL_API}/movies/popularByGenres/35`),
    ]);

    if (
      !providerRes.ok ||
      !popularRes.ok ||
      !horrorRes.ok ||
      !sciFiRes.ok ||
      !familyRes.ok ||
      !topRatedRes.ok ||
      !dramaRes.ok ||
      !sciFiDramaRes.ok ||
      !comedyRes.ok
    ) {
      throw new Error(
        "Ocorreu um erro ao buscar os dados, tente novamente mais tarde!",
      );
    }

    const [
      providerData,
      popularMovies,
      popularMoviesHorror,
      popularMoviesSciFi,
      popularMoviesFamily,
      topRatedMovies,
      popularMoviesDrama,
      popularMoviesSciFiDrama,
      popularMoviesComedy,
    ] = await Promise.all([
      providerRes.json(),
      popularRes.json(),
      horrorRes.json(),
      sciFiRes.json(),
      familyRes.json(),
      topRatedRes.json(),
      dramaRes.json(),
      sciFiDramaRes.json(),
      comedyRes.json(),
    ]);

    setPublicCache(res, 300, 1800);

    return {
      props: {
        initialProviderData: pickProviderData(providerData),
        initialPopularMovies: pickMovies(popularMovies, true),
        initialPopularMoviesHorror: pickMovies(popularMoviesHorror),
        initialPopularMoviesSciFi: pickMovies(popularMoviesSciFi),
        initialPopularMoviesFamily: pickMovies(popularMoviesFamily),
        initialTopRatedMovies: pickMovies(topRatedMovies),
        initialPopularMoviesDrama: pickMovies(popularMoviesDrama),
        initialPopularMoviesSciFiDrama: pickMovies(popularMoviesSciFiDrama),
        initialPopularMoviesComedy: pickMovies(popularMoviesComedy),
        error: null,
      },
    };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "An unknown error occurred";
    return {
      props: {
        initialProviderData: [],
        initialPopularMovies: [],
        initialPopularMoviesHorror: [],
        initialPopularMoviesSciFi: [],
        initialPopularMoviesFamily: [],
        initialTopRatedMovies: [],
        initialPopularMoviesDrama: [],
        initialPopularMoviesSciFiDrama: [],
        initialPopularMoviesComedy: [],
        error: errorMessage,
      },
    };
  }
};

export default Home;
