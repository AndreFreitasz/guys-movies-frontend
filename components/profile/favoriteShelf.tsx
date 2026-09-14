import React from "react";
import { motion } from "framer-motion";
import { FaPlus } from "react-icons/fa";
import Link from "next/link";
import { Favorite, resolvePosterUrl } from "../../interfaces/profile/types";

interface FavoriteShelfProps {
  favorites: Favorite[];
  isSelf: boolean;
  onEdit: () => void;
}

const SLOT_COUNT = 3;

const FavoriteShelf: React.FC<FavoriteShelfProps> = ({
  favorites,
  isSelf,
  onEdit,
}) => {
  if (favorites.length === 0 && !isSelf) return null;

  const slots = Array.from({ length: SLOT_COUNT }, (_, index) =>
    favorites.find((favorite) => favorite.position === index + 1),
  );

  return (
    <section className="relative mt-10">
      <h2 className="mb-4 text-lg font-black tracking-tight text-white">
        Favoritos
      </h2>
      <div className="grid grid-cols-3 gap-3 sm:gap-5">
        {slots.map((favorite, index) => {
          if (!favorite) {
            if (!isSelf) return <div key={index} />;

            return (
              <button
                key={index}
                type="button"
                onClick={onEdit}
                className="flex aspect-[2/3] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.02] text-white/40 transition-colors duration-300 hover:border-indigo-400/50 hover:text-white/70"
              >
                <FaPlus size={18} />
                <span className="px-2 text-center text-xs font-semibold">
                  Escolher favorito
                </span>
              </button>
            );
          }

          const href =
            favorite.type === "movie"
              ? `/movie/${favorite.idTmdb}`
              : `/serie/${favorite.idTmdb}`;

          return (
            <motion.div
              key={`${favorite.type}:${favorite.idTmdb}`}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.06,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group relative"
            >
              <Link href={href} className="block">
                <span className="pointer-events-none absolute -left-1 -top-3 z-10 text-5xl font-black leading-none text-white/15 sm:text-6xl">
                  {index + 1}
                </span>
                <span className="block overflow-hidden rounded-2xl border border-white/10">
                  <img
                    src={resolvePosterUrl(favorite.posterPath)}
                    alt={favorite.title}
                    loading="lazy"
                    className="aspect-[2/3] w-full object-cover transition-transform duration-500 ease-ios group-hover:scale-105"
                  />
                </span>
                <span className="pointer-events-none absolute inset-x-0 bottom-0 rounded-b-2xl bg-gradient-to-t from-black/90 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="block truncate text-xs font-bold text-white">
                    {favorite.title}
                  </span>
                  {favorite.year !== null && (
                    <span className="block text-[0.65rem] text-white/60">
                      {favorite.year}
                    </span>
                  )}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default FavoriteShelf;
