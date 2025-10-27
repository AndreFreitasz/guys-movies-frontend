import { memo } from "react";
import LoadingSpinner from "../_ui/loadingSpinner";
import { FaClock, FaEye } from "react-icons/fa";
import ReactStars from "react-stars";

interface ExperienceActionConfig {
  isActive: boolean;
  isLoading: boolean;
  onClick: () => void;
  title: string;
  activeLabel: string;
  inactiveLabel: string;
  icon: "eye" | "clock";
}

interface RatingConfig {
  title: string;
  description: string;
  value: number;
  onChange: (rating: number) => void;
  isClient: boolean;
}

interface MediaExperiencePanelProps {
  heading: string;
  description: string;
  watchedConfig: ExperienceActionConfig;
  waitingConfig: ExperienceActionConfig;
  ratingConfig: RatingConfig;
}

const iconMap = {
  eye: FaEye,
  clock: FaClock,
};

const MediaExperiencePanel = memo(
  ({
    heading,
    description,
    watchedConfig,
    waitingConfig,
    ratingConfig,
  }: MediaExperiencePanelProps) => {
    const renderButton = (config: ExperienceActionConfig) => {
      const IconComponent = iconMap[config.icon];
      const isActiveClass =
        config.icon === "eye"
          ? "bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30"
          : "bg-amber-400/20 text-amber-100 hover:bg-amber-400/25";

      const inactiveClass = "bg-white/5 text-white hover:bg-white/10";

      const baseClass = config.isActive ? isActiveClass : inactiveClass;

      return (
        <button
          type="button"
          onClick={config.onClick}
          disabled={config.isLoading}
          className={`group flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 text-left transition ${
            config.isLoading ? "opacity-70" : ""
          } ${baseClass}`}
        >
          {config.isLoading ? (
            <LoadingSpinner small />
          ) : (
            <IconComponent
              className={`text-xl transition duration-300 ${
                config.isActive
                  ? config.icon === "eye"
                    ? "text-emerald-200"
                    : "text-amber-200"
                  : "text-indigo-200"
              }`}
            />
          )}
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/60">
              {config.title}
            </p>
            <p className="text-sm font-semibold">
              {config.isActive ? config.activeLabel : config.inactiveLabel}
            </p>
          </div>
        </button>
      );
    };

    return (
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/20 via-indigo-400/10 to-transparent p-5 md:p-6 xl:p-7 backdrop-blur">
        <div className="flex flex-col gap-5 md:gap-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-[0.35em] text-indigo-100">
              {heading}
            </h2>
            <p className="text-xs text-white/60 md:max-w-sm">{description}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {renderButton(watchedConfig)}
            {renderButton(waitingConfig)}
          </div>

          <div className="rounded-2xl border border-white/5 bg-black/30 p-4 md:p-5 backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">
                  {ratingConfig.title}
                </p>
                <p className="text-xs text-white/60">
                  {ratingConfig.description}
                </p>
              </div>
              {ratingConfig.isClient && (
                <div className="flex items-center">
                  <ReactStars
                    count={5}
                    onChange={ratingConfig.onChange}
                    size={36}
                    color2="#F97316"
                    half
                    value={ratingConfig.value}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
);

MediaExperiencePanel.displayName = "MediaExperiencePanel";

export default MediaExperiencePanel;
