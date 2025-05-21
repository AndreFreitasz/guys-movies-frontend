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
      className="flex flex-col gap-4"
    >
      <Input
        type="date"
        label="Quando você assistiu?"
        value={watchedDate}
        onChange={(e) => setWatchedDate(e.target.value)}
        className="mt-2 font-mono"
      />
      <button
        type="submit"
        className="bg-indigo-600 text-white font-bold py-2 rounded hover:bg-indigo-700"
        disabled={loading}
      >
        {loading ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
};

export default BodyModalForm;
