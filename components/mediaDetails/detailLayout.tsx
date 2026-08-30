import { memo, ReactNode } from "react";

interface MediaDetailLayoutProps {
  backdropUrl: string;
  backdropAlt: string;
  poster: ReactNode;
  header: ReactNode;
  actions: ReactNode;
  details: ReactNode;
  children: ReactNode;
}

const MediaDetailLayout = memo(
  ({
    backdropUrl,
    backdropAlt,
    poster,
    header,
    actions,
    details,
    children,
  }: MediaDetailLayoutProps) => {
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

        <div className="relative z-10 mx-auto w-full max-w-[1600px] px-4 pb-16 pt-6 sm:px-6 sm:pt-8 lg:px-10">
          <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-[minmax(0,300px)_1fr] lg:items-start lg:gap-x-12 lg:gap-y-8">
            <div className="flex items-start gap-4 sm:gap-6 lg:contents">
              <div className="w-24 shrink-0 sm:w-36 lg:col-start-1 lg:row-start-1 lg:w-auto">
                {poster}
              </div>
              <div className="min-w-0 flex-1 lg:col-start-2 lg:row-start-1">
                {header}
              </div>
            </div>

            <div className="lg:col-start-2 lg:row-start-2">{actions}</div>

            <div className="flex flex-col gap-6 lg:col-start-2 lg:row-start-3 xl:gap-8">
              {children}
            </div>

            <div className="lg:col-span-1 lg:col-start-1 lg:row-span-2 lg:row-start-2">
              {details}
            </div>
          </div>
        </div>
      </section>
    );
  },
);

MediaDetailLayout.displayName = "MediaDetailLayout";

export default MediaDetailLayout;
