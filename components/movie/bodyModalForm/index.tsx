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
      <p className="text-sm leading-relaxed text-white/45">
        Conte pra gente quando você assistiu a este filme para manter seu
        histórico sempre em ordem.
      </p>
      <Input
        type="date"
        label="Quando você assistiu?"
        value={watchedDate}
        onChange={(e) => setWatchedDate(e.target.value)}
        className="font-medium"
      />
      <button
        type="submit"
        className="flex h-12 items-center justify-center rounded-2xl text-sm font-bold tracking-tight bg-white text-[#05050c] transition-all duration-300 ease-ios hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-[0_10px_30px_-12px_rgba(255,255,255,0.5)] active:translate-y-0 active:scale-[0.96] disabled:pointer-events-none disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Salvando..." : "Salvar momento"}
      </button>
    </form>
  );
};

export default BodyModalForm;
