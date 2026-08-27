import React, { useCallback, useEffect, useRef, useState } from "react";
import Header from "../components/_ui/header";
import Title from "../components/_ui/title";
import Image from "next/image";
import Carousel from "../components/_ui/carousel";
import MoviesProvider from "../components/home/moviesProvider";
import MovieCard from "../components/home/movieCard";
import Footer from "../components/_ui/footer";
import { GetServerSideProps } from "next";
import LoadingSpinner from "../components/_ui/loadingSpinner";
import Head from "next/head";
import { setPublicCache } from "../utils/httpCache";

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  overview: string;
  vote_average: number;
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
  const providerData = initialProviderData;
  const popularMoviesHorror = initialPopularMoviesHorror;
  const popularMoviesSciFi = initialPopularMoviesSciFi;
  const popularMoviesFamily = initialPopularMoviesFamily;
  const topRatedMovies = initialTopRatedMovies;
  const popularMoviesDrama = initialPopularMoviesDrama;
  const popularMoviesSciFiDrama = initialPopularMoviesSciFiDrama;
  const popularMoviesComedy = initialPopularMoviesComedy;

  const [popularMovies, setPopularMovies] = useState(initialPopularMovies);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState("");
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPopularMovies(initialPopularMovies);
    setPage(1);
  }, [initialPopularMovies]);

  const loadingRef = useRef(false);

  const loadMoreMovies = useCallback(async () => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      const nextPage = page + 1;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL_API}/movies/popular?page=${nextPage}`,
      );

      if (!res.ok) throw new Error("Falha ao carregar mais filmes");

      const data: Movie[] = await res.json();

      if (data.length) {
        setPopularMovies((prevMovies) => {
          const seen = new Set(prevMovies.map((movie) => movie.id));
          return [
            ...prevMovies,
            ...data.filter((movie) => !seen.has(movie.id)),
          ];
        });
        setPage(nextPage);
      }
    } catch (err) {
      setLoadMoreError("Ocorreu um erro ao carregar mais filmes.");
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMoreMovies();
      },
      { rootMargin: "600px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMoreMovies]);

  if (error) {
    return (
      <>
        <Head>
          <title>GuysMovies - Erro</title>
        </Head>
        <Header />
        <div className="flex flex-col px-4 sm:px-6 md:px-8 lg:px-40 w-full mt-14">
          <h1 className="text-2xl font-bold text-center mt-24 text-white">
            {error}
          </h1>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>GuysMovies - Filmes</title>
      </Head>
      <Header />
      {!initialProviderData.length ? (
        <LoadingSpinner />
      ) : (
        <div className="flex flex-col px-4 md:px-8 lg:px-20 xl:px-40 w-full mt-14 overflow-x-hidden">
          <div className="flex items-center mb-4">
            <Image
              src="/icons/home/popular.png"
              alt="Ícone de uma estrela"
              className="mr-2 w-8 h-8"
              width={64}
              height={64}
            />
            <Title
              title="Filmes Populares Por Streamings"
              className="ml-2 text-left"
            />
          </div>
          <Carousel
            data={providerData || []}
            slidesToShow={3}
            slidesToScroll={1}
            renderItem={(providerData) => (
              <MoviesProvider
                providerData={providerData}
                key={providerData.provider.id}
              />
            )}
            responsive={[
              {
                breakpoint: 1024,
                settings: {
                  slidesToShow: 2,
                  slidesToScroll: 1,
                },
              },
              {
                breakpoint: 600,
                settings: {
                  slidesToShow: 1,
                  slidesToScroll: 1,
                  arrows: false,
                },
              },
            ]}
          />

          <div className="flex items-center mt-12 mb-4">
            <Image
              src="/icons/home/cinema.png"
              alt="Ícone de um cinema"
              className="mr-2 w-8 h-8"
              width={64}
              height={64}
            />
            <Title title="Filmes Populares" className="ml-2 text-left" />
          </div>
          <Carousel
            slidesToShow={6}
            infinite={true}
            data={popularMovies || []}
            renderItem={(movie) => <MovieCard key={movie.id} {...movie} />}
            responsive={[
              {
                breakpoint: 1280,
                settings: {
                  slidesToShow: 5,
                },
              },
              {
                breakpoint: 1024,
                settings: {
                  slidesToShow: 4,
                },
              },
              {
                breakpoint: 768,
                settings: {
                  slidesToShow: 3,
                  arrows: false,
                },
              },
              {
                breakpoint: 640,
                settings: {
                  slidesToShow: 2,
                  arrows: false,
                },
              },
            ]}
          />

          <div className="flex items-center mt-24 mb-4">
            <Image
              src="/icons/home/horror.png"
              alt="Ícone de Terror"
              className="mr-2 w-8 h-8"
              width={64}
              height={64}
            />
            <Title title="Terror E Suspense" className="ml-2 text-left" />
          </div>
          <Carousel
            slidesToShow={6}
            infinite={true}
            data={popularMoviesHorror || []}
            renderItem={(movie) => <MovieCard key={movie.id} {...movie} />}
            responsive={[
              {
                breakpoint: 1280,
                settings: {
                  slidesToShow: 5,
                },
              },
              {
                breakpoint: 1024,
                settings: {
                  slidesToShow: 4,
                },
              },
              {
                breakpoint: 768,
                settings: {
                  slidesToShow: 3,
                  arrows: false,
                },
              },
              {
                breakpoint: 640,
                settings: {
                  slidesToShow: 2,
                  arrows: false,
                },
              },
            ]}
          />

          <div className="flex items-center mt-24 mb-4">
            <Image
              src="/icons/home/scifi.png"
              alt="Ícone de tecnologia"
              className="mr-2 w-8 h-8"
              width={64}
              height={64}
            />
            <Title title="Ficção Científica" className="ml-2 text-left" />
          </div>
          <Carousel
            slidesToShow={6}
            infinite={true}
            data={popularMoviesSciFi || []}
            renderItem={(movie) => <MovieCard key={movie.id} {...movie} />}
            responsive={[
              {
                breakpoint: 1280,
                settings: {
                  slidesToShow: 5,
                },
              },
              {
                breakpoint: 1024,
                settings: {
                  slidesToShow: 4,
                },
              },
              {
                breakpoint: 768,
                settings: {
                  slidesToShow: 3,
                  arrows: false,
                },
              },
              {
                breakpoint: 640,
                settings: {
                  slidesToShow: 2,
                  arrows: false,
                },
              },
            ]}
          />

          <div className="flex items-center mt-24 mb-4">
            <Image
              src="/icons/home/like.png"
              alt="Ícone de um curtir"
              className="mr-2 w-8 h-8"
              width={64}
              height={64}
            />
            <Title title="Aclamados pela Crítica" className="ml-2 text-left" />
          </div>
          <Carousel
            slidesToShow={6}
            infinite={true}
            data={topRatedMovies || []}
            renderItem={(movie) => <MovieCard key={movie.id} {...movie} />}
            responsive={[
              {
                breakpoint: 1280,
                settings: {
                  slidesToShow: 5,
                },
              },
              {
                breakpoint: 1024,
                settings: {
                  slidesToShow: 4,
                },
              },
              {
                breakpoint: 768,
                settings: {
                  slidesToShow: 3,
                  arrows: false,
                },
              },
              {
                breakpoint: 640,
                settings: {
                  slidesToShow: 2,
                  arrows: false,
                },
              },
            ]}
          />

          <div className="flex items-center mt-24 mb-4">
            <Image
              src="/icons/home/family.png"
              alt="Ícone de uma família"
              className="mr-2 w-8 h-8"
              width={64}
              height={64}
            />
            <Title title="Família" className="ml-2 text-left" />
          </div>
          <Carousel
            slidesToShow={6}
            infinite={true}
            data={popularMoviesFamily || []}
            renderItem={(movie) => <MovieCard key={movie.id} {...movie} />}
            responsive={[
              {
                breakpoint: 1280,
                settings: {
                  slidesToShow: 5,
                },
              },
              {
                breakpoint: 1024,
                settings: {
                  slidesToShow: 4,
                },
              },
              {
                breakpoint: 768,
                settings: {
                  slidesToShow: 3,
                  arrows: false,
                },
              },
              {
                breakpoint: 640,
                settings: {
                  slidesToShow: 2,
                  arrows: false,
                },
              },
            ]}
          />

          <div className="flex items-center mt-24 mb-4">
            <Image
              src="/icons/home/drama.png"
              alt="Ícone de drama"
              className="mr-2 w-8 h-8"
              width={64}
              height={64}
            />
            <Title title="Drama" className="ml-2 text-left" />
          </div>
          <Carousel
            slidesToShow={6}
            infinite={true}
            data={popularMoviesDrama || []}
            renderItem={(movie) => <MovieCard key={movie.id} {...movie} />}
            responsive={[
              {
                breakpoint: 1280,
                settings: {
                  slidesToShow: 5,
                },
              },
              {
                breakpoint: 1024,
                settings: {
                  slidesToShow: 4,
                },
              },
              {
                breakpoint: 768,
                settings: {
                  slidesToShow: 3,
                  arrows: false,
                },
              },
              {
                breakpoint: 640,
                settings: {
                  slidesToShow: 2,
                  arrows: false,
                },
              },
            ]}
          />

          <div className="flex items-center mt-24 mb-4">
            <Image
              src="/icons/home/rocket.png"
              alt="Ícone de um foguete"
              className="mr-2 w-8 h-8"
              width={64}
              height={64}
            />
            <Title title="Sci-Fi Dramático" className="ml-2 text-left" />
          </div>
          <Carousel
            slidesToShow={6}
            infinite={true}
            data={popularMoviesSciFiDrama || []}
            renderItem={(movie) => <MovieCard key={movie.id} {...movie} />}
            responsive={[
              {
                breakpoint: 1280,
                settings: {
                  slidesToShow: 5,
                },
              },
              {
                breakpoint: 1024,
                settings: {
                  slidesToShow: 4,
                },
              },
              {
                breakpoint: 768,
                settings: {
                  slidesToShow: 3,
                  arrows: false,
                },
              },
              {
                breakpoint: 640,
                settings: {
                  slidesToShow: 2,
                  arrows: false,
                },
              },
            ]}
          />

          <div className="flex items-center mt-24 mb-4">
            <Image
              src="/icons/home/comedy.png"
              alt="Ícone de comédia"
              className="mr-2 w-8 h-8"
              width={64}
              height={64}
            />
            <Title title="Comédia" className="ml-2 text-left" />
          </div>
          <Carousel
            slidesToShow={6}
            infinite={true}
            data={popularMoviesComedy || []}
            renderItem={(movie) => <MovieCard key={movie.id} {...movie} />}
            responsive={[
              {
                breakpoint: 1280,
                settings: {
                  slidesToShow: 5,
                },
              },
              {
                breakpoint: 1024,
                settings: {
                  slidesToShow: 4,
                },
              },
              {
                breakpoint: 768,
                settings: {
                  slidesToShow: 3,
                  arrows: false,
                },
              },
              {
                breakpoint: 640,
                settings: {
                  slidesToShow: 2,
                  arrows: false,
                },
              },
            ]}
          />
          <div ref={sentinelRef} aria-hidden className="h-px w-full" />
          {loading && (
            <p className="py-8 text-center text-white/60">
              Carregando mais filmes...
            </p>
          )}
          {loadMoreError && (
            <p className="py-8 text-center text-red-300">{loadMoreError}</p>
          )}
        </div>
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

const pickMovieFields = (movie: any): Movie => ({
  id: movie.id,
  title: movie.title,
  poster_path: movie.poster_path,
  overview: truncateOverview(movie.overview),
  vote_average: movie.vote_average,
});

const pickMovies = (movies: any): Movie[] =>
  Array.isArray(movies) ? movies.map(pickMovieFields) : [];

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
        initialPopularMovies: pickMovies(popularMovies),
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
