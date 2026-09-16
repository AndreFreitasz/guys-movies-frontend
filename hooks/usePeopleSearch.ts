import { useCallback, useEffect, useRef, useState } from "react";
import { authFetch } from "../utils/authFetch";
import { UserListPage, UserSummary } from "../interfaces/profile/types";

type PeopleStatus = "idle" | "loading" | "ready" | "failed";

const DEBOUNCE_MS = 300;

export const usePeopleSearch = (term: string, isEnabled: boolean) => {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [status, setStatus] = useState<PeopleStatus>("idle");
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const requestRef = useRef(0);

  const fetchPage = useCallback(
    async (query: string, nextCursor: string | null) => {
      const requestId = requestRef.current + 1;
      requestRef.current = requestId;

      if (nextCursor) setIsLoadingMore(true);
      else setStatus("loading");

      try {
        const params = new URLSearchParams({ q: query });
        if (nextCursor) params.set("cursor", nextCursor);

        const response = await authFetch(
          `${process.env.NEXT_PUBLIC_URL_API}/profiles?${params.toString()}`,
        );

        if (!response.ok) throw new Error("Falha ao buscar pessoas");

        const page = (await response.json()) as UserListPage;
        if (requestRef.current !== requestId) return;

        setUsers((current) =>
          nextCursor ? [...current, ...page.users] : page.users,
        );
        setCursor(page.nextCursor);
        setStatus("ready");
      } catch {
        if (requestRef.current !== requestId) return;
        if (!nextCursor) setUsers([]);
        setStatus("failed");
      } finally {
        if (requestRef.current === requestId) setIsLoadingMore(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!isEnabled) return;

    const trimmed = term.trim();

    if (trimmed.length === 0) {
      requestRef.current += 1;
      setUsers([]);
      setCursor(null);
      setStatus("idle");
      return;
    }

    const timeoutId = setTimeout(() => fetchPage(trimmed, null), DEBOUNCE_MS);
    return () => clearTimeout(timeoutId);
  }, [fetchPage, isEnabled, term]);

  const loadMore = useCallback(() => {
    if (!cursor || isLoadingMore) return;
    fetchPage(term.trim(), cursor);
  }, [cursor, fetchPage, isLoadingMore, term]);

  const setFollowState = useCallback(
    (username: string, isFollowing: boolean) => {
      setUsers((current) =>
        current.map((user) =>
          user.username === username ? { ...user, isFollowing } : user,
        ),
      );
    },
    [],
  );

  return {
    users,
    status,
    hasMore: cursor !== null,
    isLoadingMore,
    loadMore,
    setFollowState,
    retry: () => fetchPage(term.trim(), null),
  };
};
