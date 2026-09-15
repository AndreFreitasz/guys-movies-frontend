import { useCallback, useEffect, useRef, useState } from "react";
import { authFetch } from "../utils/authFetch";
import { Profile } from "../interfaces/profile/types";

type ProfileStatus = "idle" | "loading" | "ready" | "notFound" | "failed";

export const useProfile = (username: string | undefined) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [status, setStatus] = useState<ProfileStatus>("idle");
  const requestRef = useRef(0);

  const load = useCallback(async () => {
    if (!username) return;

    const requestId = requestRef.current + 1;
    requestRef.current = requestId;

    setStatus("loading");

    try {
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_URL_API}/profiles/${encodeURIComponent(username)}`,
      );

      if (requestRef.current !== requestId) return;

      if (response.status === 404) {
        setProfile(null);
        setStatus("notFound");
        return;
      }

      if (!response.ok) throw new Error("Falha ao carregar o perfil");

      const data = (await response.json()) as Profile;
      if (requestRef.current !== requestId) return;

      setProfile(data);
      setStatus("ready");
    } catch {
      if (requestRef.current !== requestId) return;
      setProfile(null);
      setStatus("failed");
    }
  }, [username]);

  useEffect(() => {
    load();
  }, [load]);

  return { profile, status, setProfile, reload: load };
};
