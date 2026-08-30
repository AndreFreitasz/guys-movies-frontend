import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { authFetch } from "../utils/authFetch";
import { useAuth } from "./authContext";

export type WatchedMediaKind = "movie" | "serie";

export interface WatchedMediaLabels {
  authRequired: string;
  watchedSuccess: string;
  watchedRemoved?: string;
  watchedError: string;
  missingDate: string;
  waitingAdded?: string;
  waitingRemoved?: string;
  waitingError: string;
  ratingBlocked: string;
  ratingError: string;
}

export interface UseWatchedMediaOptions {
  kind: WatchedMediaKind;
  idTmdb: number;
  buildPayload: () => unknown;
  labels: WatchedMediaLabels;
}

const RESOURCES = {
  movie: {
    watched: "watchedMovie",
    waiting: "waitingMovie",
    payloadKey: "createMovieDto",
  },
  serie: {
    watched: "watchedSerie",
    waiting: "waitingSerie",
    payloadKey: "createSerieDto",
  },
} as const;

const apiUrl = (path: string) => `${process.env.NEXT_PUBLIC_URL_API}/${path}`;

export const useWatchedMedia = ({
  kind,
  idTmdb,
  buildPayload,
  labels,
}: UseWatchedMediaOptions) => {
  const { user, authLoading } = useAuth();
  const resource = RESOURCES[kind];

  const [isWatched, setIsWatched] = useState(false);
  const [rating, setRatingValue] = useState(0);
  const [watchedLoading, setWatchedLoading] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isWaitingLoading, setIsWaitingLoading] = useState(false);

  const requireUser = useCallback(() => {
    if (authLoading) return false;
    if (!user) {
      toast.warn(labels.authRequired);
      return false;
    }
    return true;
  }, [authLoading, labels.authRequired, user]);

  const loadState = useCallback(async () => {
    const [watchedResponse, waitingResponse, rateResponse] =
      await Promise.allSettled([
        authFetch(apiUrl(`${resource.watched}/isWatched?idTmdb=${idTmdb}`)),
        authFetch(apiUrl(`${resource.waiting}/isWaiting?idTmdb=${idTmdb}`)),
        authFetch(apiUrl(`${resource.watched}/getRate?idTmdb=${idTmdb}`)),
      ]);

    if (watchedResponse.status === "fulfilled" && watchedResponse.value.ok) {
      const data = await watchedResponse.value.json();
      setIsWatched(Boolean(data.watched));
    }

    if (waitingResponse.status === "fulfilled" && waitingResponse.value.ok) {
      const data = await waitingResponse.value.json();
      setIsWaiting(Boolean(data.waiting));
    }

    if (rateResponse.status === "fulfilled" && rateResponse.value.ok) {
      const data = await rateResponse.value.json();
      setRatingValue(data.rate ?? 0);
    }
  }, [idTmdb, resource.waiting, resource.watched]);

  useEffect(() => {
    if (authLoading || !user) return;
    loadState();
  }, [authLoading, loadState, user]);

  const toggleWatched = useCallback(
    async (watchedAtIso: string) => {
      if (!requireUser()) return;

      setWatchedLoading(true);

      try {
        const response = await authFetch(apiUrl(resource.watched), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            watchedAt: watchedAtIso,
            [resource.payloadKey]: buildPayload(),
          }),
        });

        if (!response.ok) throw new Error("Requisição rejeitada");

        const data = (await response.json()) as { unmarked?: boolean };

        if (data.unmarked) {
          setIsWatched(false);
          setRatingValue(0);
          if (labels.watchedRemoved) toast.info(labels.watchedRemoved);
          return;
        }

        setIsWatched(true);
        toast.success(labels.watchedSuccess);
      } catch {
        toast.error(labels.watchedError);
      } finally {
        setWatchedLoading(false);
      }
    },
    [
      buildPayload,
      labels.watchedError,
      labels.watchedRemoved,
      labels.watchedSuccess,
      requireUser,
      resource.payloadKey,
      resource.watched,
    ],
  );

  const setRating = useCallback(
    async (newRating: number) => {
      if (!requireUser()) return;

      if (!isWatched) {
        toast.warn(labels.ratingBlocked);
        return;
      }

      const previousRating = rating;
      setRatingValue(newRating);

      try {
        const response = await authFetch(apiUrl(`${resource.watched}/rate`), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idTmdb, rating: newRating }),
        });

        if (!response.ok) throw new Error("Requisição rejeitada");
      } catch {
        setRatingValue(previousRating);
        toast.error(labels.ratingError);
      }
    },
    [
      idTmdb,
      isWatched,
      labels.ratingBlocked,
      labels.ratingError,
      rating,
      requireUser,
      resource.watched,
    ],
  );

  const toggleWaiting = useCallback(async () => {
    if (!requireUser()) return;

    setIsWaitingLoading(true);

    try {
      const response = await authFetch(apiUrl(resource.waiting), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [resource.payloadKey]: buildPayload() }),
      });

      if (!response.ok) throw new Error("Requisição rejeitada");

      const data = (await response.json()) as { unmarked?: boolean };
      setIsWaiting(!data.unmarked);

      if (data.unmarked && labels.waitingRemoved) {
        toast.info(labels.waitingRemoved);
        return;
      }

      if (!data.unmarked && labels.waitingAdded) {
        toast.success(labels.waitingAdded);
      }
    } catch {
      toast.error(labels.waitingError);
    } finally {
      setIsWaitingLoading(false);
    }
  }, [
    buildPayload,
    labels.waitingAdded,
    labels.waitingError,
    labels.waitingRemoved,
    requireUser,
    resource.payloadKey,
    resource.waiting,
  ]);

  return {
    isWatched,
    rating,
    isWaiting,
    watchedLoading,
    isWaitingLoading,
    toggleWatched,
    setRating,
    toggleWaiting,
    requireUser,
  };
};
