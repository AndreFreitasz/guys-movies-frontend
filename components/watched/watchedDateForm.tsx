import React, { useState } from "react";
import Input from "../_ui/form/input";

export type WatchedDateFormMode = "create" | "edit";

interface WatchedDateFormProps {
  initialDate: string | null;
  mode: WatchedDateFormMode;
  loading?: boolean;
  onSubmit: (isoDate: string) => void;
  onClear?: () => void;
}

const toInputValue = (value: string | null): string => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const WatchedDateForm: React.FC<WatchedDateFormProps> = ({
  initialDate,
  mode,
  loading,
  onSubmit,
  onClear,
}) => {
  const [date, setDate] = useState(() => toInputValue(initialDate));

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!date) return;
        onSubmit(new Date(`${date}T00:00:00`).toISOString());
      }}
      className="flex flex-col gap-5"
    >
      <p className="text-sm leading-relaxed text-white/45">
        {mode === "create"
          ? "Conte pra gente quando você assistiu para manter seu histórico sempre em ordem."
          : "Ajuste a data em que você assistiu, ou limpe o registro para deixá-la em branco."}
      </p>

      <Input
        type="date"
        label="Quando você assistiu?"
        value={date}
        max={new Date().toISOString().slice(0, 10)}
        onChange={(event) => setDate(event.target.value)}
        className="font-medium"
      />

      <button
        type="submit"
        disabled={loading || !date}
        className="flex h-12 items-center justify-center rounded-2xl text-sm font-bold tracking-tight bg-white text-[#05050c] transition-all duration-300 ease-ios hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-[0_10px_30px_-12px_rgba(255,255,255,0.5)] active:translate-y-0 active:scale-[0.96] disabled:pointer-events-none disabled:opacity-50"
      >
        {loading ? "Salvando..." : "Salvar momento"}
      </button>

      {mode === "edit" && onClear && (
        <button
          type="button"
          onClick={onClear}
          disabled={loading}
          className="flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-sm font-semibold text-white/70 transition-all duration-300 ease-ios hover:bg-white/[0.09] hover:text-white active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50"
        >
          Limpar data
        </button>
      )}
    </form>
  );
};

export default WatchedDateForm;
