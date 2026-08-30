import React from "react";

interface CatalogErrorStateProps {
  title: string;
  message: string;
  onRetry: () => void;
}

const CatalogErrorState: React.FC<CatalogErrorStateProps> = ({
  title,
  message,
  onRetry,
}) => (
  <div className="mx-auto flex min-h-[60vh] w-full max-w-lg flex-col items-center justify-center px-4 text-center">
    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/15 text-2xl">
      ⚠️
    </span>
    <h1 className="mt-5 text-2xl font-black text-white">{title}</h1>
    <p className="mt-3 text-sm leading-relaxed text-white/45">{message}</p>
    <button
      type="button"
      onClick={onRetry}
      className="mt-7 rounded-2xl px-6 py-3 text-sm font-bold tracking-tight bg-white text-[#05050c] transition-all duration-300 ease-ios hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-[0_10px_30px_-12px_rgba(255,255,255,0.5)] active:translate-y-0 active:scale-[0.96]"
    >
      Tentar de novo
    </button>
  </div>
);

export default CatalogErrorState;
