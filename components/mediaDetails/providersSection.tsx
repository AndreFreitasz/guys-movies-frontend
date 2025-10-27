import { memo } from "react";
import ProvidersMovie from "../movie/providers";
import { Providers } from "../../interfaces/movie/types";

interface MediaProvidersSectionProps {
  title: string;
  providers: Providers;
}

const MediaProvidersSection = memo(
  ({ title, providers }: MediaProvidersSectionProps) => {
    if (
      !providers?.flatrate?.length &&
      !providers?.buy?.length &&
      !providers?.rent?.length
    ) {
      return null;
    }

    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 xl:p-7 backdrop-blur-sm">
        <h2 className="text-xs font-semibold uppercase tracking-[0.35em] text-indigo-100">
          {title}
        </h2>
        <div className="mt-6">
          <ProvidersMovie
            flatrate={providers.flatrate}
            buy={providers.buy}
            rent={providers.rent}
          />
        </div>
      </div>
    );
  },
);

MediaProvidersSection.displayName = "MediaProvidersSection";

export default MediaProvidersSection;
