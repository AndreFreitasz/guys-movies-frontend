import React from "react";
import Link from "next/link";
import Avatar from "./avatar";
import { UserSummary, resolveAvatarUrl } from "../../interfaces/profile/types";

interface UserRowProps {
  user: UserSummary;
  isPending: boolean;
  onToggleFollow: (user: UserSummary) => void;
  onNavigate?: () => void;
}

const UserRow: React.FC<UserRowProps> = ({
  user,
  isPending,
  onToggleFollow,
  onNavigate,
}) => (
  <div className="flex items-center gap-3 rounded-2xl px-2 py-2 transition-colors duration-200 hover:bg-white/[0.04]">
    <Link
      href={`/perfil/${user.username}`}
      onClick={onNavigate}
      className="flex min-w-0 flex-1 items-center gap-3"
    >
      <Avatar
        name={user.name}
        username={user.username}
        size="md"
        imageUrl={resolveAvatarUrl(user.username, user.avatarUpdatedAt)}
      />
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
        onClick={() => onToggleFollow(user)}
        disabled={isPending}
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
);

export default UserRow;
