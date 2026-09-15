import React from "react";
import { FaImage } from "react-icons/fa";
import { Cover, resolveBackdropUrl } from "../../interfaces/profile/types";

interface ProfileCoverProps {
  cover: Cover | null;
  isSelf: boolean;
  onChangeCover: () => void;
}

const NOISE_URL =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='.6'/%3E%3C/svg%3E\")";

const BOTTOM_FADE = "linear-gradient(to top, transparent 0%, black 62%)";

const FADE_MASK: React.CSSProperties = {
  WebkitMaskImage: BOTTOM_FADE,
  maskImage: BOTTOM_FADE,
};

const ProfileCover: React.FC<ProfileCoverProps> = ({
  cover,
  isSelf,
  onChangeCover,
}) => {
  const wide = resolveBackdropUrl(cover?.backdropPath ?? null, "original");
  const narrow = resolveBackdropUrl(cover?.backdropPath ?? null, "w780");

  return (
    <>
      <div
        aria-hidden={!cover}
        className="pointer-events-none absolute inset-x-0 top-0 aspect-video"
      >
        {narrow ? (
          <picture className="block h-full w-full">
            <source media="(min-width: 768px)" srcSet={wide ?? undefined} />
            <img
              src={narrow}
              alt={`Capa do perfil: ${cover?.title ?? ""}`}
              decoding="async"
              className="h-full w-full object-contain object-top opacity-[0.76]"
              style={FADE_MASK}
            />
          </picture>
        ) : (
          <div
            className="h-full w-full bg-gradient-to-br from-ink-700 via-ink-800 to-ink-950"
            style={FADE_MASK}
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/28 to-[#05050c]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/52 via-transparent to-[#05050c]/80" />
        <div className="absolute inset-0 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-[radial-gradient(120%_70%_at_50%_0%,rgba(124,77,255,0.14),transparent_62%)]" />
        <div
          className="absolute inset-0 opacity-[0.12] mix-blend-overlay"
          style={{ backgroundImage: NOISE_URL }}
        />
      </div>

      {isSelf && (
        <button
          type="button"
          onClick={onChangeCover}
          className="absolute right-4 top-[5.5rem] z-20 flex min-h-[44px] items-center gap-2 rounded-full border border-white/25 bg-black/40 px-5 text-sm font-semibold text-white backdrop-blur-xl transition-all duration-300 ease-ios hover:border-white/40 hover:bg-brand-500/30 active:scale-95 sm:right-6 lg:right-10 lg:top-24"
        >
          <FaImage size={13} />
          {cover ? "Alterar capa" : "Adicionar capa"}
        </button>
      )}
    </>
  );
};

export default ProfileCover;
