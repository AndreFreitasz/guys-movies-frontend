import React, { useEffect, useState } from "react";
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

const ProvidersList = () => {
  const [data, setData] = useState<ProviderData[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(
          "https://guys-movies-3146ae7558de.herokuapp.com/movies/popularByProviders",
        );
        const jsonData = await response.json();
        setData(jsonData);
      } catch (error: any) {
        const errorMessage = "Ocorreu um erro ao buscar os filmes populares";
        toast.error(errorMessage);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="min-w-64 mr-4">
      {data.map(({ provider, movies }) => (
        <div
          key={provider.id}
          className="mb-8 p-3 bg-defaultBackgroundSecond bg-opacity-30 rounded-3xl"
        >
          <div className="flex items-center">
            <img
              src={provider.logoUrl}
              alt={provider.name}
              className="w-12 h-12 mr-2 rounded-lg"
            />
            <h2 className="text-xl font-bold text-white">{provider.name}</h2>
          </div>
          <div className="border-b-4 my-4 rounded-lg border-defaultBackgroundSecond"></div>
          <ul className="max-h-96 overflow-x-hidden overflow-y-auto">
            {movies.slice(0, 10).map((movie, index) => (
              <li
                key={movie.id}
                className="text-white mb-2 px-4 flex items-center transform transition-transform duration-300 hover:scale-105 hover:z-10"
              >
                <div className="flex flex-col items-end">
                  <span className="text-white mr-4 opacity-10 text-9xl font-bold">
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
                    className="truncate max-w-[15rem] hover:overflow-visible text-xl font-semibold hover:whitespace-normal hover:bg-defaultBackgroundSecond hover:p-2 hover:rounded-lg"
                    title={movie.title}
                  >
                    {movie.title}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default ProvidersList;
