import { useCallback, useEffect, useState } from "react";
import { authFetch } from "../utils/authFetch";
import { useAuth } from "./authContext";
import {
  WatchlistItem,
  WatchlistItemType,
  WatchlistStats,
} from "../interfaces/watchlist/types";

interface WatchlistResponse {
  items: WatchlistItem[];
  stats: WatchlistStats;
}

const EMPTY_STATS: WatchlistStats = { total: 0, movies: 0, series: 0 };

export const useWatchlist = () => {
  const { user, authLoading } = useAuth();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [stats, setStats] = useState<WatchlistStats>(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setItems([]);
      setStats(EMPTY_STATS);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setHasError(false);

    authFetch(`${process.env.NEXT_PUBLIC_URL_API}/me/watchlist`)
      .then((response) => {
        if (!response.ok) throw new Error("Falha ao buscar a watchlist");
        return response.json();
      })
      .then((data: WatchlistResponse) => {
        if (cancelled) return;
        setItems(data.items);
        setStats(data.stats);
      })
      .catch(() => {
        if (!cancelled) setHasError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, reloadToken, user]);

  const removeItem = useCallback(
    async (type: WatchlistItemType, idTmdb: number) => {
      const previous = items;
      setItems((current) =>
        current.filter(
          (item) => !(item.type === type && item.idTmdb === idTmdb),
        ),
      );
      setStats((current) => ({
        total: Math.max(0, current.total - 1),
        movies:
          type === "movie" ? Math.max(0, current.movies - 1) : current.movies,
        series:
          type === "serie" ? Math.max(0, current.series - 1) : current.series,
      }));

      try {
        const response = await authFetch(
          `${process.env.NEXT_PUBLIC_URL_API}/me/watchlist/${type}/${idTmdb}`,
          { method: "DELETE" },
        );
        if (!response.ok) throw new Error("Falha ao remover");
        return true;
      } catch {
        setItems(previous);
        setStats((current) => ({
          total: current.total + 1,
          movies: type === "movie" ? current.movies + 1 : current.movies,
          series: type === "serie" ? current.series + 1 : current.series,
        }));
        return false;
      }
    },
    [items],
  );

  return { items, stats, isLoading, hasError, reload, removeItem };
};
