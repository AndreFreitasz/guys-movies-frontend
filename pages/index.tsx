// pages/index.tsx
import React, { useEffect, useState } from "react";
import Header from "../components/_ui/header";
import Title from "../components/_ui/title";
import Image from "next/image";
import Carousel from "../components/_ui/carousel";
import { toast } from "react-toastify";

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

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_URL_API}/movies/popularByProviders`,
        );
        const jsonData = await response.json();
        setData(jsonData);
      } catch (error: any) {
        const errorMessage = "Ocorreu um erro ao buscar os filmes populares";
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const renderProvider = (providerData: ProviderData, index: number) => (
    <div
      key={providerData.provider.id}
      className="mb-8 p-3 bg-defaultBackgroundSecond bg-opacity-30 rounded-3xl flex flex-col mr-4"
    >
      <div className="flex items-center">
        <img
          src={providerData.provider.logoUrl}
          alt={providerData.provider.name}
          className="w-12 h-12 mr-2 rounded-lg"
        />
        <h2 className="text-xl font-bold text-white">
          {providerData.provider.name}
        </h2>
      </div>
      <div className="border-b-4 my-4 rounded-lg border-defaultBackgroundSecond"></div>
      <ul className="max-h-96 overflow-x-hidden overflow-y-auto">
        {providerData.movies.slice(0, 10).map((movie, index) => (
          <li
            key={movie.id}
            className="text-white mb-2 px-4 flex items-center transform transition-transform duration-300 hover:scale-105 hover:z-10"
          >
            <div className="flex flex-col items-end">
              <span
                className={`text-white mr-4 opacity-10 font-bold ${
                  index + 1 === 10 ? "text-8xl" : "text-9xl"
                }`}
              >
                {index + 1}
              </span>
            </div>
            <div className="flex items-center">
              <img
                src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                alt={movie.title}
                className="w-20 h-30 mr-2 rounded-lg"
              />
              <span
                className="truncate max-w-[10rem] hover:overflow-visible text-xl font-semibold hover:whitespace-normal hover:bg-defaultBackgroundSecond hover:p-2 hover:rounded-lg"
                title={movie.title}
              >
                {movie.title}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <>
      <Header />
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <svg
            className="animate-spin h-10 w-10 text-indigo-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            ></path>
          </svg>
        </div>
      ) : (
        <div className="flex flex-col px-40 w-full mt-14">
          <div className="flex items-center mb-4">
            <Image
              src="/icons/popular.png"
              alt="Icon"
              className="mr-2 w-8 h-8"
              width={32}
              height={32}
            />
            <Title title="Filmes Populares" className="ml-2" />
          </div>
          <Carousel data={data} renderItem={renderProvider} />
        </div>
      )}
    </>
  );
};

export default Home;
