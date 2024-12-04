import React from "react";
import CircularVoteAverage from "./circularVoteAverage";

interface MovieCardProps {
  id: number;
  title: string;
  poster_path: string;
  overview: string;
  vote_average: number;
}

const MovieCard: React.FC<MovieCardProps> = ({
  id,
  title,
  poster_path,
  overview,
  vote_average,
}) => {
  const getImageUrl = (path: string) => {
    return `https://image.tmdb.org/t/p/w500${path}`;
  };

  return (
    <>
      <div className="relative group cursor-pointer" key={id}>
        <img
          src={getImageUrl(poster_path)}
          alt={title}
          className="w-80 h-50 rounded-lg transition-opacity duration-300 group-hover:opacity-50"
        />
        <div className="absolute inset-0 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-defaultBackground via-transparent to-transparent rounded-lg p-4 w-80 h-50">
          <h3 className="text-white text-2xl font-bold mb-2">{title}</h3>
          <p className="text-white text-sm mb-2 line-clamp-5 font-semibold">
            {overview}
          </p>
          <div className="w-16 h-16 mt-5">
            <CircularVoteAverage vote_average={vote_average} />
          </div>
        </div>
      </div>
      <h3 className="text-white font-bold text-2xl my-5">{title}</h3>
    </>
  );
};

export default MovieCard;
