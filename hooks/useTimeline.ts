import { useCallback, useEffect, useRef, useState } from "react";
import { authFetch } from "../utils/authFetch";
import { TimelineEvent, TimelinePage } from "../interfaces/profile/types";

type TimelineStatus = "idle" | "loading" | "ready" | "failed";

export const useTimeline = (username: string | undefined) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [status, setStatus] = useState<TimelineStatus>("idle");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const requestRef = useRef(0);

  const fetchPage = useCallback(
    async (cursor: string | null) => {
      if (!username) return;

      const requestId = requestRef.current + 1;
      requestRef.current = requestId;

      if (cursor) setIsLoadingMore(true);
      else setStatus("loading");

      try {
        const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
        const response = await authFetch(
          `${process.env.NEXT_PUBLIC_URL_API}/profiles/${encodeURIComponent(username)}/timeline${query}`,
        );

        if (!response.ok) throw new Error("Falha ao carregar o histórico");

        const page = (await response.json()) as TimelinePage;
        if (requestRef.current !== requestId) return;

        setEvents((current) =>
          cursor ? [...current, ...page.events] : page.events,
        );
        setNextCursor(page.nextCursor);
        setStatus("ready");
      } catch {
        if (requestRef.current !== requestId) return;
        if (!cursor) setStatus("failed");
      } finally {
        if (requestRef.current === requestId) setIsLoadingMore(false);
      }
    },
    [username],
  );

  useEffect(() => {
    setEvents([]);
    setNextCursor(null);
    fetchPage(null);
  }, [fetchPage]);

  return {
    events,
    status,
    nextCursor,
    isLoadingMore,
    loadMore: () => fetchPage(nextCursor),
    retry: () => fetchPage(null),
  };
};
