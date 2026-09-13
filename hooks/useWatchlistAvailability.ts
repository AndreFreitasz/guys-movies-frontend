import { useEffect, useState } from "react";
import { authFetch } from "../utils/authFetch";
import { useAuth } from "./authContext";
import {
  availabilityKey,
  AvailabilityStatus,
  WatchlistItemType,
  WatchlistProvider,
} from "../interfaces/watchlist/types";

interface AvailabilityResponse {
  items: {
    type: WatchlistItemType;
    idTmdb: number;
    providers: WatchlistProvider[];
  }[];
  failed: boolean;
}

export const useWatchlistAvailability = (enabled: boolean) => {
  const { user, authLoading } = useAuth();
  const [providersByKey, setProvidersByKey] = useState<
    Map<string, WatchlistProvider[]>
  >(new Map());
  const [status, setStatus] = useState<AvailabilityStatus>("idle");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (authLoading || !user || !enabled) return;

    let cancelled = false;
    setStatus("loading");

    authFetch(`${process.env.NEXT_PUBLIC_URL_API}/me/watchlist/availability`)
      .then((response) => {
        if (!response.ok) throw new Error("Falha ao consultar disponibilidade");
        return response.json();
      })
      .then((data: AvailabilityResponse) => {
        if (cancelled) return;
        setProvidersByKey(
          new Map(
            data.items.map((item) => [
              availabilityKey(item.type, item.idTmdb),
              item.providers,
            ]),
          ),
        );
        setFailed(data.failed);
        setStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setFailed(true);
        setStatus("failed");
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, enabled, user]);

  return { providersByKey, status, failed };
};
