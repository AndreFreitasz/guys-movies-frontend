import React, { useState, useEffect, useCallback } from "react";
import { FaSearch } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { SearchResult } from "../../../interfaces/search/types";
import SearchResultCard from "./searchResultCard";

interface SearchBarProps {
  onFocus: () => void;
  onBlur: () => void;
  isExpanded: boolean;
  isMobile?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onFocus,
  onBlur,
  isExpanded,
  isMobile = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetchSearchResults();
  };

  const fetchSearchResults = useCallback(async () => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL_API}/search?query=${encodeURIComponent(searchQuery)}`,
      );

      if (!response.ok) {
        throw new Error("Falha ao buscar resultados");
      }

      const data: SearchResult[] = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Erro ao buscar resultados:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchSearchResults();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [fetchSearchResults]);

  return (
    <div className="relative w-full">
      <form
        onSubmit={handleSearchSubmit}
        className="flex items-center relative"
      >
        <motion.input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Buscar filmes e séries..."
          className="bg-defaultBackgroundSecond bg-opacity-60 text-white pl-10 pr-4 py-3 rounded-md text-md focus:outline-none w-full"
          initial={!isMobile ? { width: 300 } : {}}
          animate={!isMobile ? { width: isExpanded ? 500 : 300 } : {}}
          transition={{ duration: 0.3 }}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        <FaSearch className="absolute left-3 text-gray-400" size={20} />
      </form>

      <AnimatePresence>
        {isExpanded && (searchResults.length > 0 || isLoading) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 w-full mt-2 rounded-xl shadow-2xl z-50 overflow-hidden border border-white/10 bg-gray-900/95 backdrop-blur-xl"
          >
            {isLoading ? (
              <div className="px-4 py-8 text-center text-white/60 text-sm">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-400"></div>
                <p className="mt-2">Buscando...</p>
              </div>
            ) : (
              <>
                <div className="px-4 py-2 bg-white/5 border-b border-white/10">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
                    {searchResults.length}{" "}
                    {searchResults.length === 1 ? "resultado" : "resultados"}
                  </p>
                </div>
                <ul className="max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  {searchResults.map((result) => (
                    <SearchResultCard
                      key={`${result.type}-${result.id}`}
                      result={result}
                      onMouseDown={(e) => e.preventDefault()}
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
