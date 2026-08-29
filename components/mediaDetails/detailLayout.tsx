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
      <section className="relative isolate overflow-hidden bg-[#05050c] text-white">
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
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-[#05050c]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-[#05050c]" />
          <div className="absolute inset-0 backdrop-blur-[2px]" />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-col gap-10 px-4 pb-16 pt-8 sm:px-6 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,300px)_1fr] lg:gap-12">
            <aside className="mx-auto flex w-full max-w-[260px] flex-col gap-6 lg:mx-0 lg:max-w-none lg:gap-8">
              {aside}
            </aside>
            <div className="flex flex-col gap-10">{children}</div>
          </div>
        </div>
      </section>
    );
  },
);

MediaDetailLayout.displayName = "MediaDetailLayout";

export default MediaDetailLayout;
