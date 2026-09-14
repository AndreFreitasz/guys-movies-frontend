import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import { authFetch } from "../utils/authFetch";
import { Profile } from "../interfaces/profile/types";

export const useFollow = (
  profile: Profile | null,
  setProfile: (updater: (current: Profile | null) => Profile | null) => void,
) => {
  const [isPending, setIsPending] = useState(false);

  const toggle = useCallback(async () => {
    if (!profile || profile.isSelf || isPending) return;

    const wasFollowing = profile.isFollowing;
    const previousFollowers = profile.counts.followers;

    setIsPending(true);
    setProfile((current) =>
      current
        ? {
            ...current,
            isFollowing: !wasFollowing,
            counts: {
              ...current.counts,
              followers: previousFollowers + (wasFollowing ? -1 : 1),
            },
          }
        : current,
    );

    try {
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_URL_API}/profiles/${encodeURIComponent(profile.username)}/follow`,
        { method: wasFollowing ? "DELETE" : "POST" },
      );

      if (!response.ok) throw new Error("Falha ao atualizar");
    } catch {
      setProfile((current) =>
        current
          ? {
              ...current,
              isFollowing: wasFollowing,
              counts: { ...current.counts, followers: previousFollowers },
            }
          : current,
      );
      toast.error("Não foi possível atualizar. Tente de novo.");
    } finally {
      setIsPending(false);
    }
  }, [isPending, profile, setProfile]);

  return { toggle, isPending };
};
