import React, { useState } from "react";
import Link from "next/link";
import { Serie } from "../../../interfaces/series/types";
import Image from "next/image";
import CircularVoteAverage from "./circularVoteAverage";

const SerieCard = ({
  id,
  name,
  poster_path,
  overview,
  vote_average,
}: Serie) => {
  const [isHovered, setIsHovered] = useState(false);
  const imageUrl = poster_path
    ? `https://image.tmdb.org/t/p/w500${poster_path}`
    : "/path/to/default/image.jpg";

  return (
    <Link href={`/serie/${id}`} passHref>
      <div
        className="relative p-2 cursor-pointer transform transition-transform duration-300 hover:scale-105"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Image
          src={imageUrl}
          alt={`Poster de ${name}`}
          width={500}
          height={750}
          className="rounded-lg shadow-lg"
          priority
        />
        {isHovered && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col justify-center items-center p-4 rounded-lg">
            <h3 className="text-white text-lg font-bold text-center">{name}</h3>
            <p className="text-white text-sm mt-2 text-center">
              {overview?.substring(0, 100)}...
            </p>
            <div className="mt-2">
              <CircularVoteAverage vote_average={vote_average || 0} />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
};

export default SerieCard;
