// components/_ui/LoadingSpinner.tsx
import React from "react";

interface LoadingSpinnerProps {
  small?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({small}) => {
  return (
    <div className={small ? "flex justify-center items-center" : "flex justify-center items-center h-screen"}>
      <svg
        className={`animate-spin ${small ? "h-6 w-6" : "h-10 w-10"} text-indigo-600`}
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
          d="M4 12a8 8 0 018-8v8H4z"
        ></path>
      </svg>
    </div>
  );
};

export default LoadingSpinner;
