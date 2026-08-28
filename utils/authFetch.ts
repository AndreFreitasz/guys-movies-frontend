const TOKEN_STORAGE_KEY = "accessToken";

export const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const setAccessToken = (token: string) => {
  try {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    return;
  }
};

export const clearAccessToken = () => {
  try {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
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
