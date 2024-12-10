// pages/index.tsx
import React, { useState, useEffect } from "react";
import Header from "../components/_ui/header";
import Title from "../components/_ui/title";
import Image from "next/image";
import Carousel from "../components/_ui/carousel";
import MoviesProvider from "../components/home/moviesProvider";
import MovieCard from "../components/home/movieCard";
import { GetServerSideProps } from "next";

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

interface HomeProps {
  providerData: ProviderData[];
  popularMovies: Movie[];
  popularMoviesHorror: Movie[];
  popularMoviesSciFi: Movie[];
  popularMoviesFamily: Movie[];
  topRatedMovies: Movie[];
  popularMoviesDrama: Movie[];
  popularMoviesSciFiDrama: Movie[];
  popularMoviesComedy: Movie[];
  error: string | null;
}

const Home: React.FC<HomeProps> = ({
  providerData,
  popularMovies,
  popularMoviesHorror,
  popularMoviesSciFi,
  popularMoviesFamily,
  topRatedMovies,
  popularMoviesDrama,
  popularMoviesSciFiDrama,
  popularMoviesComedy,
  error,
}) => {
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (error) {
      setErrorMessage(error);
      setShowError(true);
    }
  }, [error]);

  if (showError) {
    return (
      <>
        <Header />
        <div className="flex flex-col px-4 sm:px-6 md:px-8 lg:px-40 w-full mt-14">
          <h1 className="text-2xl font-bold text-center mt-24 text-white">
            {errorMessage}
          </h1>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="flex flex-col px-4 sm:px-6 md:px-8 lg:px-40 w-full mt-14">
        <div className="flex items-center mb-4">
          <Image
            src="/icons/popular.png"
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
          className="ml-16"
          renderItem={(movie) => <MovieCard key={movie.id} {...movie} />}
        />

        <div className="flex items-center mt-24 mb-4">
          <Image
            src="/icons/horror.png"
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
          className="ml-16"
          renderItem={(movie) => <MovieCard key={movie.id} {...movie} />}
        />

        <div className="flex items-center mt-24 mb-4">
          <Image
            src="/icons/home/scifi.png"
            alt="Ícone de tecnologia"
            className="mr-2 w-8 h-8"
            width={64}
            height={64}
          />
          <Title title="Ficção Cientí­fica" className="ml-2 text-left" />
        </div>
        <Carousel
          slidesToShow={6}
          infinite={true}
          data={popularMoviesSciFi || []}
          className="ml-16"
          renderItem={(movie) => <MovieCard key={movie.id} {...movie} />}
        />

        <div className="flex items-center mt-24 mb-4">
          <Image
            src="/icons/home/like.png"
            alt="Ícone de um curtir"
            className="mr-2 w-8 h-8"
            width={64}
            height={64}
          />
          <Title title="Aclamados pela Crí­tica" className="ml-2 text-left" />
        </div>
        <Carousel
          slidesToShow={6}
          infinite={true}
          data={topRatedMovies || []}
          className="ml-16"
          renderItem={(movie) => <MovieCard key={movie.id} {...movie} />}
        />

        <div className="flex items-center mt-24 mb-4">
          <Image
            src="/icons/home/family.png"
            alt="Ícone de uma família"
            className="mr-2 w-8 h-8"
            width={64}
            height={64}
          />
          <Title title="Famí­lia" className="ml-2 text-left" />
        </div>
        <Carousel
          slidesToShow={6}
          infinite={true}
          data={popularMoviesFamily || []}
          className="ml-16"
          renderItem={(movie) => <MovieCard key={movie.id} {...movie} />}
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
          className="ml-16"
          renderItem={(movie) => <MovieCard key={movie.id} {...movie} />}
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
          className="ml-16"
          renderItem={(movie) => <MovieCard key={movie.id} {...movie} />}
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
          className="ml-16"
          renderItem={(movie) => <MovieCard key={movie.id} {...movie} />}
        />
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
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

    return {
      props: {
        providerData,
        popularMovies,
        popularMoviesHorror,
        popularMoviesSciFi,
        popularMoviesFamily,
        topRatedMovies,
        popularMoviesDrama,
        popularMoviesSciFiDrama,
        popularMoviesComedy,
        error: null,
      },
    };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "An unknown error occurred";
    return {
      props: {
        providerData: [],
        popularMovies: [],
        popularMoviesHorror: [],
        popularMoviesSciFi: [],
        popularMoviesFamily: [],
        topRatedMovies: [],
        popularMoviesDrama: [],
        popularMoviesSciFiDrama: [],
        popularMoviesComedy: [],
        error: errorMessage,
      },
    };
  }
};

export default Home;
