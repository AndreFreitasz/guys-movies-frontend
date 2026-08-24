import type { ServerResponse } from "http";

export const setPublicCache = (
  res: ServerResponse,
  maxAgeSeconds: number,
  staleWhileRevalidateSeconds: number,
) => {
  res.setHeader(
    "Cache-Control",
    `public, s-maxage=${maxAgeSeconds}, stale-while-revalidate=${staleWhileRevalidateSeconds}`,
  );
};
