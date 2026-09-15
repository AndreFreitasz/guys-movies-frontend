import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaCheck, FaTimes } from "react-icons/fa";
import { useCovers } from "../../hooks/useCovers";
import {
  CoverOption,
  FavoriteType,
  resolveBackdropUrl,
} from "../../interfaces/profile/types";

interface CoverPickerProps {
  isOpen: boolean;
  selectedKey: string | null;
  onClose: () => void;
  onSelect: (option: CoverOption) => void;
  onRemove: () => void;
}

type TypeFilter = "all" | FavoriteType;

const FILTERS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "movie", label: "Filmes" },
  { value: "serie", label: "Séries" },
];

const CoverPicker: React.FC<CoverPickerProps> = ({
  isOpen,
  selectedKey,
  onClose,
  onSelect,
  onRemove,
}) => {
  const { options, status, term, setTerm } = useCovers(isOpen);
  const [filter, setFilter] = useState<TypeFilter>("all");

  useEffect(() => {
    if (!isOpen) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const visible = useMemo(
    () =>
      filter === "all"
        ? options
        : options.filter((option) => option.type === filter),
    [filter, options],
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={onClose}
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/65 backdrop-blur-xl"
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.34, ease: [0.2, 0.9, 0.3, 1] }}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Escolher capa"
            className="max-h-[88vh] w-full max-w-[760px] overflow-y-auto rounded-t-[1.75rem] border border-b-0 border-white/12 bg-gradient-to-b from-ink-800/95 to-ink-900/[0.98]"
          >
            <div className="sticky top-0 z-10 bg-ink-800/95 px-5 pb-4 pt-3 backdrop-blur-xl">
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/25" />

              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black tracking-tight text-white">
                    Escolher capa
                  </h3>
                  <p className="mt-0.5 text-xs text-white/45">
                    A arte vem do que você marcou como assistido
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Fechar"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors duration-300 hover:bg-white/20"
                >
                  <FaTimes size={13} />
                </button>
              </div>

              <input
                type="search"
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder="Buscar na sua biblioteca..."
                aria-label="Buscar na sua biblioteca"
                className="mt-3 w-full rounded-full border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-medium text-white placeholder:text-white/35 focus:border-brand-400/60 focus:outline-none"
              />

              <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
                {FILTERS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFilter(option.value)}
                    className={`min-h-[36px] shrink-0 rounded-full border px-4 text-xs font-bold transition-colors duration-300 ${
                      filter === option.value
                        ? "border-brand-400/60 bg-brand-500/25 text-brand-100"
                        : "border-white/12 bg-white/[0.05] text-white/55 hover:text-white/80"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
                {selectedKey && (
                  <button
                    type="button"
                    onClick={onRemove}
                    className="ml-auto min-h-[36px] shrink-0 rounded-full border border-white/12 px-4 text-xs font-bold text-white/55 transition-colors duration-300 hover:text-white/80"
                  >
                    Remover capa
                  </button>
                )}
              </div>
            </div>

            <div className="px-5 pb-8 pt-1">
              {(status === "loading" || status === "idle") && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="skeleton aspect-[16/10] w-full rounded-2xl"
                    />
                  ))}
                </div>
              )}

              {status === "failed" && (
                <p className="py-10 text-center text-sm text-white/55">
                  Não foi possível carregar as capas.
                </p>
              )}

              {status === "ready" && visible.length === 0 && (
                <p className="py-10 text-center text-sm leading-relaxed text-white/50">
                  Nenhum título com arte de capa disponível. Marque filmes ou
                  séries como assistidos para montar sua galeria.
                </p>
              )}

              {status === "ready" && visible.length > 0 && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {visible.map((option) => {
                    const key = `${option.type}:${option.idTmdb}`;
                    const isActive = key === selectedKey;

                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => onSelect(option)}
                        className={`relative aspect-[16/10] overflow-hidden rounded-2xl border text-left transition-transform duration-300 ease-ios hover:scale-[1.02] ${
                          isActive
                            ? "border-brand-400 ring-2 ring-brand-500/35"
                            : "border-white/12"
                        }`}
                      >
                        <img
                          src={
                            resolveBackdropUrl(option.backdropPath, 780) ?? ""
                          }
                          alt={option.title}
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                        <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                        <span className="absolute inset-x-3 bottom-2.5">
                          <span className="block truncate text-sm font-bold text-white">
                            {option.title}
                          </span>
                          <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white/50">
                            {option.type === "movie" ? "Filme" : "Série"}
                          </span>
                        </span>
                        {isActive && (
                          <span className="absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-white">
                            <FaCheck size={11} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CoverPicker;
