import { useCallback, useEffect, useRef, useState } from "react";
import { authFetch } from "../utils/authFetch";
import { CoverOption } from "../interfaces/profile/types";

type CoversStatus = "idle" | "loading" | "ready" | "failed";

export const useCovers = (isEnabled: boolean) => {
  const [options, setOptions] = useState<CoverOption[]>([]);
  const [status, setStatus] = useState<CoversStatus>("idle");
  const [term, setTerm] = useState("");
  const requestRef = useRef(0);

  const load = useCallback(async (search: string) => {
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;

    setStatus("loading");

    try {
      const query = search.trim()
        ? `?q=${encodeURIComponent(search.trim())}`
        : "";
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_URL_API}/me/covers${query}`,
      );

      if (requestRef.current !== requestId) return;
      if (!response.ok) throw new Error("Falha ao carregar as capas");

      const data = (await response.json()) as CoverOption[];
      if (requestRef.current !== requestId) return;

      setOptions(data);
      setStatus("ready");
    } catch {
      if (requestRef.current !== requestId) return;
      setOptions([]);
      setStatus("failed");
    }
  }, []);

  useEffect(() => {
    if (!isEnabled) return;

    const timeoutId = setTimeout(() => load(term), term ? 300 : 0);
    return () => clearTimeout(timeoutId);
  }, [isEnabled, load, term]);

  return {
    options,
    status,
    term,
    setTerm,
    reload: () => load(term),
  };
};
