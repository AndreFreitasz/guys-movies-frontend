import React from "react";
import { avatarGradient, initialsOf } from "../../interfaces/profile/types";

interface AvatarProps {
  id: number;
  name: string;
  username: string;
  size?: "sm" | "md" | "lg";
  imageUrl?: string | null;
}

const SIZES = {
  sm: "h-9 w-9 text-[0.7rem]",
  md: "h-12 w-12 text-sm",
  lg: "h-24 w-24 text-2xl sm:h-28 sm:w-28 sm:text-3xl",
};

const Avatar: React.FC<AvatarProps> = ({
  id,
  name,
  username,
  size = "md",
  imageUrl = null,
}) => {
  if (imageUrl) {
    return (
      <span
        className={`${SIZES[size]} inline-block overflow-hidden rounded-full border border-white/15`}
      >
        <img
          src={imageUrl}
          alt={`Foto de ${name || username}`}
          className="h-full w-full object-cover"
        />
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`${SIZES[size]} inline-flex items-center justify-center rounded-full border border-white/15 bg-gradient-to-br ${avatarGradient(id)} font-black tracking-tight text-white shadow-lg`}
    >
      {initialsOf(name, username)}
    </span>
  );
};

export default Avatar;
