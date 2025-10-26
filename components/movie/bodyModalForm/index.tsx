import React from "react";
import Input from "../../_ui/form/input";

interface BodyModalFormProps {
  watchedDate: string;
  setWatchedDate: (date: string) => void;
  onSubmit: () => void;
  loading?: boolean;
}

const BodyModalForm: React.FC<BodyModalFormProps> = ({
  watchedDate,
  setWatchedDate,
  onSubmit,
  loading,
}) => {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex flex-col gap-5"
    >
      <p className="text-sm text-white/70">
        Conte pra gente quando você assistiu a este filme para manter seu
        histórico sempre em ordem.
      </p>
      <Input
        type="date"
        label="Quando você assistiu?"
        value={watchedDate}
        onChange={(e) => setWatchedDate(e.target.value)}
        className="mt-2 font-mono focus:ring-2 focus:ring-indigo-400/60"
      />
      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-5 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={loading}
      >
        {loading ? "Salvando..." : "Salvar momento"}
      </button>
    </form>
  );
};

export default BodyModalForm;
