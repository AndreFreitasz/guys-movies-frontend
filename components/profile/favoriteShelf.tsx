import React from "react";
import { motion } from "framer-motion";
import { FaPlus } from "react-icons/fa";
import Link from "next/link";
import SectionHeader from "./sectionHeader";
import {
  Favorite,
  FavoriteType,
  favoritesOfType,
  resolvePosterUrl,
} from "../../interfaces/profile/types";

interface FavoriteShelfProps {
  favorites: Favorite[];
  isSelf: boolean;
  onEdit: () => void;
}

const SLOTS_PER_TYPE = 3;

const slotsFor = (favorites: Favorite[], type: FavoriteType) => {
  const owned = favoritesOfType(favorites, type);
  return Array.from(
    { length: SLOTS_PER_TYPE },
    (_, index) => owned[index] ?? null,
  );
};

const FavoriteShelf: React.FC<FavoriteShelfProps> = ({
  favorites,
  isSelf,
  onEdit,
}) => {
  if (favorites.length === 0 && !isSelf) return null;

  const cells = [
    ...slotsFor(favorites, "movie").map((favorite) => ({
      favorite,
      type: "movie" as const,
    })),
    ...slotsFor(favorites, "serie").map((favorite) => ({
      favorite,
      type: "serie" as const,
    })),
  ];

  return (
    <section className="relative mt-10">
      <SectionHeader
        title="Favoritos"
        aside={`${favorites.length} de ${SLOTS_PER_TYPE * 2}`}
      />

      <div className="grid grid-cols-3 gap-3 sm:gap-5">
        {cells.map((cell, index) => {
          const favorite = cell.favorite;

          if (!favorite) {
            if (!isSelf) return <div key={`empty-${index}`} />;

            return (
              <button
                key={`empty-${index}`}
                type="button"
                onClick={onEdit}
                className="flex aspect-[2/3] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.02] text-white/40 transition-colors duration-300 hover:border-brand-400/50 hover:text-white/70"
              >
                <FaPlus size={18} />
                <span className="px-2 text-center text-xs font-semibold">
                  {cell.type === "movie" ? "Escolher filme" : "Escolher série"}
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
                delay: index * 0.05,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group"
            >
              <Link href={href} className="block">
                <span className="block rounded-[1.15rem] bg-gradient-to-br from-brand-400/70 via-white/10 to-brand-500/40 p-px shadow-lift transition-transform duration-500 ease-ios group-hover:-translate-y-1.5">
                  <span className="block overflow-hidden rounded-[1.1rem]">
                    <img
                      src={resolvePosterUrl(favorite.posterPath)}
                      alt={favorite.title}
                      loading="lazy"
                      className="aspect-[2/3] w-full object-cover"
                    />
                  </span>
                </span>
                <span className="mt-2.5 block truncate text-xs font-bold text-white sm:text-sm">
                  {favorite.title}
                </span>
                <span className="block text-[0.65rem] font-semibold text-white/45">
                  {favorite.type === "movie" ? "Filme" : "Série"}
                  {favorite.year !== null && ` · ${favorite.year}`}
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
