import { memo } from "react";
import { CastMember } from "../../interfaces/movie/types";

interface MediaCastSectionProps {
  title: string;
  cast: CastMember[];
  maxItems?: number;
}

const MediaCastSection = memo(
  ({ title, cast, maxItems = 8 }: MediaCastSectionProps) => {
    if (!cast?.length) {
      return null;
    }

    const visibleCast = cast.slice(0, maxItems);

    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 xl:p-7 backdrop-blur-sm">
        <h2 className="text-xs font-semibold uppercase tracking-[0.35em] text-indigo-100">
          {title}
        </h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {visibleCast.map((member) => (
            <div
              key={`${member.name}-${member.character}`}
              className="flex items-start gap-3 rounded-2xl bg-white/5 p-3"
            >
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border border-white/10 bg-black/40">
                {member.profile_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w185${member.profile_path}`}
                    alt={member.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-xs font-semibold uppercase text-white/60">
                    {member.name.substring(0, 2)}
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <p className="break-words text-sm font-semibold leading-snug text-white">
                  {member.name}
                </p>
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                  {member.character}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
);

MediaCastSection.displayName = "MediaCastSection";

export default MediaCastSection;
