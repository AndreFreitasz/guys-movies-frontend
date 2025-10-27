import { memo, ReactNode } from "react";

interface MediaDetailLayoutProps {
  backdropUrl: string;
  backdropAlt: string;
  children: ReactNode;
  aside: ReactNode;
}

const MediaDetailLayout = memo(
  ({ backdropUrl, backdropAlt, aside, children }: MediaDetailLayoutProps) => {
    return (
      <section className="relative isolate overflow-hidden bg-[#050812] text-white">
        <div className="absolute inset-0">
          <img
            src={backdropUrl}
            alt={backdropAlt}
            className="block h-[350px] w-full object-cover object-top opacity-40 sm:h-[500px] md:h-[600px] lg:h-[700px]"
            style={{
              WebkitMaskImage:
                "linear-gradient(to top, transparent 0%, black 100%)",
              maskImage: "linear-gradient(to top, transparent 0%, black 100%)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-[#050812]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-[#050812]" />
          <div className="absolute inset-0 backdrop-blur-[2px]" />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 pb-16 pt-20 sm:px-5 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,300px)_1fr]">
            <aside className="flex flex-col gap-8">{aside}</aside>
            <div className="flex flex-col gap-10">{children}</div>
          </div>
        </div>
      </section>
    );
  },
);

MediaDetailLayout.displayName = "MediaDetailLayout";

export default MediaDetailLayout;
