import React, { useState } from "react";
import { toast } from "react-toastify";
import UserRow from "../profile/userRow";
import { authFetch } from "../../utils/authFetch";
import { UserSummary } from "../../interfaces/profile/types";

interface PeopleResultsProps {
  users: UserSummary[];
  status: "idle" | "loading" | "ready" | "failed";
  hasMore: boolean;
  isLoadingMore: boolean;
  term: string;
  isAuthenticated: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
  onFollowStateChange: (username: string, isFollowing: boolean) => void;
}

const PeopleResults: React.FC<PeopleResultsProps> = ({
  users,
  status,
  hasMore,
  isLoadingMore,
  term,
  isAuthenticated,
  onLoadMore,
  onRetry,
  onFollowStateChange,
}) => {
  const [pendingUsername, setPendingUsername] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <p className="mt-10 text-center text-sm leading-relaxed text-white/50">
        Entre na sua conta para encontrar outras pessoas no GuysMovies.
      </p>
    );
  }

  const toggleFollow = async (target: UserSummary) => {
    if (pendingUsername) return;

    const wasFollowing = target.isFollowing;
    setPendingUsername(target.username);
    onFollowStateChange(target.username, !wasFollowing);

    try {
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_URL_API}/profiles/${encodeURIComponent(
          target.username,
        )}/follow`,
        { method: wasFollowing ? "DELETE" : "POST" },
      );
      if (!response.ok) throw new Error("Falha");
    } catch {
      onFollowStateChange(target.username, wasFollowing);
      toast.error("Não foi possível atualizar. Tente de novo.");
    } finally {
      setPendingUsername(null);
    }
  };

  if (status === "failed") {
    return (
      <div className="mt-10 text-center">
        <p className="text-sm text-white/60">
          Não foi possível buscar pessoas agora.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 min-h-[44px] rounded-full border border-white/15 px-6 text-sm font-semibold text-white"
        >
          Tentar de novo
        </button>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="skeleton h-16 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (status === "idle") {
    return (
      <p className="mt-10 text-center text-sm leading-relaxed text-white/50">
        Busque por um nome ou @usuario para encontrar pessoas.
      </p>
    );
  }

  if (users.length === 0) {
    return (
      <p className="mt-10 text-center text-sm leading-relaxed text-white/50">
        Ninguém encontrado para{" "}
        <span className="font-bold text-white">{term}</span>. Tente o nome de
        usuário exato.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-1">
      {users.map((user) => (
        <UserRow
          key={user.username}
          user={user}
          isPending={pendingUsername === user.username}
          onToggleFollow={toggleFollow}
        />
      ))}

      {hasMore && (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={isLoadingMore}
          className="mt-3 min-h-[44px] w-full rounded-2xl border border-white/10 text-sm font-semibold text-white/70 disabled:opacity-60"
        >
          {isLoadingMore ? "Carregando..." : "Carregar mais"}
        </button>
      )}
    </div>
  );
};

export default PeopleResults;
