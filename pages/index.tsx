// pages/index.tsx
import React, { useEffect, useState } from "react";
import Header from "../components/_ui/header";
import Title from "../components/_ui/title";
import Image from "next/image";
import Carousel from "../components/_ui/carousel";
import LoadingSpinner from "../components/_ui/loadingSpinner";
import { toast } from "react-toastify";
import MoviesProvider from "../components/home/moviesProvider";

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
  const [data, setData] = useState<ProviderData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_URL_API}/movies/popularByProviders`,
        );
        if (!response.ok) {
          throw new Error("Erro ao buscar os filmes populares");
        }
        const jsonData = await response.json();
        setData(jsonData);
      } catch (error: any) {
        const errorMessage = "Ocorreu um erro ao buscar os filmes populares";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <>
      <Header />
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="flex justify-center mt-20 h-screen">
          <p className="text-white font-bold text-xl">
            Ocorreu um erro ao buscar os filmes
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
            <Title title="Filmes Populares" className="ml-2 text-left" />
          </div>
          <Carousel
            data={data}
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
