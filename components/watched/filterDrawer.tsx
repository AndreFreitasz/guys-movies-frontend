import React, { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RatingRangeFilter } from "../../hooks/useWatchedFilters";
import FilterBar from "./filterBar";

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  rating: RatingRangeFilter;
  decade: number | null;
  directors: string[];
  providers: number[];
  decadeOptions: number[];
  directorOptions: string[];
  showDirectors: boolean;
  onRatingChange: (value: RatingRangeFilter) => void;
  onDecadeChange: (value: number | null) => void;
  onDirectorsChange: (value: string[]) => void;
  onProvidersChange: (value: number[]) => void;
  activeCount: number;
  onClearAll: () => void;
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  rating,
  decade,
  directors,
  providers,
  decadeOptions,
  directorOptions,
  showDirectors,
  onRatingChange,
  onDecadeChange,
  onDirectorsChange,
  onProvidersChange,
  activeCount,
  onClearAll,
}) => {
  const previousOverflowRef = useRef("");
  const isLockedRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    if (!isLockedRef.current) {
      previousOverflowRef.current = document.body.style.overflow;
      isLockedRef.current = true;
    }
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(
    () => () => {
      if (!isLockedRef.current) return;
      document.body.style.overflow = previousOverflowRef.current;
    },
    [],
  );

  const restoreScroll = () => {
    if (!isLockedRef.current) return;
    isLockedRef.current = false;
    document.body.style.overflow = previousOverflowRef.current;
  };

  return (
    <AnimatePresence onExitComplete={restoreScroll}>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 backdrop-blur-md" />

          <motion.div
            className="absolute inset-0 bg-black/70"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Filtros"
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.18 } }}
            transition={{ type: "spring", stiffness: 420, damping: 38 }}
            className="relative w-full max-w-lg"
          >
            <div className="max-h-[85vh] overflow-y-auto rounded-t-[2rem] border border-white/10 bg-[#0a0a16]/95 shadow-lift">
              <div className="sticky top-0 z-10 flex justify-center bg-gradient-to-b from-[#0a0a16] to-transparent pb-4 pt-3">
                <span className="h-1.5 w-12 rounded-full bg-white/25" />
              </div>

              <div className="px-6 pb-6">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-lg font-bold text-white">Filtros</h2>
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Fechar filtros"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 transition hover:bg-white/20 hover:text-white"
                  >
                    <svg viewBox="0 0 20 20" className="h-4 w-4">
                      <path
                        fill="currentColor"
                        d="M5.3 4.3l4.7 4.7 4.7-4.7 1 1-4.7 4.7 4.7 4.7-1 1-4.7-4.7-4.7 4.7-1-1 4.7-4.7-4.7-4.7z"
                      />
                    </svg>
                  </button>
                </div>

                <FilterBar
                  rating={rating}
                  decade={decade}
                  directors={directors}
                  providers={providers}
                  decadeOptions={decadeOptions}
                  directorOptions={directorOptions}
                  showDirectors={showDirectors}
                  onRatingChange={onRatingChange}
                  onDecadeChange={onDecadeChange}
                  onDirectorsChange={onDirectorsChange}
                  onProvidersChange={onProvidersChange}
                  className="mt-5"
                />

                <div className="mt-6 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={onClearAll}
                    disabled={activeCount === 0}
                    className="rounded-xl bg-white/10 px-4 py-2.5 text-xs font-semibold text-white/80 transition hover:bg-white/20 disabled:pointer-events-none disabled:opacity-40"
                  >
                    Limpar tudo
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-2xl px-6 py-2.5 text-sm font-bold tracking-tight bg-white text-[#05050c] transition-all duration-300 ease-ios hover:-translate-y-0.5 hover:bg-white/90 active:translate-y-0 active:scale-[0.96]"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FilterDrawer;
