import React from "react";
import Avatar from "../profile/avatar";
import { UserSummary, resolveAvatarUrl } from "../../interfaces/profile/types";

interface CompanionStripProps {
  companions: UserSummary[];
  max?: number;
}

const CompanionStrip: React.FC<CompanionStripProps> = ({
  companions,
  max = 3,
}) => {
  if (companions.length === 0) return null;

  const shown = companions.slice(0, max);
  const names = companions
    .slice(0, 2)
    .map((person) => person.name || person.username)
    .join(", ");

  return (
    <span className="flex items-center gap-1.5">
      <span className="flex -space-x-2">
        {shown.map((person) => (
          <span
            key={person.username}
            title={person.name || person.username}
            className="rounded-full ring-2 ring-[#05050c]"
          >
            <Avatar
              name={person.name}
              username={person.username}
              size="sm"
              imageUrl={resolveAvatarUrl(
                person.username,
                person.avatarUpdatedAt,
              )}
            />
          </span>
        ))}
      </span>
      <span className="truncate text-xs text-white/40">
        com {names}
        {companions.length > 2 && ` e mais ${companions.length - 2}`}
      </span>
    </span>
  );
};

export default CompanionStrip;
