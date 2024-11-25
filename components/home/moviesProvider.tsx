// components/_ui/MoviesProvider.tsx
import React from "react";

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

interface MoviesProviderProps {
  providerData: ProviderData;
}

const MoviesProvider: React.FC<MoviesProviderProps> = ({ providerData }) => {
  return (
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
};

export default MoviesProvider;
