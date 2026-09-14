import { useEffect, useState } from "react";
import { authFetch } from "../utils/authFetch";
import { UserStats } from "../interfaces/profile/types";

export const useUserStats = (enabled: boolean) => {
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    authFetch(`${process.env.NEXT_PUBLIC_URL_API}/me/stats`)
      .then((response) => {
        if (!response.ok) throw new Error("Falha ao carregar estatísticas");
        return response.json();
      })
      .then((data: UserStats) => {
        if (!cancelled) setStats(data);
      })
      .catch(() => {
        if (!cancelled) setStats(null);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return stats;
};
