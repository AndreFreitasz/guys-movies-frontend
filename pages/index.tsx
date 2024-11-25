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

interface Movie {
  id: number;
  title: string;
  poster_path: string;
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
  const { data, isLoading, error } = useFetch<ProviderData[]>(
    `${process.env.NEXT_PUBLIC_URL_API}/movies/popularByProviders`,
    "Ocorreu um erro ao buscar os filmes populares",
  );

  return (
    <>
      <Header />
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="flex justify-center mt-20 h-screen">
          <p className="text-white font-bold text-xl">{error}</p>
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
            data={data || []}
            renderItem={(providerData) => (
              <MoviesProvider
                providerData={providerData}
                key={providerData.provider.id}
              />
            )}
          />
        </div>
      )}
    </>
  );
};

export default Home;
