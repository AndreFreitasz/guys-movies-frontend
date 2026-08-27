import React from "react";
import CircularVoteAverage from "./circularVoteAverage";
import Link from "next/link";

interface MovieCardProps {
  id: number;
  title: string;
  poster_path: string;
  overview: string;
  vote_average: number;
}

const POSTER_BASE_URL = "https://image.tmdb.org/t/p/w342";
const FALLBACK_POSTER = "/icons/home/cinema.png";

const MovieCard: React.FC<MovieCardProps> = ({
  id,
  title,
  poster_path,
  overview,
  vote_average,
}) => {
  const posterUrl = poster_path
    ? `${POSTER_BASE_URL}${poster_path}`
    : FALLBACK_POSTER;

  return (
    <div className="relative group">
      <Link href={`/movie/${id}`} prefetch={false}>
        <img
          src={posterUrl}
          alt={title}
          width={240}
          height={360}
          loading="lazy"
          decoding="async"
          className="w-60 h-30 rounded-lg transition-opacity duration-300 group-hover:opacity-50"
        />
        <div className="absolute inset-0 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-defaultBackground via-transparent to-transparent rounded-lg p-4 w-60 h-30 cursor-pointer">
          <h3 className="text-white text-xl font-bold mb-2 text-center">
            {title}
          </h3>
          <p className="text-white text-sm mb-2 line-clamp-5 font-semibold text-center">
            {overview}
          </p>
          <div className="w-12 h-12 mt-2">
            <CircularVoteAverage vote_average={vote_average} />
          </div>
        </div>
      </Link>
    </div>
  );
};

export default React.memo(MovieCard);
