import React, { useEffect, useRef, useState } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { SearchResult } from "../../../interfaces/search/types";
import SearchResultCard from "./searchResultCard";

const DEBOUNCE_MS = 350;
const MIN_QUERY_LENGTH = 2;

interface SearchBarProps {
  onFocus: () => void;
  onBlur: () => void;
  isExpanded: boolean;
  isMobile?: boolean;
  autoFocus?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onFocus,
  onBlur,
  isExpanded,
  isMobile = false,
  autoFocus = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    const trimmedQuery = searchQuery.trim();

    if (trimmedQuery.length < MIN_QUERY_LENGTH) {
      setSearchResults([]);
      setIsLoading(false);
      setHasSearched(false);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);

    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_URL_API}/search?query=${encodeURIComponent(trimmedQuery)}`,
          { signal: controller.signal },
        );

        if (!response.ok) throw new Error("Falha ao buscar resultados");

        const data: SearchResult[] = await response.json();
        setSearchResults(data);
        setHasSearched(true);
      } catch (error) {
        if ((error as Error)?.name === "AbortError") return;
        setSearchResults([]);
        setHasSearched(true);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [searchQuery]);

  const clearQuery = () => {
    setSearchQuery("");
    inputRef.current?.focus();
  };

  const showPanel =
    (isExpanded || isMobile) &&
    searchQuery.trim().length >= MIN_QUERY_LENGTH &&
    (isLoading || hasSearched);

  return (
    <div className="relative w-full">
      <form
        onSubmit={(event) => event.preventDefault()}
        className="relative flex items-center"
        role="search"
      >
        <motion.div
          animate={{
            boxShadow: isExpanded
              ? "0 0 0 1px rgba(129,140,248,0.45), 0 12px 40px -14px rgba(124,77,255,0.7)"
              : "0 0 0 1px rgba(255,255,255,0.08), 0 0 0 0 rgba(124,77,255,0)",
          }}
          transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
          className="flex w-full items-center rounded-full bg-white/[0.06] backdrop-blur-xl"
        >
          <FaSearch
            className={`ml-4 shrink-0 transition-colors duration-300 ${
              isExpanded ? "text-indigo-300" : "text-white/40"
            }`}
            size={15}
          />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={
              isMobile ? "Buscar..." : "Buscar filmes, séries, elenco..."
            }
            aria-label="Buscar filmes e séries"
            className="w-full bg-transparent px-3 py-3 text-sm font-medium text-white placeholder:text-white/35 focus:outline-none"
            onFocus={onFocus}
            onBlur={onBlur}
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                type="button"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                onMouseDown={(event) => event.preventDefault()}
                onClick={clearQuery}
                aria-label="Limpar busca"
                className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/50 transition-colors hover:bg-white/20 hover:text-white"
              >
                <FaTimes size={11} />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </form>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            className="glass-strong absolute left-0 top-full z-50 mt-3 w-full origin-top overflow-hidden rounded-3xl shadow-lift"
          >
            {isLoading ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="skeleton h-20 w-14 shrink-0 rounded-xl" />
                    <div className="flex-1 space-y-2 py-2">
                      <div className="skeleton h-3.5 w-3/4 rounded-full" />
                      <div className="skeleton h-3 w-full rounded-full" />
                      <div className="skeleton h-3 w-1/3 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : searchResults.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <p className="text-sm font-semibold text-white/70">
                  Nada encontrado
                </p>
                <p className="mt-1 text-xs text-white/40">
                  Tente outro título ou verifique a escrita.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-white/[0.07] bg-white/[0.03] px-4 py-2.5">
                  <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-white/45">
                    {searchResults.length}{" "}
                    {searchResults.length === 1 ? "resultado" : "resultados"}
                  </p>
                  <span className="hidden text-[0.6rem] font-semibold text-white/25 sm:block">
                    ESC para fechar
                  </span>
                </div>
                <ul className="hide-scrollbar max-h-[60vh] overflow-y-auto overscroll-contain">
                  {searchResults.map((result, index) => (
                    <SearchResultCard
                      key={`${result.type}-${result.id}`}
                      result={result}
                      index={index}
                      onMouseDown={(event) => event.preventDefault()}
                    />
                  ))}
                </ul>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
