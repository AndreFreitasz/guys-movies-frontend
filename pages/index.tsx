// pages/index.tsx
import React, { useEffect, useState } from "react";
import Header from "../components/_ui/header";
import Title from "../components/_ui/title";
import Image from "next/image";
import Carousel from "../components/_ui/carousel";
import LoadingSpinner from "../components/_ui/loadingSpinner";
import { toast } from "react-toastify";
import MoviesProvider from "../components/home/moviesProvider";
import useFetch from "../hooks/useFetch";
import MovieCard from "../components/home/popularMovies";

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  banner_url: string;
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

  useEffect(() => {
    if (popularMovies) {
      console.log("Popular Movies:", popularMovies);
    }
  }, [popularMovies]);

  return (
    <>
      <Header />
      {isLoadingProviders || isLoadingMovies ? (
        <LoadingSpinner />
      ) : errorProviders || errorMovies ? (
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
              width={32}
              height={32}
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
          <div className="flex items-center my-12">
            <Image
              src="/icons/popular.png"
              alt="Icon"
              className="mr-2 w-8 h-8"
              width={32}
              height={32}
            />
            <Title title="Filmes Populares" className="ml-2 text-left" />
          </div>
          <Carousel
            slidesToShow={4}
            data={popularMovies || []}
            renderItem={(movie) => <MovieCard key={movie.id} {...movie} />}
          />
        </div>
      )}
    </>
  );
};

export default Home;
