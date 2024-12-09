// pages/index.tsx
import React, { useEffect } from "react";
import Header from "../components/_ui/header";
import Title from "../components/_ui/title";
import Image from "next/image";
import Carousel from "../components/_ui/carousel";
import LoadingSpinner from "../components/_ui/loadingSpinner";
import { toast } from "react-toastify";
import MoviesProvider from "../components/home/moviesProvider";
import useFetch from "../hooks/useFetch";
import MovieCard from "../components/home/movieCard";

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  banner_url: string;
  overview: string;
  vote_average: number;
}

interface Provider {
  id: number;
  logoUrl: string;
  name: string;
}

interface ProviderData {
  provider: Provider;
  movies: Movie[];
}

const Home = () => {
  const {
    data: providerData,
    isLoading: isLoadingProviders,
    error: errorProviders,
  } = useFetch<ProviderData[]>(
    `${process.env.NEXT_PUBLIC_URL_API}/movies/popularByProviders`,
    "Ocorreu um erro ao buscar os filmes populares por provedores",
  );

  const {
    data: popularMovies,
    isLoading: isLoadingMovies,
    error: errorMovies,
  } = useFetch<Movie[]>(
    `${process.env.NEXT_PUBLIC_URL_API}/movies/popular`,
    "Ocorreu um erro ao buscar os filmes populares",
  );

  const {
    data: popularMoviesHorror,
    isLoading: isLoadingMoviesHorror,
    error: errorMoviesHorror,
  } = useFetch<Movie[]>(
    `${process.env.NEXT_PUBLIC_URL_API}/movies/popularByGenres/27,9648`,
    "Ocorreu um erro ao buscar os filmes de terror",
  );

  const {
    data: popularMoviesSciFi,
    isLoading: isLoadingMoviesSciFi,
    error: errorMoviesSciFi,
  } = useFetch<Movie[]>(
    `${process.env.NEXT_PUBLIC_URL_API}/movies/popularByGenres/878`,
    "Ocorreu um erro ao buscar os filmes de ficção científica ",
  );

  const {
    data: popularMoviesFamily,
    isLoading: isLoadingMoviesFamily,
    error: errorMoviesFamily,
  } = useFetch<Movie[]>(
    `${process.env.NEXT_PUBLIC_URL_API}/movies/popularByGenres/10751`,
    "Ocorreu um erro ao buscar os filmes de família",
  );

  return (
    <>
      <Header />
      {isLoadingProviders ||
      isLoadingMovies ||
      isLoadingMoviesHorror ||
      isLoadingMoviesSciFi ||
      isLoadingMoviesFamily ? (
        <LoadingSpinner />
      ) : errorProviders ||
        errorMovies ||
        errorMoviesHorror ||
        errorMoviesSciFi ||
        errorMoviesFamily ? (
        <div className="flex justify-center mt-20 h-screen">
          <p className="text-white font-bold text-xl">
            {errorProviders || errorMovies}
          </p>
        </div>
      ) : (
        <div className="flex flex-col px-4 sm:px-6 md:px-8 lg:px-40 w-full mt-14">
          <div className="flex items-center mb-4">
            <Image
              src="/icons/popular.png"
              alt="Icon"
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
            renderItem={(providerData) => (
              <MoviesProvider
                providerData={providerData}
                key={providerData.provider.id}
              />
            )}
          />

          <div className="flex items-center mt-12 mb-4">
            <Image
              src="/icons/cinema.png"
              alt="Icon"
              className="mr-2 w-8 h-8"
              width={64}
              height={64}
            />
            <Title title="Filmes Populares" className="ml-2 text-left" />
          </div>
          <Carousel
            slidesToShow={7}
            infinite={true}
            data={popularMovies || []}
            className="ml-16"
            renderItem={(movie) => <MovieCard key={movie.id} {...movie} />}
          />

          <div className="flex items-center mt-24 mb-4">
            <Image
              src="/icons/horror.png"
              alt="Icon"
              className="mr-2 w-8 h-8"
              width={64}
              height={64}
            />
            <Title title="Terror E Suspense" className="ml-2 text-left" />
          </div>
          <Carousel
            slidesToShow={7}
            infinite={true}
            data={popularMoviesHorror || []}
            className="ml-16"
            renderItem={(movie) => <MovieCard key={movie.id} {...movie} />}
          />

          <div className="flex items-center mt-24 mb-4">
            <Image
              src="/icons/scifi.png"
              alt="Icon"
              className="mr-2 w-8 h-8"
              width={64}
              height={64}
            />
            <Title title="Ficção Científica" className="ml-2 text-left" />
          </div>
          <Carousel
            slidesToShow={7}
            infinite={true}
            data={popularMoviesSciFi || []}
            className="ml-16"
            renderItem={(movie) => <MovieCard key={movie.id} {...movie} />}
          />

          <div className="flex items-center mt-24 mb-4">
            <Image
              src="/icons/family.png"
              alt="Icon"
              className="mr-2 w-8 h-8"
              width={64}
              height={64}
            />
            <Title title="Família" className="ml-2 text-left" />
          </div>
          <Carousel
            slidesToShow={7}
            infinite={true}
            data={popularMoviesFamily || []}
            className="ml-16"
            renderItem={(movie) => <MovieCard key={movie.id} {...movie} />}
          />
        </div>
      )}
    </>
  );
};

export default Home;
