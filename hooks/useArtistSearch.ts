import { useCallback, useEffect, useRef, useState } from "react";
import { ArtistSearchResult } from "../interfaces/person/types";

type ArtistStatus = "idle" | "loading" | "ready" | "failed";

const DEBOUNCE_MS = 300;

export const useArtistSearch = (term: string, isEnabled: boolean) => {
  const [artists, setArtists] = useState<ArtistSearchResult[]>([]);
  const [status, setStatus] = useState<ArtistStatus>("idle");
  const requestRef = useRef(0);

  const fetchArtists = useCallback(async (query: string) => {
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;

    setStatus("loading");

    try {
      const params = new URLSearchParams({ q: query });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL_API}/person/search?${params.toString()}`,
      );

      if (!response.ok) throw new Error("Falha ao buscar artistas");

      const results = (await response.json()) as ArtistSearchResult[];
      if (requestRef.current !== requestId) return;

      setArtists(results);
      setStatus("ready");
    } catch {
      if (requestRef.current !== requestId) return;
      setArtists([]);
      setStatus("failed");
    }
  }, []);

  useEffect(() => {
    if (!isEnabled) return;

    const trimmed = term.trim();

    if (trimmed.length === 0) {
      requestRef.current += 1;
      setArtists([]);
      setStatus("idle");
      return;
    }

    const timeoutId = setTimeout(() => fetchArtists(trimmed), DEBOUNCE_MS);
    return () => clearTimeout(timeoutId);
  }, [fetchArtists, isEnabled, term]);

  return {
    artists,
    status,
    retry: () => fetchArtists(term.trim()),
  };
};
