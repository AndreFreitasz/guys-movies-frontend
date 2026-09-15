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

const EDGE_FADE =
  "linear-gradient(to right, transparent, #000 5%, #000 95%, transparent), linear-gradient(to bottom, transparent, #000 4%, #000 90%, transparent)";

const PLATE_MASK: React.CSSProperties = {
  WebkitMaskImage: EDGE_FADE,
  maskImage: EDGE_FADE,
  WebkitMaskComposite: "source-in",
  maskComposite: "intersect",
};

const ProfileCover: React.FC<ProfileCoverProps> = ({
  cover,
  isSelf,
  onChangeCover,
}) => {
  const wide = resolveBackdropUrl(cover?.backdropPath ?? null, 1280);
  const narrow = resolveBackdropUrl(cover?.backdropPath ?? null, 780);

  return (
    <div className="relative isolate -mt-[4.25rem] h-64 w-full overflow-hidden sm:h-[min(38vw,30rem)] lg:-mt-20">
      {narrow ? (
        <>
          <picture className="absolute inset-0 block">
            <source media="(min-width: 768px)" srcSet={wide ?? undefined} />
            <img
              src={narrow}
              alt=""
              aria-hidden="true"
              decoding="async"
              className="h-full w-full scale-125 object-cover opacity-60 blur-[64px] saturate-150"
            />
          </picture>

          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="relative aspect-video max-h-full max-w-full overflow-hidden"
              style={PLATE_MASK}
            >
              <picture className="block h-full w-full">
                <source media="(min-width: 768px)" srcSet={wide ?? undefined} />
                <img
                  src={narrow}
                  alt={`Capa do perfil: ${cover?.title ?? ""}`}
                  decoding="async"
                  className="h-full w-full object-contain"
                />
              </picture>
            </div>
          </div>
        </>
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-ink-700 via-ink-800 to-ink-950" />
      )}

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_50%,transparent_52%,rgba(5,5,12,0.7))]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-[#05050c] via-[#05050c]/35 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#05050c]/75 to-transparent" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14] mix-blend-overlay"
        style={{ backgroundImage: NOISE_URL }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,rgba(124,77,255,0.16),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-400/45 to-transparent" />

      {isSelf && (
        <button
          type="button"
          onClick={onChangeCover}
          className="absolute right-4 top-[5.5rem] flex min-h-[44px] items-center gap-2 rounded-full border border-white/25 bg-black/40 px-5 text-sm font-semibold text-white backdrop-blur-xl transition-all duration-300 ease-ios hover:border-white/40 hover:bg-brand-500/30 active:scale-95 sm:right-6 lg:right-10 lg:top-24"
        >
          <FaImage size={13} />
          {cover ? "Alterar capa" : "Adicionar capa"}
        </button>
      )}
    </div>
  );
};

export default ProfileCover;
