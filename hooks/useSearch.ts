import { useCallback, useEffect, useRef, useState } from "react";
import { SearchResult } from "../interfaces/search/types";

const DEBOUNCE_MS = 300;

export const useSearch = (query: string, delayMs = DEBOUNCE_MS) => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(async (term: string) => {
    abortRef.current?.abort();

    if (term.trim().length === 0) {
      setResults([]);
      setIsSearching(false);
      setError("");
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setIsSearching(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL_API}/search?query=${encodeURIComponent(term)}`,
        { signal: controller.signal },
      );
      if (!response.ok) throw new Error("Falha na busca");
      setResults((await response.json()) as SearchResult[]);
    } catch (caught) {
      if ((caught as Error).name === "AbortError") return;
      setError("Não foi possível buscar agora.");
    } finally {
      if (!controller.signal.aborted) setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      setIsSearching(false);
      setError("");
      return;
    }

    setIsSearching(true);
    setError("");

    const timeout = setTimeout(() => run(query), delayMs);
    return () => clearTimeout(timeout);
  }, [delayMs, query, run]);

  useEffect(() => () => abortRef.current?.abort(), []);

  return { results, isSearching, error, retry: () => run(query) };
};
