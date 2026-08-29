import { forwardRef } from "react";
import { FaChevronDown } from "react-icons/fa";

interface UserChipProps {
  username: string;
  isOpen?: boolean;
  onClick: () => void;
  compact?: boolean;
}

const getInitials = (username: string) =>
  username
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "U";

const UserChip = forwardRef<HTMLButtonElement, UserChipProps>(
  ({ username, isOpen, onClick, compact }, ref) => {
    const initials = getInitials(username);

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
        <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.1] text-xs font-black tracking-wide text-white">
          {initials}
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#05050c] bg-emerald-400" />
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
