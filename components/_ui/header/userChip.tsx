import { forwardRef } from "react";
import { FaChevronDown } from "react-icons/fa";
import Avatar from "../../profile/avatar";

interface UserChipProps {
  username: string;
  name?: string;
  avatarUrl?: string | null;
  pendingCount?: number;
  isOpen?: boolean;
  onClick: () => void;
  compact?: boolean;
}

const UserChip = forwardRef<HTMLButtonElement, UserChipProps>(
  (
    { username, name, avatarUrl, pendingCount = 0, isOpen, onClick, compact },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        aria-label={`Conta de ${username}`}
        aria-expanded={isOpen}
        className={`group flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] backdrop-blur-xl transition-all duration-300 ease-ios hover:border-white/20 hover:bg-white/[0.12] active:scale-95 ${
          compact ? "p-1" : "py-1 pl-1 pr-3"
        }`}
      >
        <span className="relative flex items-center justify-center">
          <Avatar
            name={name ?? ""}
            username={username}
            size="sm"
            imageUrl={avatarUrl ?? null}
          />
          {pendingCount > 0 ? (
            <span
              aria-label={`${pendingCount} confirmação(ões) pendente(s)`}
              className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full border-2 border-[#05050c] bg-rose-500 px-1 text-[0.6rem] font-black tabular-nums text-white"
            >
              {pendingCount > 99 ? "99+" : pendingCount}
            </span>
          ) : (
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#05050c] bg-emerald-400" />
          )}
        </span>
        {!compact && (
          <>
            <span className="flex flex-col items-start leading-none">
              <span className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                Conectado
              </span>
              <span className="mt-0.5 max-w-[9rem] truncate text-sm font-bold text-white">
                @{username}
              </span>
            </span>
            <FaChevronDown
              size={11}
              className={`text-white/50 transition-transform duration-300 ease-ios ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </>
        )}
      </button>
    );
  },
);

UserChip.displayName = "UserChip";

export default UserChip;
