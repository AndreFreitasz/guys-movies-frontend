import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { motion } from "framer-motion";
import Link from "next/link";

interface SearchBarProps {
  onFocus: () => void;
  onBlur: () => void;
  isExpanded: boolean;
}

interface Movie {
  id: number;
  title: string;
  poster_url: string;
  vote_average: number;
  release_date: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onFocus,
  onBlur,
  isExpanded,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetchSearchResults();
  };

  const fetchSearchResults = async () => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL_API}/movies/search?query=${searchQuery}`,
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchSearchResults();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <div className="relative">
      <form
        onSubmit={handleSearchSubmit}
        className="flex items-center relative"
      >
        <motion.input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Buscar..."
          className="bg-defaultBackgroundSecond bg-opacity-60 text-white pl-10 pr-4 py-3 rounded-md text-md focus:outline-none"
          initial={{ width: 300 }}
          animate={{ width: isExpanded ? 500 : 300 }}
          transition={{ duration: 0.3 }}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        <FaSearch className="absolute left-3 text-gray-400" size={20} />
      </form>
      {searchResults.length > 0 && isExpanded == true && (
        <ul className="absolute top-full left-0 w-full bg-gray-800 text-white mt-2 rounded-lg shadow-lg z-10 max-h-screen-60 overflow-y-auto">
          {searchResults.map((movie, index) => (
            <Link href={`/movie/${movie.id}`} key={index}>
              <li
                key={index}
                onMouseDown={(e) => e.preventDefault()}
                className="relative px-4 py-2 hover:bg-gray-700 cursor-pointer"
              >
                <div className="flex flex-row items-center">
                  <img
                    src={movie.poster_url}
                    className="w-26 h-32 rounded-md"
                  />
                  <p className="font-bold text-lg ml-4">{movie.title}</p>
                </div>
                <p className="absolute bottom-2 right-4">
                  {movie.release_date}
                </p>
              </li>
            </Link>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
