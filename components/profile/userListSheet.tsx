import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import Modal from "../_ui/modal";
import Avatar from "./avatar";
import { authFetch } from "../../utils/authFetch";
import { UserListPage, UserSummary } from "../../interfaces/profile/types";

interface UserListSheetProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  mode: "followers" | "following";
}

const TITLES = {
  followers: "Seguidores",
  following: "Seguindo",
};

const EMPTY = {
  followers: "Ninguém segue este perfil ainda.",
  following: "Este perfil ainda não segue ninguém.",
};

const UserListSheet: React.FC<UserListSheetProps> = ({
  isOpen,
  onClose,
  username,
  mode,
}) => {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const [pendingUsername, setPendingUsername] = useState<string | null>(null);

  const fetchPage = useCallback(
    async (nextCursor: string | null) => {
      setIsLoading(true);
      setHasFailed(false);

      try {
        const query = nextCursor
          ? `?cursor=${encodeURIComponent(nextCursor)}`
          : "";
        const response = await authFetch(
          `${process.env.NEXT_PUBLIC_URL_API}/profiles/${encodeURIComponent(username)}/${mode}${query}`,
        );

        if (!response.ok) throw new Error("Falha ao carregar");

        const page = (await response.json()) as UserListPage;
        setUsers((current) =>
          nextCursor ? [...current, ...page.users] : page.users,
        );
        setCursor(page.nextCursor);
      } catch {
        setHasFailed(true);
      } finally {
        setIsLoading(false);
      }
    },
    [mode, username],
  );

  useEffect(() => {
    if (!isOpen) return;
    setUsers([]);
    setCursor(null);
    fetchPage(null);
  }, [fetchPage, isOpen]);

  const toggleFollow = async (target: UserSummary) => {
    if (pendingUsername) return;

    const wasFollowing = target.isFollowing;
    setPendingUsername(target.username);
    setUsers((current) =>
      current.map((user) =>
        user.username === target.username
          ? { ...user, isFollowing: !wasFollowing }
          : user,
      ),
    );

    try {
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_URL_API}/profiles/${encodeURIComponent(target.username)}/follow`,
        { method: wasFollowing ? "DELETE" : "POST" },
      );
      if (!response.ok) throw new Error("Falha");
    } catch {
      setUsers((current) =>
        current.map((user) =>
          user.username === target.username
            ? { ...user, isFollowing: wasFollowing }
            : user,
        ),
      );
      toast.error("Não foi possível atualizar. Tente de novo.");
    } finally {
      setPendingUsername(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={TITLES[mode]}>
      <div className="max-h-[60vh] space-y-1 overflow-y-auto">
        {hasFailed && (
          <div className="py-8 text-center">
            <p className="text-sm text-white/60">Não foi possível carregar.</p>
            <button
              type="button"
              onClick={() => fetchPage(null)}
              className="mt-3 min-h-[44px] rounded-full border border-white/15 px-5 text-sm font-semibold text-white"
            >
              Tentar de novo
            </button>
          </div>
        )}

        {!hasFailed && !isLoading && users.length === 0 && (
          <p className="py-8 text-center text-sm text-white/50">
            {EMPTY[mode]}
          </p>
        )}

        {users.map((user) => (
          <div
            key={user.username}
            className="flex items-center gap-3 rounded-2xl px-2 py-2 transition-colors duration-200 hover:bg-white/[0.04]"
          >
            <Link
              href={`/perfil/${user.username}`}
              onClick={onClose}
              className="flex min-w-0 flex-1 items-center gap-3"
            >
              <Avatar name={user.name} username={user.username} size="md" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-white">
                  {user.name || user.username}
                </span>
                <span className="block truncate text-xs text-white/45">
                  @{user.username}
                </span>
              </span>
            </Link>

            {!user.isSelf && (
              <button
                type="button"
                onClick={() => toggleFollow(user)}
                disabled={pendingUsername === user.username}
                className={`min-h-[36px] shrink-0 rounded-full px-4 text-xs font-bold transition-colors duration-300 disabled:opacity-60 ${
                  user.isFollowing
                    ? "border border-white/15 bg-white/[0.07] text-white"
                    : "bg-gradient-to-r from-violet-500 to-indigo-600 text-white"
                }`}
              >
                {user.isFollowing ? "Seguindo" : "Seguir"}
              </button>
            )}
          </div>
        ))}

        {cursor && (
          <button
            type="button"
            onClick={() => fetchPage(cursor)}
            disabled={isLoading}
            className="mt-2 min-h-[44px] w-full rounded-2xl border border-white/10 text-sm font-semibold text-white/70 disabled:opacity-60"
          >
            {isLoading ? "Carregando..." : "Carregar mais"}
          </button>
        )}
      </div>
    </Modal>
  );
};

export default UserListSheet;
