import React from "react";
import { FaImage } from "react-icons/fa";
import { Cover, resolveBackdropUrl } from "../../interfaces/profile/types";

interface ProfileCoverProps {
  cover: Cover | null;
  isSelf: boolean;
  onChangeCover: () => void;
}

const BOTTOM_FADE = "linear-gradient(to top, transparent 1%, black 56%)";

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
  const narrow = resolveBackdropUrl(cover?.backdropPath ?? null, "w1280");

  return (
    <>
      <div
        aria-hidden={!cover}
        className="pointer-events-none absolute inset-x-0 top-0 aspect-video md:aspect-auto md:h-[62vh] md:max-h-[780px]"
      >
        {narrow ? (
          <>
            <div className="absolute inset-0 overflow-hidden">
              <img
                src={narrow}
                alt=""
                aria-hidden
                decoding="async"
                className="h-full w-full scale-125 object-cover opacity-50 blur-3xl"
              />
            </div>

            <picture className="relative block h-full w-full">
              <source media="(min-width: 768px)" srcSet={wide ?? undefined} />
              <img
                src={narrow}
                alt={`Capa do perfil: ${cover?.title ?? ""}`}
                decoding="async"
                className="mx-auto h-full w-full max-w-[1700px] object-contain object-top"
                style={FADE_MASK}
              />
            </picture>
          </>
        ) : (
          <div
            className="h-full w-full bg-linear-to-br from-ink-700 via-ink-800 to-ink-950"
            style={FADE_MASK}
          />
        )}

        <div className="absolute inset-0 bg-linear-to-t from-[#05050c] via-[#05050c]/45 to-transparent" />
      </div>

      {isSelf && (
        <button
          type="button"
          onClick={onChangeCover}
          className="absolute right-4 top-22 z-20 flex min-h-[44px] items-center gap-2 rounded-full border border-white/25 bg-black/40 px-5 text-sm font-semibold text-white backdrop-blur-xl transition-all duration-300 ease-ios hover:border-white/40 hover:bg-brand-500/30 active:scale-95 sm:right-6 lg:right-10 lg:top-24"
        >
          <FaImage size={13} />
          {cover ? "Alterar capa" : "Adicionar capa"}
        </button>
      )}
    </>
  );
};

export default ProfileCover;
