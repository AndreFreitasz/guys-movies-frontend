import React from "react";

interface MovieCardProps {
  id: number;
  title: string;
  poster_path: string;
}

const MovieCard: React.FC<MovieCardProps> = ({ id, title, poster_path }) => {
  const getImageUrl = (path: string) => {
    return `https://image.tmdb.org/t/p/w500${path}`;
  };

  return (
    <div key={id}>
      <img
        src={getImageUrl(poster_path)}
        alt={title}
        className="w-80 h-50 rounded-lg"
      />
      <span className="text-white text-xl font-bold block my-4" title={title}>
        {title}
      </span>
    </div>
  );
};

export default MovieCard;
