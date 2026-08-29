import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  overview: string;
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

const RANK_LIMIT = 5;

const MoviesProvider: React.FC<MoviesProviderProps> = ({ providerData }) => {
  return (
    <motion.section
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
      className="group/provider relative h-full overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.025] p-4 backdrop-blur-xl transition-colors duration-500 hover:border-white/[0.14] sm:p-5"
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl transition-opacity duration-500 group-hover/provider:bg-indigo-500/20" />

      <header className="relative flex items-center gap-3">
        <img
          src={providerData.provider.logoUrl}
          alt={providerData.provider.name}
          width={44}
          height={44}
          loading="lazy"
          decoding="async"
          className="h-11 w-11 rounded-xl border border-white/10 object-cover"
        />
        <div className="min-w-0">
          <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-indigo-300">
            Top {RANK_LIMIT}
          </p>
          <h3 className="truncate text-base font-black text-white">
            {providerData.provider.name}
          </h3>
        </div>
      </header>

      <div className="relative mt-4 h-px w-full bg-gradient-to-r from-white/15 via-white/5 to-transparent" />

      <ul className="relative mt-2 space-y-0.5">
        {providerData.movies.slice(0, RANK_LIMIT).map((movie, index) => (
          <li key={movie.id}>
            <Link
              href={`/movie/${movie.id}`}
              prefetch={false}
              className="group/row flex items-center gap-2 rounded-2xl p-2 transition-all duration-300 ease-ios hover:bg-white/[0.06] active:scale-[0.98]"
            >
              <span
                className="w-7 shrink-0 text-center text-3xl font-black leading-none text-transparent transition-all duration-300 sm:w-9 sm:text-4xl"
                style={{
                  WebkitTextStroke: "1.5px rgba(255,255,255,0.28)",
                }}
              >
                {index + 1}
              </span>

              <img
                src={`https://image.tmdb.org/t/p/w154${movie.poster_path}`}
                alt={movie.title}
                width={48}
                height={72}
                loading="lazy"
                decoding="async"
                className="h-[4.5rem] w-12 shrink-0 rounded-lg border border-white/10 object-cover transition-transform duration-500 ease-ios group-hover/row:scale-105"
              />

              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-bold leading-snug text-white transition-colors duration-300 group-hover/row:text-indigo-200">
                  {movie.title}
                </p>
                <div className="grid grid-rows-[0fr] transition-all duration-500 ease-ios group-hover/row:grid-rows-[1fr]">
                  <span className="overflow-hidden">
                    <span className="mt-1 block line-clamp-2 text-[0.7rem] leading-relaxed text-white/45">
                      {movie.overview}
                    </span>
                  </span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </motion.section>
  );
};

export default React.memo(MoviesProvider);
