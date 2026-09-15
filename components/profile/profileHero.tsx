import React from "react";
import { motion } from "framer-motion";
import { FaPen } from "react-icons/fa";
import Avatar from "./avatar";
import FollowButton from "./followButton";
import ProfileCounters from "./profileCounters";
import { Profile } from "../../interfaces/profile/types";

interface ProfileHeroProps {
  profile: Profile;
  isEditing: boolean;
  isFollowPending: boolean;
  onToggleFollow: () => void;
  onStartEditing: () => void;
  onOpenFollowers: () => void;
  onOpenFollowing: () => void;
}

const ProfileHero: React.FC<ProfileHeroProps> = ({
  profile,
  isEditing,
  isFollowPending,
  onToggleFollow,
  onStartEditing,
  onOpenFollowers,
  onOpenFollowing,
}) => (
  <motion.header
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    className="relative"
  >
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
      <Avatar name={profile.name} username={profile.username} size="lg" />

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-3xl font-black tracking-tight text-white sm:text-4xl">
          {profile.name || profile.username}
        </h1>
        <p className="mt-1 text-sm font-semibold text-white/45">
          @{profile.username}
          {profile.followsYou && !profile.isSelf && (
            <span className="ml-2 rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[0.65rem] font-bold text-white/60">
              Segue você
            </span>
          )}
        </p>
      </div>

      {profile.isSelf ? (
        !isEditing && (
          <button
            type="button"
            onClick={onStartEditing}
            className="flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-6 text-sm font-bold text-white transition-colors duration-300 hover:bg-white/[0.09]"
          >
            <FaPen size={11} />
            Editar perfil
          </button>
        )
      ) : (
        <FollowButton
          isFollowing={profile.isFollowing}
          isPending={isFollowPending}
          onToggle={onToggleFollow}
        />
      )}
    </div>

    {!isEditing && profile.bio && (
      <p className="mt-5 max-w-2xl whitespace-pre-line text-sm leading-relaxed text-white/65">
        {profile.bio}
      </p>
    )}

    <div className="mt-6">
      <ProfileCounters
        counts={profile.counts}
        onOpenFollowers={onOpenFollowers}
        onOpenFollowing={onOpenFollowing}
      />
    </div>
  </motion.header>
);

export default ProfileHero;
