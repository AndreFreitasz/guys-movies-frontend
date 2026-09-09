import React from "react";
import {
  WATCH_SOURCES_UI,
  WatchProviderOption,
  WatchSourceValue,
} from "../../constants/watchProviders";

export interface WatchSourceValueState {
  watchSource: WatchSourceValue | null;
  providerId: number | null;
}

interface WatchSourceSelectProps {
  availableProviders: WatchProviderOption[];
  value: WatchSourceValueState;
  onChange: (value: WatchSourceValueState) => void;
}

const optionClass = (active: boolean) =>
  `min-h-[44px] rounded-2xl border px-4 text-left text-sm transition ${
    active
      ? "border-indigo-400/60 bg-indigo-500/20 text-indigo-100"
      : "border-white/10 bg-white/[0.03] text-white/60 hover:text-white"
  }`;

const WatchSourceSelect: React.FC<WatchSourceSelectProps> = ({
  availableProviders,
  value,
  onChange,
}) => (
  <fieldset className="flex flex-col gap-2">
    <legend className="mb-2 text-xs uppercase tracking-[0.2em] text-white/45">
      Onde você assistiu
    </legend>
    <button
      type="button"
      aria-pressed={value.watchSource === null}
      onClick={() => onChange({ watchSource: null, providerId: null })}
      className={optionClass(value.watchSource === null)}
    >
      Não informado
    </button>
    {availableProviders.map((provider) => (
      <button
        key={provider.id}
        type="button"
        aria-pressed={value.providerId === provider.id}
        onClick={() =>
          onChange({ watchSource: "streaming", providerId: provider.id })
        }
        className={optionClass(value.providerId === provider.id)}
      >
        {provider.name}
      </button>
    ))}
    {WATCH_SOURCES_UI.map((source) => (
      <button
        key={source.value}
        type="button"
        aria-pressed={value.watchSource === source.value}
        onClick={() =>
          onChange({ watchSource: source.value, providerId: null })
        }
        className={optionClass(value.watchSource === source.value)}
      >
        {source.label}
      </button>
    ))}
  </fieldset>
);

export default WatchSourceSelect;
