import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaCheck, FaPlus, FaTimes } from "react-icons/fa";

interface FollowButtonProps {
  isFollowing: boolean;
  isPending: boolean;
  onToggle: () => void;
}

const FollowButton: React.FC<FollowButtonProps> = ({
  isFollowing,
  isPending,
  onToggle,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const showUnfollow = isFollowing && isHovered;

  const label = !isFollowing
    ? "Seguir"
    : showUnfollow
      ? "Deixar de seguir"
      : "Seguindo";

  const Icon = !isFollowing ? FaPlus : showUnfollow ? FaTimes : FaCheck;

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      disabled={isPending}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      whileTap={{ scale: 0.94 }}
      aria-pressed={isFollowing}
      className={`flex min-h-[44px] items-center justify-center gap-2 rounded-full px-6 text-sm font-bold transition-colors duration-300 disabled:opacity-60 ${
        showUnfollow
          ? "border border-red-400/40 bg-red-500/15 text-red-100"
          : isFollowing
            ? "border border-white/15 bg-white/[0.07] text-white"
            : "border border-transparent bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-lg"
      }`}
    >
      <Icon size={12} />
      {label}
    </motion.button>
  );
};

export default FollowButton;
