import { toast } from "react-toastify";
import { authFetch } from "./authFetch";
import { UserSummary } from "../interfaces/profile/types";

export interface CompanionTarget {
  type: "movie" | "serie";
  idTmdb: number;
  seasonNumber?: number | null;
}

export const tagCompanions = async (
  target: CompanionTarget,
  companions: UserSummary[],
): Promise<boolean> => {
  if (companions.length === 0) return true;

  const failed: string[] = [];

  for (const person of companions) {
    try {
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_URL_API}/me/watch-together`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: target.type,
            idTmdb: target.idTmdb,
            seasonNumber: target.seasonNumber ?? undefined,
            companionUsername: person.username,
          }),
        },
      );
      if (!response.ok) throw new Error("falhou");
    } catch {
      failed.push(person.name || person.username);
    }
  }

  if (failed.length > 0) {
    toast.error(`Não foi possível marcar ${failed.join(", ")}.`);
    return false;
  }

  toast.success("Enviamos a confirmação para quem você marcou.");
  return true;
};
