import React from "react";

interface LoadingSpinnerProps {
  small?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ small }) => {
  if (small) {
    return (
      <span className="inline-flex h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-white/20 border-t-indigo-400" />
    );
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5">
      <div className="relative h-14 w-14">
        <span className="absolute inset-0 animate-glow-pulse rounded-full bg-white/25 blur-xl" />
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-white/10 border-t-white" />
        <span
          className="absolute inset-2 animate-spin rounded-full border-2 border-white/5 border-b-white/50"
          style={{ animationDirection: "reverse", animationDuration: "1.4s" }}
        />
      </div>
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/35">
        Carregando
      </p>
    </div>
  );
};

export default LoadingSpinner;
