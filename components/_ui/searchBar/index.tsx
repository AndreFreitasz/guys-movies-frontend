import React, { useState } from "react";
import { useRouter } from "next/router";
import { FaSearch, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

interface SearchBarProps {
  onFocus: () => void;
  onBlur: () => void;
  isExpanded: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onFocus,
  onBlur,
  isExpanded,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const goToSearch = (term: string) => {
    const trimmed = term.trim();
    router.push(trimmed ? `/busca?q=${encodeURIComponent(trimmed)}` : "/busca");
  };

  const clearQuery = () => {
    setSearchQuery("");
  };

  return (
    <div className="relative w-full">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          goToSearch(searchQuery);
        }}
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
          <button
            type="button"
            onClick={() => goToSearch(searchQuery)}
            aria-label="Buscar"
            className="ml-4 flex shrink-0 items-center justify-center"
          >
            <FaSearch
              className={`transition-colors duration-300 ${
                isExpanded ? "text-indigo-300" : "text-white/40"
              }`}
              size={15}
            />
          </button>
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Buscar filmes, séries, elenco..."
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
    </div>
  );
};

export default SearchBar;
