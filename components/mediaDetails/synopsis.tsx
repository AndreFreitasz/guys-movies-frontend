import { memo } from "react";

interface MediaSynopsisProps {
  title: string;
  overview: string;
}

const MediaSynopsis = memo(({ title, overview }: MediaSynopsisProps) => {
  if (!overview?.trim()) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm sm:p-6 xl:p-7">
      <h2 className="text-xs font-semibold uppercase tracking-[0.35em] text-indigo-100">
        {title}
      </h2>
      <p className="mt-5 max-w-3xl text-sm leading-relaxed text-white/65 sm:text-base">
        {overview}
      </p>
    </div>
  );
});

MediaSynopsis.displayName = "MediaSynopsis";

export default MediaSynopsis;
