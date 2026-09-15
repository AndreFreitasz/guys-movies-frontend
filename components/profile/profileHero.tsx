import React from "react";
import { motion } from "framer-motion";
import { FaPen } from "react-icons/fa";
import EditableAvatar from "./editableAvatar";
import FollowButton from "./followButton";
import ProfileCounters from "./profileCounters";
import { Profile, joinedYear } from "../../interfaces/profile/types";

interface ProfileHeroProps {
  profile: Profile;
  isEditing: boolean;
  isSaving: boolean;
  isFollowPending: boolean;
  onToggleFollow: () => void;
  onStartEditing: () => void;
  onSaveEditing: () => void;
  onCancelEditing: () => void;
  onAvatarChanged: (avatarUpdatedAt: string | null) => void;
  onOpenFollowers: () => void;
  onOpenFollowing: () => void;
}

const ProfileHero: React.FC<ProfileHeroProps> = ({
  profile,
  isEditing,
  isSaving,
  isFollowPending,
  onToggleFollow,
  onStartEditing,
  onSaveEditing,
  onCancelEditing,
  onAvatarChanged,
  onOpenFollowers,
  onOpenFollowing,
}) => {
  const year = joinedYear(profile.joinedAt);

  return (
    <motion.header
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10"
    >
      <div className="flex flex-wrap items-end gap-4 sm:gap-6">
        <span className="shrink-0 rounded-full shadow-lift ring-[5px] ring-[#05050c]/75">
          <EditableAvatar
            name={profile.name}
            username={profile.username}
            avatarUpdatedAt={profile.avatarUpdatedAt}
            isSelf={profile.isSelf}
            onChanged={onAvatarChanged}
          />
        </span>

        <div className="min-w-0 flex-1 basis-60">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="truncate text-3xl font-black tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)] sm:text-4xl">
              {profile.name || profile.username}
            </h1>
            {profile.followsYou && !profile.isSelf && (
              <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-0.5 text-[0.65rem] font-bold text-white/60">
                Segue você
              </span>
            )}
          </div>
          <p className="mt-1 text-sm font-semibold text-white/60 drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)]">
            @{profile.username}
            {year && ` · Entrou em ${year}`}
          </p>
        </div>

        <div className="pb-1.5">
          {profile.isSelf ? (
            isEditing ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onSaveEditing}
                  disabled={isSaving}
                  className="min-h-[44px] rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 px-6 text-sm font-bold text-white transition-opacity duration-300 disabled:opacity-60"
                >
                  {isSaving ? "Salvando..." : "Salvar"}
                </button>
                <button
                  type="button"
                  onClick={onCancelEditing}
                  disabled={isSaving}
                  className="min-h-[44px] rounded-full border border-white/15 px-5 text-sm font-semibold text-white/70 transition-colors duration-300 hover:text-white disabled:opacity-60"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onStartEditing}
                className="flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-brand-400/50 px-6 text-sm font-bold text-brand-200 transition-colors duration-300 hover:bg-brand-500/15"
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
};

export default ProfileHero;
