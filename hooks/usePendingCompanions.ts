import { useCallback, useEffect, useState } from "react";
import { authFetch } from "../utils/authFetch";
import { PendingCompanion } from "../interfaces/profile/watchTogether";

export const usePendingCompanions = (isEnabled: boolean) => {
  const [pending, setPending] = useState<PendingCompanion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    if (!isEnabled) return;

    setIsLoading(true);

    try {
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_URL_API}/me/watch-together/pending`,
      );

      if (!response.ok) throw new Error("Falha ao carregar pendências");

      setPending((await response.json()) as PendingCompanion[]);
    } catch {
      setPending([]);
    } finally {
      setIsLoading(false);
    }
  }, [isEnabled]);

  useEffect(() => {
    load();
  }, [load]);

  const respond = useCallback(
    async (id: number, action: "accept" | "reject", rating?: number) => {
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_URL_API}/me/watch-together/${id}/${action}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(rating === undefined ? {} : { rating }),
        },
      );

      if (!response.ok) throw new Error("Falha ao responder");

      setPending((current) => current.filter((item) => item.id !== id));
    },
    [],
  );

  return { pending, isLoading, respond, reload: load };
};
