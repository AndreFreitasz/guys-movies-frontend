import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Slider, { Settings } from "react-slick";
import { motion } from "framer-motion";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

type SkeletonVariant = "poster" | "panel";

interface ResponsiveEntry {
  breakpoint: number;
  settings: Partial<Settings>;
}

interface CarouselProps<T> {
  data: Array<T & { id?: number | string }>;
  renderItem: (item: T, index: number) => React.ReactNode;
  settings?: Partial<Settings>;
  slidesToShow: number;
  slidesToScroll?: number;
  infinite?: boolean;
  className?: string;
  responsive?: ResponsiveEntry[];
  skeletonVariant?: SkeletonVariant;
  header?: React.ReactNode;
}

const skeletonStyles: Record<SkeletonVariant, string> = {
  poster:
    "auto-cols-[45%] sm:auto-cols-[31%] md:auto-cols-[23%] lg:auto-cols-[19%] xl:auto-cols-[16%] 2xl:auto-cols-[13.5%]",
  panel:
    "auto-cols-[86%] md:auto-cols-[48%] xl:auto-cols-[32%] 2xl:auto-cols-[24%]",
};

const CarouselSkeleton = ({ variant }: { variant: SkeletonVariant }) => (
  <div
    aria-hidden
    className={`grid grid-flow-col gap-3 overflow-hidden ${skeletonStyles[variant]}`}
  >
    {Array.from({ length: 8 }).map((_, index) => (
      <div
        key={index}
        className={`skeleton rounded-2xl ${
          variant === "poster" ? "aspect-[2/3]" : "h-[26rem]"
        }`}
      />
    ))}
  </div>
);

const resolveVisibleSlides = (
  width: number,
  baseSlidesToShow: number,
  responsive: ResponsiveEntry[],
) => {
  const matched = responsive
    .filter((entry) => width <= entry.breakpoint)
    .sort((a, b) => a.breakpoint - b.breakpoint)[0];

  return Number(matched?.settings?.slidesToShow ?? baseSlidesToShow);
};

const CarouselComponent = <T,>({
  data = [],
  renderItem,
  settings,
  slidesToShow,
  infinite,
  className,
  responsive,
  slidesToScroll,
  skeletonVariant = "poster",
  header,
}: CarouselProps<T>) => {
  const sliderRef = useRef<Slider>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [visibleSlides, setVisibleSlides] = useState(slidesToShow);

  const activeResponsive = useMemo<ResponsiveEntry[]>(
    () =>
      responsive || [
        {
          breakpoint: 1700,
          settings: {
            slidesToShow: Math.min(slidesToShow, 5),
            slidesToScroll: Math.min(
              slidesToShow > 1 ? slidesToShow - 1 : 1,
              4,
            ),
          },
        },
        {
          breakpoint: 1300,
          settings: {
            slidesToShow: Math.min(slidesToShow, 4),
            slidesToScroll: Math.min(
              slidesToShow > 1 ? slidesToShow - 1 : 1,
              3,
            ),
          },
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: Math.min(slidesToShow, 3),
            slidesToScroll: 1,
          },
        },
        { breakpoint: 480, settings: { slidesToShow: 2, slidesToScroll: 1 } },
      ],
    [responsive, slidesToShow],
  );

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    const updateVisibleSlides = () =>
      setVisibleSlides(
        resolveVisibleSlides(window.innerWidth, slidesToShow, activeResponsive),
      );

    updateVisibleSlides();
    window.addEventListener("resize", updateVisibleSlides);
    return () => window.removeEventListener("resize", updateVisibleSlides);
  }, [activeResponsive, slidesToShow]);

  const goPrev = useCallback(() => sliderRef.current?.slickPrev(), []);
  const goNext = useCallback(() => sliderRef.current?.slickNext(), []);

  const total = data.length;
  const hasOverflow = total > visibleSlides;
  const isAtStart = !infinite && currentSlide === 0;
  const isAtEnd =
    !infinite && currentSlide >= Math.max(total - visibleSlides, 0);

  const controlClass =
    "flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/[0.06] text-white transition-all duration-300 ease-ios hover:border-white/25 hover:bg-white/[0.11] active:scale-90 disabled:pointer-events-none disabled:opacity-25";

  const controls = hasOverflow && (
    <div className="flex shrink-0 items-center gap-2">
      <button
        type="button"
        onClick={goPrev}
        aria-label="Anterior"
        disabled={isAtStart}
        className={controlClass}
      >
        <FaChevronLeft size={12} />
      </button>
      <button
        type="button"
        onClick={goNext}
        aria-label="Próximo"
        disabled={isAtEnd}
        className={controlClass}
      >
        <FaChevronRight size={12} />
      </button>
    </div>
  );

  const mergedSettings: Settings = {
    dots: false,
    arrows: false,
    infinite: infinite || false,
    speed: 600,
    cssEase: "cubic-bezier(0.32, 0.72, 0, 1)",
    slidesToShow,
    slidesToScroll: slidesToScroll || 1,
    swipeToSlide: true,
    touchThreshold: 8,
    lazyLoad: "ondemand",
    waitForAnimate: false,
    beforeChange: (_current: number, next: number) => setCurrentSlide(next),
    responsive: activeResponsive,
    ...settings,
  };

  if (!total) {
    return (
      <>
        {header && <div className="mb-4 px-1">{header}</div>}
        <div className="rounded-3xl border border-white/[0.07] bg-white/[0.02] px-6 py-14 text-center">
          <p className="text-sm font-semibold text-white/45">
            Nenhum título encontrado por aqui. Tente novamente mais tarde.
          </p>
        </div>
      </>
    );
  }

  if (!isMounted) {
    return (
      <>
        {header && <div className="mb-4 px-1">{header}</div>}
        <CarouselSkeleton variant={skeletonVariant} />
      </>
    );
  }

  const thumbWidth = Math.min((visibleSlides / total) * 100, 100);
  const thumbOffset = Math.min((currentSlide / total) * 100, 100 - thumbWidth);

  return (
    <div>
      <div className="mb-4 flex items-end justify-between gap-4 px-1">
        <div className="min-w-0 flex-1">{header}</div>
        {controls}
      </div>

      <div className="relative">
        <Slider ref={sliderRef} {...mergedSettings}>
          {data.map((item, index) => (
            <div
              key={item?.id ?? index}
              className={`px-1.5 ${className ?? ""}`}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </Slider>

        {hasOverflow && (
          <>
            <div
              aria-hidden
              className={`pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#05050c] to-transparent transition-opacity duration-500 sm:w-14 ${
                isAtStart ? "opacity-0" : "opacity-100"
              }`}
            />
            <div
              aria-hidden
              className={`pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#05050c] to-transparent transition-opacity duration-500 sm:w-14 ${
                isAtEnd ? "opacity-0" : "opacity-100"
              }`}
            />
          </>
        )}
      </div>

      {hasOverflow && (
        <div className="mt-4 flex items-center gap-3 px-1">
          <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/[0.07]">
            <motion.span
              className="block h-full rounded-full bg-white/60"
              animate={{
                width: `${thumbWidth}%`,
                x: `${(thumbOffset / thumbWidth) * 100}%`,
              }}
              transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            />
          </div>
          <span className="shrink-0 text-[0.65rem] font-bold tabular-nums text-white/30">
            {Math.min(currentSlide + 1, total)}
            <span className="text-white/15">/{total}</span>
          </span>
        </div>
      )}
    </div>
  );
};

const Carousel = React.memo(CarouselComponent) as typeof CarouselComponent;

export default Carousel;
