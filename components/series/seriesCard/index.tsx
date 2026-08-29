import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaStar, FaPlay } from "react-icons/fa";
import { Serie } from "../../../interfaces/series/types";

const POSTER_BASE_URL = "https://image.tmdb.org/t/p/w342";
const FALLBACK_POSTER = "/icons/home/cinema.png";

const getScoreTone = (vote: number) => {
  if (vote >= 7) return "text-emerald-300";
  if (vote >= 5) return "text-amber-300";
  return "text-rose-300";
};

const SerieCard = ({
  id,
  name,
  poster_path,
  overview,
  vote_average,
}: Serie) => {
  const imageUrl = poster_path
    ? `${POSTER_BASE_URL}${poster_path}`
    : FALLBACK_POSTER;
  const score = vote_average || 0;

  return (
    <Link href={`/serie/${id}`} prefetch={false} className="block">
      <motion.article
        whileHover={{ y: -8, scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        className="group relative aspect-[2/3] w-full overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] shadow-lift"
      >
        <img
          src={imageUrl}
          alt={`Pôster de ${name}`}
          width={342}
          height={513}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 ease-ios group-hover:scale-110"
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />

        {score > 0 && (
          <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full border border-white/10 bg-black/60 px-2 py-1 backdrop-blur-md">
            <FaStar className="text-amber-400" size={9} />
            <span
              className={`text-[0.65rem] font-black ${getScoreTone(score)}`}
            >
              {score.toFixed(1)}
            </span>
          </span>
        )}

        <div className="absolute inset-x-0 bottom-0 p-3">
          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-white drop-shadow-lg">
            {name}
          </h3>
          <div className="grid grid-rows-[0fr] transition-all duration-500 ease-ios group-hover:grid-rows-[1fr]">
            <div className="overflow-hidden">
              <p className="mt-2 line-clamp-3 text-[0.7rem] leading-relaxed text-white/60">
                {overview}
              </p>
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[0.65rem] font-black uppercase tracking-wide text-black">
                <FaPlay size={8} />
                Ver detalhes
              </span>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-0 ring-fuchsia-400/0 transition-all duration-500 group-hover:ring-2 group-hover:ring-fuchsia-400/50" />
      </motion.article>
    </Link>
  );
};

export default React.memo(SerieCard);
