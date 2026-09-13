import { useCallback, useEffect, useMemo, useState } from "react";
import { authFetch } from "../utils/authFetch";
import { useAuth } from "./authContext";
import {
  WatchlistItem,
  WatchlistItemType,
  WatchlistStats,
} from "../interfaces/watchlist/types";

interface WatchlistResponse {
  items: WatchlistItem[];
}

export const useWatchlist = () => {
  const { user, authLoading } = useAuth();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  const stats = useMemo<WatchlistStats>(
    () => ({
      total: items.length,
      movies: items.filter((item) => item.type === "movie").length,
      series: items.filter((item) => item.type === "serie").length,
    }),
    [items],
  );

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setItems([]);
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
      const removedItem = items.find(
        (item) => item.type === type && item.idTmdb === idTmdb,
      );

      setItems((current) =>
        current.filter(
          (item) => !(item.type === type && item.idTmdb === idTmdb),
        ),
      );

      try {
        const response = await authFetch(
          `${process.env.NEXT_PUBLIC_URL_API}/me/watchlist/${type}/${idTmdb}`,
          { method: "DELETE" },
        );
        if (!response.ok) throw new Error("Falha ao remover");
        return true;
      } catch {
        if (removedItem) {
          setItems((current) =>
            current.some((item) => item.type === type && item.idTmdb === idTmdb)
              ? current
              : [...current, removedItem],
          );
        }
        return false;
      }
    },
    [items],
  );

  return { items, stats, isLoading, hasError, reload, removeItem };
};
