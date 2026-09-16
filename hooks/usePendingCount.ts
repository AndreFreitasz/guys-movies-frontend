import { useCallback, useEffect, useState } from "react";
import { authFetch } from "../utils/authFetch";

export const usePendingCount = (isEnabled: boolean) => {
  const [count, setCount] = useState(0);

  const load = useCallback(async () => {
    if (!isEnabled) {
      setCount(0);
      return;
    }

    try {
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_URL_API}/me/watch-together/pending/count`,
      );

      if (!response.ok) throw new Error("Falha ao contar pendências");

      const data = (await response.json()) as { count: number };
      setCount(data.count ?? 0);
    } catch {
      setCount(0);
    }
  }, [isEnabled]);

  useEffect(() => {
    load();
  }, [load]);

  return { count, reload: load };
};
