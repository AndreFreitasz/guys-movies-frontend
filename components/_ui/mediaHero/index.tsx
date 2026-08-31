import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaPlay, FaStar, FaChevronRight } from "react-icons/fa";

export interface HeroItem {
  id: number;
  href: string;
  title: string;
  overview: string;
  voteAverage: number;
  backdropPath: string | null;
  posterPath: string | null;
  date: string | null;
  badge: string;
}

interface MediaHeroProps {
  items: HeroItem[];
}

const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w1280";
const POSTER_BASE_URL = "https://image.tmdb.org/t/p/w780";
const THUMB_BASE_URL = "https://image.tmdb.org/t/p/w185";
const ROTATE_MS = 8000;
const MAX_SLIDES = 5;

const MediaHero: React.FC<MediaHeroProps> = ({ items }) => {
  const slides = useMemo(
    () =>
      items
        .filter((item) => item.backdropPath || item.posterPath)
        .slice(0, MAX_SLIDES),
    [items],
  );

  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goTo = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: track.clientWidth * index, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = Number(
            (entry.target as HTMLElement).dataset.slideIndex ?? 0,
          );
          setActiveIndex(index);
        });
      },
      { root: track, threshold: 0.6 },
    );

    Array.from(track.children).forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2 || isPaused) return;

    const timeoutId = setTimeout(
      () => goTo((activeIndex + 1) % slides.length),
      ROTATE_MS,
    );

    return () => clearTimeout(timeoutId);
  }, [activeIndex, goTo, isPaused, slides.length]);

  if (!slides.length) return null;

  const active = slides[activeIndex] ?? slides[0];

  return (
    <section
      className="relative -mt-[4.25rem] mb-4 h-[78vh] min-h-[520px] w-full overflow-hidden lg:-mt-20 lg:h-[86vh] lg:min-h-[620px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onPointerDown={() => setIsPaused(true)}
    >
      <div
        ref={trackRef}
        className="hide-scrollbar absolute inset-0 flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
      >
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            data-slide-index={index}
            className="relative h-full w-full shrink-0 snap-center"
          >
            <picture>
              {slide.backdropPath && (
                <source
                  media="(min-width: 768px)"
                  srcSet={`${BACKDROP_BASE_URL}${slide.backdropPath}`}
                />
              )}
              <img
                src={
                  slide.posterPath
                    ? `${POSTER_BASE_URL}${slide.posterPath}`
                    : `${BACKDROP_BASE_URL}${slide.backdropPath}`
                }
                alt={slide.title}
                fetchPriority={index === 0 ? "high" : "low"}
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
                className={`h-full w-full object-cover ${
                  slide.posterPath
                    ? "object-center"
                    : "object-[50%_30%] md:object-center"
                }`}
              />
            </picture>
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#05050c] via-[#05050c]/55 to-[#05050c]/85" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#05050c] via-[#05050c]/40 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#05050c] to-transparent" />

      <div className="pointer-events-none relative z-10 mx-auto flex h-full w-full max-w-[1600px] flex-col justify-end px-4 pb-10 pt-24 sm:px-6 lg:px-10 lg:pb-16 xl:px-14">
        <motion.div
          key={active.id}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          className="pointer-events-auto max-w-2xl"
        >
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-full border border-indigo-400/30 bg-indigo-500/15 px-3 py-1 text-[0.6rem] font-black uppercase tracking-[0.2em] text-indigo-200">
              {active.badge}
            </span>
            {active.voteAverage > 0 && (
              <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-3 py-1">
                <FaStar className="text-amber-400" size={10} />
                <span className="text-[0.7rem] font-black text-white">
                  {active.voteAverage.toFixed(1)}
                </span>
              </span>
            )}
            {active.date && (
              <span className="text-[0.7rem] font-bold text-white/45">
                {active.date}
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
              href={active.href}
              className="group flex h-12 items-center gap-2.5 rounded-full px-7 text-sm font-black tracking-tight bg-white text-[#05050c] transition-all duration-300 ease-ios hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-[0_10px_30px_-12px_rgba(255,255,255,0.5)] active:translate-y-0 active:scale-[0.96]"
            >
              <FaPlay size={12} />
              Ver detalhes
            </Link>
            <a
              href="#catalogo"
              className="group flex h-12 items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-6 text-sm font-bold tracking-tight text-white transition-all duration-300 ease-ios hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.11] active:translate-y-0 active:scale-[0.96]"
            >
              Explorar catálogo
              <FaChevronRight
                size={11}
                className="transition-transform duration-300 ease-ios group-hover:translate-x-0.5"
              />
            </a>
          </div>
        </motion.div>

        {slides.length > 1 && (
          <div className="pointer-events-auto mt-8 flex items-center gap-2.5 lg:mt-10">
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
                  {slide.posterPath && (
                    <img
                      src={`${THUMB_BASE_URL}${slide.posterPath}`}
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

export default React.memo(MediaHero);
