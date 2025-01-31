import React, { useState, useEffect } from "react";
import Header from "../components/_ui/header";
import Title from "../components/_ui/title";
import Image from "next/image";
import Carousel from "../components/_ui/carousel";
import MoviesProvider from "../components/home/moviesProvider";
import MovieCard from "../components/home/movieCard";
import Footer from "../components/_ui/footer";
import { GetServerSideProps } from "next";

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
  const [providerData, setProviderData] = useState(initialProviderData);
  const [popularMovies, setPopularMovies] = useState(initialPopularMovies);
  const [popularMoviesHorror, setPopularMoviesHorror] = useState(
    initialPopularMoviesHorror,
  );
  const [popularMoviesSciFi, setPopularMoviesSciFi] = useState(
    initialPopularMoviesSciFi,
  );
  const [popularMoviesFamily, setPopularMoviesFamily] = useState(
    initialPopularMoviesFamily,
  );
  const [topRatedMovies, setTopRatedMovies] = useState(initialTopRatedMovies);
  const [popularMoviesDrama, setPopularMoviesDrama] = useState(
    initialPopularMoviesDrama,
  );
  const [popularMoviesSciFiDrama, setPopularMoviesSciFiDrama] = useState(
    initialPopularMoviesSciFiDrama,
  );
  const [popularMoviesComedy, setPopularMoviesComedy] = useState(
    initialPopularMoviesComedy,
  );
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (error) {
      setErrorMessage(error);
      setShowError(true);
    }
  }, [error]);

  useEffect(() => {
    const handleScroll = async () => {
      if (
        window.innerHeight + document.documentElement.scrollTop !==
          document.documentElement.offsetHeight ||
        loading
      ) {
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_URL_API}/movies/popular?page=${page + 1}`,
        );
        const data = await res.json();
        setPopularMovies((prevMovies) => [...prevMovies, ...data]);
        setPage((prevPage) => prevPage + 1);
      } catch (err) {
        setErrorMessage("Ocorreu um erro ao carregar mais filmes.");
        setShowError(true);
      } finally {
        setLoading(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, page]);

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
          renderItem={(providerData) => (
            <MoviesProvider
              providerData={providerData}
              key={providerData.provider.id}
            />
          )}
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
          className="ml-16"
          renderItem={(movie) => <MovieCard key={movie.id} {...movie} />}
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
          <Title title="Ficção Científica" className="ml-2 text-left" />
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
          <Title title="Aclamados pela Crítica" className="ml-2 text-left" />
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
          <Title title="Família" className="ml-2 text-left" />
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
      <Footer />
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
        initialProviderData: providerData,
        initialPopularMovies: popularMovies,
        initialPopularMoviesHorror: popularMoviesHorror,
        initialPopularMoviesSciFi: popularMoviesSciFi,
        initialPopularMoviesFamily: popularMoviesFamily,
        initialTopRatedMovies: topRatedMovies,
        initialPopularMoviesDrama: popularMoviesDrama,
        initialPopularMoviesSciFiDrama: popularMoviesSciFiDrama,
        initialPopularMoviesComedy: popularMoviesComedy,
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
