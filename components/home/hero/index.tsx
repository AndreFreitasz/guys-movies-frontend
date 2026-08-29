import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlay, FaStar, FaChevronRight } from "react-icons/fa";

export interface HeroMovie {
  id: number;
  title: string;
  overview: string;
  vote_average: number;
  backdrop_path?: string | null;
  poster_path?: string | null;
  release_date?: string | null;
}

interface HeroProps {
  movies: HeroMovie[];
}

const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w1280";
const POSTER_BASE_URL = "https://image.tmdb.org/t/p/w185";
const ROTATE_MS = 8000;
const MAX_SLIDES = 5;

const Hero: React.FC<HeroProps> = ({ movies }) => {
  const slides = useMemo(
    () => movies.filter((movie) => movie.backdrop_path).slice(0, MAX_SLIDES),
    [movies],
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goTo = useCallback(
    (index: number) =>
      setActiveIndex(((index % slides.length) + slides.length) % slides.length),
    [slides.length],
  );

  useEffect(() => {
    if (slides.length < 2 || isPaused) return;

    const timeoutId = setTimeout(
      () => setActiveIndex((previous) => (previous + 1) % slides.length),
      ROTATE_MS,
    );

    return () => clearTimeout(timeoutId);
  }, [activeIndex, isPaused, slides.length]);

  if (!slides.length) return null;

  const active = slides[activeIndex];

  return (
    <section
      className="relative -mt-[4.25rem] mb-4 h-[78vh] min-h-[520px] w-full overflow-hidden lg:-mt-20 lg:h-[86vh] lg:min-h-[620px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="sync">
        <motion.div
          key={active.id}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 1 },
            scale: { duration: 9, ease: "linear" },
          }}
          className="absolute inset-0"
        >
          <img
            src={`${BACKDROP_BASE_URL}${active.backdrop_path}`}
            alt={active.title}
            className="h-full w-full object-cover object-center"
            decoding="async"
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-[#05050c] via-[#05050c]/55 to-[#05050c]/85" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#05050c] via-[#05050c]/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#05050c] to-transparent" />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1600px] flex-col justify-end px-4 pb-10 pt-24 sm:px-6 lg:px-10 lg:pb-16 xl:px-14">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
            className="max-w-2xl"
          >
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="rounded-full border border-indigo-400/30 bg-indigo-500/15 px-3 py-1 text-[0.6rem] font-black uppercase tracking-[0.2em] text-indigo-200 backdrop-blur-md">
                Em alta
              </span>
              {active.vote_average > 0 && (
                <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-3 py-1 backdrop-blur-md">
                  <FaStar className="text-amber-400" size={10} />
                  <span className="text-[0.7rem] font-black text-white">
                    {active.vote_average.toFixed(1)}
                  </span>
                </span>
              )}
              {active.release_date && (
                <span className="text-[0.7rem] font-bold text-white/45">
                  {active.release_date}
                </span>
              )}
            </div>

            <h1 className="mt-4 text-3xl font-black leading-[1.05] tracking-tight text-white drop-shadow-2xl sm:text-5xl lg:text-6xl xl:text-7xl">
              {active.title}
            </h1>

            <p className="mt-4 line-clamp-3 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base">
              {active.overview}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href={`/movie/${active.id}`}
                className="group flex h-12 items-center gap-2.5 rounded-full px-7 text-sm font-black tracking-tight bg-white text-[#05050c] transition-all duration-300 ease-ios hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-[0_10px_30px_-12px_rgba(255,255,255,0.5)] active:translate-y-0 active:scale-[0.96]"
              >
                <FaPlay size={12} />
                Ver detalhes
              </Link>
              <a
                href="#catalogo"
                className="group flex h-12 items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-6 text-sm font-bold tracking-tight text-white backdrop-blur-xl transition-all duration-300 ease-ios hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.11] active:translate-y-0 active:scale-[0.96]"
              >
                Explorar catálogo
                <FaChevronRight
                  size={11}
                  className="transition-transform duration-300 ease-ios group-hover:translate-x-0.5"
                />
              </a>
            </div>
          </motion.div>
        </AnimatePresence>

        {slides.length > 1 && (
          <div className="mt-8 flex items-center gap-2.5 lg:mt-10">
            {slides.map((slide, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={`Ver ${slide.title}`}
                  aria-current={isActive}
                  className="group relative h-1 overflow-hidden rounded-full bg-white/15 transition-all duration-500 ease-ios"
                  style={{ width: isActive ? 56 : 20 }}
                >
                  {isActive && (
                    <motion.span
                      key={`${slide.id}-progress`}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: isPaused ? 0.35 : 1 }}
                      transition={{
                        duration: isPaused ? 0.3 : ROTATE_MS / 1000,
                        ease: "linear",
                      }}
                      className="absolute inset-0 origin-left rounded-full bg-white"
                    />
                  )}
                </button>
              );
            })}

            <div className="ml-3 hidden items-center gap-2 sm:flex">
              {slides.map((slide, index) => (
                <button
                  key={`thumb-${slide.id}`}
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={slide.title}
                  className={`h-12 w-8 overflow-hidden rounded-md border transition-all duration-500 ease-ios hover:scale-110 ${
                    index === activeIndex
                      ? "border-white/70 opacity-100"
                      : "border-white/10 opacity-40 hover:opacity-80"
                  }`}
                >
                  {slide.poster_path && (
                    <img
                      src={`${POSTER_BASE_URL}${slide.poster_path}`}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default React.memo(Hero);
