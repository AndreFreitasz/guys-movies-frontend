const TOKEN_STORAGE_KEY = "accessToken";
const EXPIRES_AT_STORAGE_KEY = "accessTokenExpiresAt";

const DEFAULT_SESSION_TTL_SECONDS = 604800;

const readExpiresAt = (): number | null => {
  try {
    const stored = window.localStorage.getItem(EXPIRES_AT_STORAGE_KEY);
    if (!stored) return null;

    const parsed = Number(stored);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const isSessionExpired = (): boolean => {
  if (typeof window === "undefined") return false;

  const expiresAt = readExpiresAt();
  return expiresAt !== null && Date.now() >= expiresAt;
};

export const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;

  if (isSessionExpired()) {
    clearAccessToken();
    return null;
  }

  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const setAccessToken = (token: string, expiresInSeconds?: number) => {
  const ttl =
    Number.isFinite(expiresInSeconds) && Number(expiresInSeconds) > 0
      ? Number(expiresInSeconds)
      : DEFAULT_SESSION_TTL_SECONDS;

  try {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    window.localStorage.setItem(
      EXPIRES_AT_STORAGE_KEY,
      String(Date.now() + ttl * 1000),
    );
  } catch {
    return;
  }
};

export const clearAccessToken = () => {
  try {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(EXPIRES_AT_STORAGE_KEY);
  } catch {
    return;
  }
};

export const authFetch = (input: RequestInfo | URL, init: RequestInit = {}) => {
  const token = getAccessToken();
  const headers = new Headers(init.headers);

  if (token) headers.set("Authorization", `Bearer ${token}`);

  return fetch(input, { ...init, credentials: "include", headers });
};
