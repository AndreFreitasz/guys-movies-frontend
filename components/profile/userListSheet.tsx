import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import Modal from "../_ui/modal";
import UserRow from "./userRow";
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
  const requestRef = useRef(0);

  const fetchPage = useCallback(
    async (nextCursor: string | null) => {
      const requestId = requestRef.current + 1;
      requestRef.current = requestId;

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
        if (requestRef.current !== requestId) return;

        setUsers((current) =>
          nextCursor ? [...current, ...page.users] : page.users,
        );
        setCursor(page.nextCursor);
      } catch {
        if (requestRef.current !== requestId) return;
        setHasFailed(true);
      } finally {
        if (requestRef.current === requestId) setIsLoading(false);
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
          <UserRow
            key={user.username}
            user={user}
            isPending={pendingUsername === user.username}
            onToggleFollow={toggleFollow}
            onNavigate={onClose}
          />
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
