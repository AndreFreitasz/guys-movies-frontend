import { useCallback, useEffect, useState } from "react";
import { authFetch } from "../utils/authFetch";
import { Profile } from "../interfaces/profile/types";

type ProfileStatus = "idle" | "loading" | "ready" | "notFound" | "failed";

export const useProfile = (username: string | undefined) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [status, setStatus] = useState<ProfileStatus>("idle");

  const load = useCallback(async () => {
    if (!username) return;

    setStatus("loading");

    try {
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_URL_API}/profiles/${encodeURIComponent(username)}`,
      );

      if (response.status === 404) {
        setProfile(null);
        setStatus("notFound");
        return;
      }

      if (!response.ok) throw new Error("Falha ao carregar o perfil");

      setProfile((await response.json()) as Profile);
      setStatus("ready");
    } catch {
      setProfile(null);
      setStatus("failed");
    }
  }, [username]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!username) return;

      setStatus("loading");

      try {
        const response = await authFetch(
          `${process.env.NEXT_PUBLIC_URL_API}/profiles/${encodeURIComponent(username)}`,
        );

        if (cancelled) return;

        if (response.status === 404) {
          setProfile(null);
          setStatus("notFound");
          return;
        }

        if (!response.ok) throw new Error("Falha ao carregar o perfil");

        const data = (await response.json()) as Profile;
        if (cancelled) return;

        setProfile(data);
        setStatus("ready");
      } catch {
        if (cancelled) return;
        setProfile(null);
        setStatus("failed");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [username]);

  return { profile, status, setProfile, reload: load };
};
