import React from "react";

type ButtonSubmitProps = {
  label: string;
  className?: string;
  isLoading?: boolean;
};

const ButtonSubmit: React.FC<ButtonSubmitProps> = ({
  label,
  className,
  isLoading,
}) => {
  return (
    <div className="flex justify-end">
      <button
        disabled={isLoading}
        type="submit"
        className={`bg-indigo-600 mt-8 hover:bg-indigo-700 w-28 text-white font-bold py-2 px-4 border-b-4 border-indigo-700 rounded transform transition duration-200 ease-in-out hover:-translate-y-1 hover:scale-110 ${className}`}
      >
        {isLoading ? (
          <svg
            className="animate-spin h-5 w-5 text-white mx-auto"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            ></path>
          </svg>
        ) : (
          label
        )}
      </button>
    </div>
  );
};

export default ButtonSubmit;
