import React from "react";
import CircularVoteAverage from "./circularVoteAverage";

interface SerieCardProps {
  id: number;
  name: string;
  poster_path: string;
  overview: string;
  vote_average: number;
}

const SerieCard: React.FC<SerieCardProps> = ({
  id,
  name,
  poster_path,
  overview,
  vote_average,
}) => {
  const getImageUrl = (path: string) => {
    return `https://image.tmdb.org/t/p/w500${path}`;
  };

  return (
    <>
      <div className="relative group" key={id}>
        <img
          src={getImageUrl(poster_path)}
          alt={name}
          className="w-60 h-30 rounded-lg transition-opacity duration-300 group-hover:opacity-50"
        />
        <div className="absolute inset-0 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-defaultBackground via-transparent to-transparent rounded-lg p-4 w-60 h-30 cursor-pointer">
          <h3 className="text-white text-xl font-bold mb-2 text-center">
            {name}
          </h3>
          <p className="text-white text-sm mb-2 line-clamp-5 font-semibold text-center">
            {overview}
          </p>
          <div className="w-12 h-12 mt-2">
            <CircularVoteAverage vote_average={vote_average} />
          </div>
        </div>
      </div>
    </>
  );
};

export default SerieCard;
