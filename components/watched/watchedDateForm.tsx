import React, { useState } from "react";
import { format } from "date-fns";
import DatePicker from "../_ui/form/datePicker";
import WatchSourceSelect, { WatchSourceValueState } from "./watchSourceSelect";
import CompanionPicker from "./companionPicker";
import { CompanionTarget, tagCompanions } from "../../utils/tagCompanions";
import { UserSummary } from "../../interfaces/profile/types";
import {
  WatchProviderOption,
  WatchSourceValue,
} from "../../constants/watchProviders";

export type WatchedDateFormMode = "create" | "edit";

export type { CompanionTarget };

interface WatchedDateFormProps {
  initialDate: string | null;
  mode: WatchedDateFormMode;
  availableProviders: WatchProviderOption[];
  initialWatchSource?: WatchSourceValue | null;
  initialProviderId?: number | null;
  loading?: boolean;
  companionTarget?: CompanionTarget;
  onSubmit: (
    isoDate: string | null,
    watchSource: WatchSourceValue | null | undefined,
    providerId: number | null,
  ) => void;
  onClear?: () => void;
}

const toInputValue = (value: string | null): string => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return format(date, "yyyy-MM-dd");
};

const WatchedDateForm: React.FC<WatchedDateFormProps> = ({
  initialDate,
  mode,
  availableProviders,
  initialWatchSource,
  initialProviderId,
  loading,
  companionTarget,
  onSubmit,
  onClear,
}) => {
  const [companions, setCompanions] = useState<UserSummary[]>([]);
  const [date, setDate] = useState(() => toInputValue(initialDate));
  const [watchSourceValue, setWatchSourceValue] =
    useState<WatchSourceValueState>({
      watchSource: initialWatchSource ?? null,
      providerId: initialProviderId ?? null,
    });
  const [watchSourceTouched, setWatchSourceTouched] = useState(false);

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();

        await onSubmit(
          date ? new Date(`${date}T00:00:00`).toISOString() : null,
          watchSourceTouched ? watchSourceValue.watchSource : undefined,
          watchSourceTouched ? watchSourceValue.providerId : null,
        );

        if (!companionTarget || companions.length === 0) return;

        await tagCompanions(companionTarget, companions);
        setCompanions([]);
      }}
      className="flex flex-col gap-5"
    >
      <p className="text-sm leading-relaxed text-white/45">
        {mode === "create"
          ? "Se lembrar quando assistiu, conte pra gente. A data é opcional."
          : "Ajuste a data em que você assistiu, ou limpe o registro para deixá-la em branco."}
      </p>

      <DatePicker
        id="watched-date"
        label="Quando você assistiu?"
        value={date}
        max={format(new Date(), "yyyy-MM-dd")}
        onChange={setDate}
        helper="Pode deixar em branco se não lembrar."
      />

      <WatchSourceSelect
        availableProviders={availableProviders}
        value={watchSourceValue}
        onChange={(value) => {
          setWatchSourceTouched(true);
          setWatchSourceValue(value);
        }}
      />

      {companionTarget && (
        <CompanionPicker value={companions} onChange={setCompanions} />
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex h-12 items-center justify-center rounded-2xl text-sm font-bold tracking-tight bg-white text-[#05050c] transition-all duration-300 ease-ios hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-[0_10px_30px_-12px_rgba(255,255,255,0.5)] active:translate-y-0 active:scale-[0.96] disabled:pointer-events-none disabled:opacity-50"
      >
        {loading ? "Salvando..." : "Salvar momento"}
      </button>

      {mode === "edit" && onClear && (
        <button
          type="button"
          onClick={onClear}
          disabled={loading}
          className="flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/4 text-sm font-semibold text-white/70 transition-all duration-300 ease-ios hover:bg-white/9 hover:text-white active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50"
        >
          Limpar data
        </button>
      )}
    </form>
  );
};

export default WatchedDateForm;
