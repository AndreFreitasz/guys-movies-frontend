import React from "react";

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
      <label className="text-white font-semibold">
        Quando você assistiu?
        <input
          type="date"
          className="mt-2 p-2 rounded bg-gray-800 text-white w-full"
          value={watchedDate}
          onChange={(e) => setWatchedDate(e.target.value)}
        />
      </label>
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
