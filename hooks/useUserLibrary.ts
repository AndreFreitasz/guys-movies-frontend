import { useEffect, useState } from "react";
import { authFetch } from "../utils/authFetch";
import { useAuth } from "./authContext";

interface UserLibraryResponse {
  watchedMovies: number[];
  watchedSeries: number[];
  watchlistMovies: number[];
  watchlistSeries: number[];
}

export interface UserLibrarySets {
  watchedMovies: Set<number>;
  watchedSeries: Set<number>;
  watchlistMovies: Set<number>;
  watchlistSeries: Set<number>;
}

interface UseUserLibraryResult extends UserLibrarySets {
  isReady: boolean;
}

const EMPTY_LIBRARY: UserLibrarySets = {
  watchedMovies: new Set(),
  watchedSeries: new Set(),
  watchlistMovies: new Set(),
  watchlistSeries: new Set(),
};

export const useUserLibrary = (): UseUserLibraryResult => {
  const { user, authLoading } = useAuth();
  const [library, setLibrary] = useState<UserLibrarySets>(EMPTY_LIBRARY);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setLibrary(EMPTY_LIBRARY);
      setIsReady(true);
      return;
    }

    let cancelled = false;

    authFetch(`${process.env.NEXT_PUBLIC_URL_API}/me/library`)
      .then((response) => {
        if (!response.ok) throw new Error("Falha ao buscar a estante");
        return response.json();
      })
      .then((data: UserLibraryResponse) => {
        if (cancelled) return;
        setLibrary({
          watchedMovies: new Set(data.watchedMovies),
          watchedSeries: new Set(data.watchedSeries),
          watchlistMovies: new Set(data.watchlistMovies),
          watchlistSeries: new Set(data.watchlistSeries),
        });
      })
      .catch(() => {
        if (!cancelled) setLibrary(EMPTY_LIBRARY);
      })
      .finally(() => {
        if (!cancelled) setIsReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  return { ...library, isReady };
};
